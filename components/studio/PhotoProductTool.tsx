import { useEffect, useRef, useState } from 'react'
import { IntentButton, useClient } from 'sanity'
import { Box, Button, Card, Container, Flex, Heading, Select, Spinner, Stack, Text, TextArea, TextInput } from '@sanity/ui'
import { ImageIcon, SparklesIcon } from '@sanity/icons'
import type { ProductSuggestion } from '@/app/api/studio/suggest/route'

type Collection = { _id: string; slug: string; nameFR: string }
type Form = Omit<ProductSuggestion, 'priceReason' | 'price'> & { price: string }
type Step = 'photo' | 'analysing' | 'form' | 'saving' | 'done'

const EMPTY_FORM: Form = { nameFR: '', nameEN: '', descriptionFR: '', descriptionEN: '', collectionSlug: '', price: '' }
const AI_IMAGE_SIZE = 1024

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
    img.onerror = () => reject(new Error('Format de photo non pris en charge (essayez JPEG ou PNG)'))
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
  const fileInput = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('photo')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [priceReason, setPriceReason] = useState('')
  const [collections, setCollections] = useState<Collection[]>([])
  const [error, setError] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  useEffect(() => {
    client
      .fetch<Collection[]>(`*[_type == "collection" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current, nameFR } | order(nameFR asc)`)
      .then(setCollections)
  }, [client])

  function reset() {
    if (preview) URL.revokeObjectURL(preview)
    setStep('photo')
    setFile(null)
    setPreview(null)
    setForm(EMPTY_FORM)
    setPriceReason('')
    setError(null)
    setCreatedId(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (!picked) return
    setError(null)
    setFile(picked)
    setPreview(URL.createObjectURL(picked))
    setStep('analysing')

    try {
      const image = await resizeForAi(picked)
      const res = await fetch('/api/studio/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${client.config().token ?? ''}` },
        body: JSON.stringify({ image }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "L'analyse a échoué")
      const { priceReason: reason, price, ...rest } = data as ProductSuggestion
      setForm({ ...rest, price: String(price) })
      setPriceReason(reason)
    } catch (err) {
      setError(`${err instanceof Error ? err.message : err} — vous pouvez remplir la fiche à la main.`)
    }
    setStep('form')
  }

  function update(field: keyof Form) {
    return (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.currentTarget.value }))
  }

  async function createDraft() {
    const price = Number(form.price.replace(',', '.'))
    const collection = collections.find((c) => c.slug === form.collectionSlug)
    if (!file || !form.nameFR.trim() || !(price > 0) || !collection) {
      setError('Il faut au minimum une photo, un nom français, un prix et une collection.')
      return
    }
    setError(null)
    setStep('saving')

    try {
      const base = slugify(form.nameFR) || 'bijou'
      const taken = await client.fetch<string[]>(`*[_type == "product" && slug.current match $pattern].slug.current`, {
        pattern: `${base}*`,
      })
      let slug = base
      for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`

      const asset = await client.assets.upload('image', file, { filename: file.name })
      const id = crypto.randomUUID()
      await client.create({
        _id: `drafts.${id}`,
        _type: 'product',
        nameFR: form.nameFR.trim(),
        nameEN: form.nameEN.trim() || form.nameFR.trim(),
        slug: { _type: 'slug', current: slug },
        descriptionFR: toBlocks(form.descriptionFR),
        descriptionEN: toBlocks(form.descriptionEN),
        price,
        images: [{ _type: 'image', _key: randomKey(), asset: { _type: 'reference', _ref: asset._id } }],
        collection: { _type: 'reference', _ref: collection._id },
        inStock: true,
        isSoldOut: false,
        isCustom: false,
      })
      setCreatedId(id)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep('form')
    }
  }

  return (
    <Container width={1} padding={4}>
      <Stack space={5}>
        <Stack space={3}>
          <Heading size={3}>Nouveau bijou</Heading>
          <Text muted size={1}>
            Prenez une photo : l&apos;IA propose le nom, la description, la collection et le prix. Vous relisez, puis un
            brouillon est créé — il n&apos;apparaît sur le site qu&apos;après « Publish ».
          </Text>
        </Stack>

        <input ref={fileInput} type="file" accept="image/*" capture="environment" hidden onChange={handlePhoto} />

        {step === 'photo' && (
          <Button
            icon={ImageIcon}
            text="Prendre une photo"
            tone="primary"
            padding={4}
            fontSize={2}
            onClick={() => fileInput.current?.click()}
          />
        )}

        {preview && (
          <Card radius={2} overflow="hidden" border>
            <img src={preview} alt="" style={{ display: 'block', width: '100%', maxHeight: 360, objectFit: 'contain' }} />
          </Card>
        )}

        {step === 'analysing' && (
          <Flex align="center" gap={3}>
            <Spinner />
            <Text>L&apos;IA analyse la photo…</Text>
          </Flex>
        )}

        {error && (
          <Card tone="critical" padding={3} radius={2}>
            <Text size={1}>{error}</Text>
          </Card>
        )}

        {(step === 'form' || step === 'saving') && (
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
            <Flex gap={3}>
              <Button mode="ghost" text="Recommencer" onClick={reset} disabled={step === 'saving'} />
              <Box flex={1}>
                <Button
                  icon={SparklesIcon}
                  tone="positive"
                  text={step === 'saving' ? 'Création…' : 'Créer le brouillon'}
                  style={{ width: '100%' }}
                  disabled={step === 'saving'}
                  onClick={createDraft}
                />
              </Box>
            </Flex>
          </Stack>
        )}

        {step === 'done' && createdId && (
          <Card tone="positive" padding={4} radius={2}>
            <Stack space={4}>
              <Text weight="semibold">Brouillon créé ✓</Text>
              <Text size={1}>Ouvrez-le pour vérifier, puis cliquez sur « Publish » pour le mettre en ligne.</Text>
              <Flex gap={3}>
                <IntentButton intent="edit" params={{ id: createdId, type: 'product' }} text="Ouvrir le brouillon" tone="primary" />
                <Button mode="ghost" text="Nouveau bijou" onClick={reset} />
              </Flex>
            </Stack>
          </Card>
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
