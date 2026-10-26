import { useEffect, useRef, useState } from 'react'
import { IntentButton, useClient } from 'sanity'
import { Box, Button, Card, Container, Flex, Grid, Heading, Select, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import { CloseIcon, ImageIcon, PublishIcon, SparklesIcon, StarIcon, UploadIcon } from '@sanity/icons'
import type { ProductSuggestion } from '@/app/api/studio/suggest/route'

type Collection = { _id: string; slug: string; nameFR: string }
type Photo = { file: File; preview: string }
type Form = Omit<ProductSuggestion, 'priceReason' | 'price'> & { price: string }
type Busy = null | 'ai' | 'draft' | 'publish'
type Created = { id: string; slug: string; published: boolean }

const EMPTY_FORM: Form = { nameFR: '', nameEN: '', descriptionFR: '', descriptionEN: '', collectionSlug: '', price: '' }
const AI_IMAGE_SIZE = 1024
const MAX_AI_PHOTOS = 4
const MAX_PHOTOS = 8

const randomKey = () => Math.random().toString(36).slice(2, 10)

// Photo réduite pour l'IA (plus rapide et moins chère) ; l'original est envoyé à Sanity
function resizeForAi(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, AI_IMAGE_SIZE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error(`Format de photo non pris en charge : ${file.name} (essayez JPEG ou PNG)`))
    img.src = URL.createObjectURL(file)
  })
}

function toBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      _key: randomKey(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: randomKey(), text: paragraph, marks: [] }],
    }))
}

// « Collier Lune - Élégance en Quartz » → « collier-lune »
function slugify(name: string) {
  return name
    .split(' - ')[0]
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export default function PhotoProductTool() {
  const client = useClient({ apiVersion: '2024-01-01' })
  const cameraInput = useRef<HTMLInputElement>(null)
  const galleryInput = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [form, setForm] = useState<Form | null>(null)
  const [priceReason, setPriceReason] = useState('')
  const [request, setRequest] = useState('')
  const [collections, setCollections] = useState<Collection[]>([])
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<Created | null>(null)

  useEffect(() => {
    client
      .fetch<Collection[]>(`*[_type == "collection" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current, nameFR } | order(nameFR asc)`)
      .then(setCollections)
  }, [client])

  function reset() {
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
    setForm(null)
    setPriceReason('')
    setRequest('')
    setError(null)
    setCreated(null)
  }

  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    setPhotos((prev) =>
      [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))].slice(0, MAX_PHOTOS)
    )
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  function makeMain(index: number) {
    setPhotos((prev) => [prev[index], ...prev.filter((_, i) => i !== index)])
  }

  // Première analyse, ou modification de la fiche actuelle selon la demande
  async function askAi() {
    setError(null)
    setBusy('ai')
    try {
      const images = await Promise.all(photos.slice(0, MAX_AI_PHOTOS).map((p) => resizeForAi(p.file)))
      const current = form && { ...form, price: Number(form.price.replace(',', '.')) || 0 }
      const res = await fetch('/api/studio/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${client.config().token ?? ''}` },
        body: JSON.stringify({ images, current, instruction: request }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "L'IA n'a pas répondu")
      const { priceReason: reason, price, ...rest } = data as ProductSuggestion
      setForm({ ...rest, price: String(price) })
      setPriceReason(reason)
      setRequest('')
    } catch (err) {
      setError(`${err instanceof Error ? err.message : err}${form ? '' : ' — vous pouvez remplir la fiche à la main.'}`)
      if (!form) setForm(EMPTY_FORM)
    }
    setBusy(null)
  }

  function update(field: keyof Form) {
    return (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.currentTarget.value
      setForm((prev) => prev && { ...prev, [field]: value })
    }
  }

  async function save(publish: boolean) {
    if (!form) return
    const price = Number(form.price.replace(',', '.'))
    const collection = collections.find((c) => c.slug === form.collectionSlug)
    if (!photos.length || !form.nameFR.trim() || !(price > 0) || !collection) {
      setError('Il faut au minimum une photo, un nom français, un prix et une collection.')
      return
    }
    if (publish && !window.confirm(`Publier « ${form.nameFR.trim()} » à ${price} € sur sophscraft.com ?`)) return
    setError(null)
    setBusy(publish ? 'publish' : 'draft')

    try {
      const base = slugify(form.nameFR) || 'bijou'
      const taken = await client.fetch<string[]>(`*[_type == "product" && slug.current match $pattern].slug.current`, {
        pattern: `${base}*`,
      })
      let slug = base
      for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`

      const assets = await Promise.all(
        photos.map((p) => client.assets.upload('image', p.file, { filename: p.file.name }))
      )
      const id = crypto.randomUUID()
      await client.create({
        // Sans le préfixe « drafts. », le document est publié immédiatement
        _id: publish ? id : `drafts.${id}`,
        _type: 'product',
        nameFR: form.nameFR.trim(),
        nameEN: form.nameEN.trim() || form.nameFR.trim(),
        slug: { _type: 'slug', current: slug },
        descriptionFR: toBlocks(form.descriptionFR),
        descriptionEN: toBlocks(form.descriptionEN),
        price,
        images: assets.map((asset) => ({
          _type: 'image',
          _key: randomKey(),
          asset: { _type: 'reference', _ref: asset._id },
        })),
        collection: { _type: 'reference', _ref: collection._id },
        inStock: true,
        isSoldOut: false,
        isCustom: false,
      })
      setCreated({ id, slug, published: publish })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setBusy(null)
  }

  if (created) {
    return (
      <Container width={1} padding={4}>
        <Card tone="positive" padding={4} radius={2}>
          <Stack space={4}>
            <Text weight="semibold">{created.published ? 'Bijou publié sur le site ✓' : 'Brouillon créé ✓'}</Text>
            <Text size={1}>
              {created.published
                ? 'Il apparaît sur sa page tout de suite, et dans les listes de collections sous une minute.'
                : 'Ouvrez-le pour vérifier, puis cliquez sur « Publish » pour le mettre en ligne.'}
            </Text>
            <Flex gap={3} wrap="wrap">
              {created.published && (
                <Button
                  as="a"
                  href={`/products/${created.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  text="Voir sur le site"
                  tone="primary"
                />
              )}
              <IntentButton
                intent="edit"
                params={{ id: created.id, type: 'product' }}
                text="Ouvrir dans le Studio"
                mode={created.published ? 'ghost' : 'default'}
                tone="primary"
              />
              <Button mode="ghost" text="Nouveau bijou" onClick={reset} />
            </Flex>
          </Stack>
        </Card>
      </Container>
    )
  }

  return (
    <Container width={1} padding={4}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>Nouveau bijou</Heading>
          <Text muted size={1}>
            Ajoutez une ou plusieurs photos, l&apos;IA propose la fiche. Corrigez-la à la main ou demandez une
            modification à l&apos;IA, puis publiez.
          </Text>
        </Stack>

        <input ref={cameraInput} type="file" accept="image/*" capture="environment" hidden onChange={addPhotos} />
        <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={addPhotos} />

        <Stack space={3}>
          {photos.length > 0 && (
            <Grid columns={[2, 3, 4]} gap={2}>
              {photos.map((photo, index) => (
                <Card key={photo.preview} radius={2} overflow="hidden" border style={{ position: 'relative' }}>
                  <img
                    src={photo.preview}
                    alt=""
                    style={{ display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover' }}
                  />
                  <Flex gap={1} padding={1} style={{ position: 'absolute', top: 0, right: 0 }}>
                    {index > 0 && (
                      <Button icon={StarIcon} mode="bleed" tone="default" title="Photo principale" onClick={() => makeMain(index)} />
                    )}
                    <Button icon={CloseIcon} mode="bleed" tone="critical" title="Retirer" onClick={() => removePhoto(index)} />
                  </Flex>
                  {index === 0 && (
                    <Card tone="primary" paddingX={2} paddingY={1} style={{ position: 'absolute', bottom: 0, left: 0 }}>
                      <Text size={0}>Principale</Text>
                    </Card>
                  )}
                </Card>
              ))}
            </Grid>
          )}
          {photos.length < MAX_PHOTOS && (
            <Flex gap={2}>
              <Box flex={1}>
                <Button
                  icon={ImageIcon}
                  text={photos.length ? 'Ajouter une photo' : 'Prendre une photo'}
                  tone="primary"
                  mode={photos.length ? 'ghost' : 'default'}
                  padding={4}
                  style={{ width: '100%' }}
                  onClick={() => cameraInput.current?.click()}
                />
              </Box>
              <Button icon={UploadIcon} text="Galerie" mode="ghost" padding={4} onClick={() => galleryInput.current?.click()} />
            </Flex>
          )}
          {photos.length > MAX_AI_PHOTOS && (
            <Text size={1} muted>
              L&apos;IA regarde les {MAX_AI_PHOTOS} premières photos ; toutes seront publiées.
            </Text>
          )}
        </Stack>

        {photos.length > 0 && (
          <Card padding={3} radius={2} tone="transparent" border>
            <Stack space={3}>
              <Text size={1} weight="semibold">
                {form ? "Demander une modification à l'IA" : "Précision pour l'IA (facultatif)"}
              </Text>
              <TextInput
                value={request}
                placeholder={
                  form
                    ? 'Ex. : description plus courte, c’est de l’argent 925, prix autour de 35 €…'
                    : 'Ex. : améthyste et acier inoxydable, pour un cadeau de naissance…'
                }
                onChange={(e) => setRequest(e.currentTarget.value)}
                onKeyDown={(e) => e.key === 'Enter' && !busy && (form ? request.trim() : true) && askAi()}
              />
              <Button
                icon={SparklesIcon}
                text={form ? 'Modifier avec l’IA' : 'Analyser avec l’IA'}
                tone="primary"
                loading={busy === 'ai'}
                disabled={Boolean(busy) || (Boolean(form) && !request.trim())}
                onClick={askAi}
              />
            </Stack>
          </Card>
        )}

        {error && (
          <Card tone="critical" padding={3} radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {form && (
          <Stack space={4}>
            <Field label="Nom (FR) *">
              <TextInput value={form.nameFR} onChange={update('nameFR')} />
            </Field>
            <Field label="Nom (EN)">
              <TextInput value={form.nameEN} onChange={update('nameEN')} />
            </Field>
            <Field label="Description (FR)">
              <TextArea rows={4} value={form.descriptionFR} onChange={update('descriptionFR')} />
            </Field>
            <Field label="Description (EN)">
              <TextArea rows={4} value={form.descriptionEN} onChange={update('descriptionEN')} />
            </Field>
            <Field label="Collection *">
              <Select value={form.collectionSlug} onChange={update('collectionSlug')}>
                <option value="">Choisir…</option>
                {collections.map((c) => (
                  <option key={c._id} value={c.slug}>
                    {c.nameFR}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Prix (€) *" hint={priceReason && `Suggestion de l'IA : ${priceReason}`}>
              <TextInput inputMode="decimal" value={form.price} onChange={update('price')} />
            </Field>

            <Stack space={2}>
              <Button
                icon={PublishIcon}
                tone="positive"
                padding={4}
                text="Publier sur le site"
                loading={busy === 'publish'}
                disabled={Boolean(busy)}
                onClick={() => save(true)}
              />
              <Flex gap={2}>
                <Box flex={1}>
                  <Button
                    mode="ghost"
                    text="Enregistrer en brouillon"
                    loading={busy === 'draft'}
                    style={{ width: '100%' }}
                    disabled={Boolean(busy)}
                    onClick={() => save(false)}
                  />
                </Box>
                <Button mode="bleed" tone="critical" text="Recommencer" disabled={Boolean(busy)} onClick={reset} />
              </Flex>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <Stack space={2}>
      <Text size={1} weight="semibold">
        {label}
      </Text>
      {children}
      {hint && (
        <Text size={1} muted>
          {hint}
        </Text>
      )}
    </Stack>
  )
}
