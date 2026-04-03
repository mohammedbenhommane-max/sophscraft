/**
 * scripts/clean-csv.ts
 *
 * Lit data/products.csv (export Shopify brut), nettoie les données et écrit
 * data/products-clean.csv avec :
 *   - Suppression des produits qty ≤ 0, draft, handles blacklistés
 *   - Suppression des doublons / articles corrompus (HTML ChatGPT)
 *   - Harmonisation des titres (ajout du type bijou en préfixe)
 */

import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

// ---------------------------------------------------------------------------
// Helpers CSV
// ---------------------------------------------------------------------------

function csvField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function serializeRow(headers: string[], record: Record<string, string>): string {
  return headers.map((h) => csvField(record[h] ?? '')).join(',')
}

// ---------------------------------------------------------------------------
// Filtres
// ---------------------------------------------------------------------------

/** Handles à supprimer inconditionnellement (doublons, service, carte cadeau) */
const REMOVE_HANDLES = new Set([
  // Carte cadeau / service
  'gift-card',
  'rendez-vous-pour-conception-et-personnalisation-de-bijoux',
  // Doublons redondants
  'sopnia',          // doublon corrompu de sonia-1
  'sonia',           // doublon corrompu de sonia-2
  'summer-vibes',    // doublon corrompu (HTML ChatGPT)
  'summer-vibes-3',  // doublon exact de summer-vibes-2 (rhodonite)
  'ibiza',           // doublon moins complet de ibiza-1
  'elegance-pink',   // HTML ChatGPT (Pinki)
  'maeva',           // HTML ChatGPT
  'collection-summer-vibes', // doublon de summer-vibes-4 (aigue-marine)
])

function isCorruptedHTML(html: string): boolean {
  return html.includes('data-testid="conversation-turn"')
}

// ---------------------------------------------------------------------------
// Corrections de titres : handle → nouveau titre propre
// ---------------------------------------------------------------------------

const TITLE_FIXES: Record<string, string> = {
  // Colliers
  'glamour':               'Collier Glamour',
  'cristaline':            'Collier Cristaline',
  'sonia-2':               'Collier Sonia',
  'julia-w':               'Collier Julia W',
  'julia':                 'Collier Julia',
  'mila':                  'Collier Mila',
  'maldives':              'Collier Maldives',
  'tahiti':                'Collier Tahiti',
  'mariane':               'Collier Mariane',
  'lyon':                  'Collier Lyon',
  'valence':               'Collier Valence',
  'pauline':               'Collier Pauline',
  'terranova':             'Collier Terranova',
  'feminite-absolue':      'Collier Féminité Absolue',
  'sans-titre-10mars_19-35': 'Collier Lueur Nacrée',
  'lilas':                 'Collier Lilas',
  'mayssa':                'Collier Mayssa',
  'perle-unique':          'Collier Perle Unique',
  'lily':                  'Collier Lily',
  'laura':                 'Collier Laura',
  'oasis-turquoise':       'Collier Oasis',
  'mysteres-de-venise':    'Collier Mystères de Venise',
  'tera':                  'Collier Tera',
  'etoiles-perdue':        'Collier Étoiles Perdues',

  // Boucles d'oreilles
  'rome':                  "Boucles d'Oreilles Rome",
  'ghislaine':             "Boucles d'Oreilles Ghislaine",
  'sonia-1':               "Boucles d'Oreilles Sonia",
  'ubud':                  "Boucles d'Oreilles Ubud",
  'san-fransisco':         "Boucles d'Oreilles San-Francisco",
  'sophie':                "Boucles d'Oreilles Sophie",
  'finesse-et-eclat':      "Boucles d'Oreilles Finesse et Éclat",
  'mirror':                "Boucles d'Oreilles Mirror",
  'mira':                  "Boucles d'Oreilles Mira",
  'harmony':               "Boucles d'Oreilles Harmony",
  'rainbow':               "Boucles d'Oreilles Rainbow",

  // Bracelets
  'violet-de-venise':      'Bracelet Violet de Venise',
  'romance-de-florence':   'Bracelet Romance de Florence',
  'jade-kyoto':            'Bracelet Jade Kyoto',
  'classic-gold-elegance': 'Bracelet Snow White',
  'harmonie':              'Bracelet Harmonie',
  'summer-vibes-1':        'Bracelet Summer Vibes - Citrine',
  'summer-vibes-2':        'Bracelet Summer Vibes - Rhodonite',
  'summer-vibes-4':        'Bracelet Summer Vibes - Aigue-Marine',
  'summer-vibes-5':        'Bracelet Summer Vibes - Grenat',

  // Bagues
  'venise':                'Bague Venise',
  'trefle-de-fortune':     'Bague Trèfle de Fortune',
  'dolce-4':               'Bague Dolce',
}

// ---------------------------------------------------------------------------
// Corrections de descriptions : handle → HTML propre
// Utilisé pour les descriptions vides, trop courtes ou en anglais
// ---------------------------------------------------------------------------

const DESCRIPTION_FIXES: Record<string, string> = {
  // Description vide
  'hand-made-bracelet-tourmaline-et-acier-inoxydable-avec-chaine-dextension': `<p>Découvrez ce bracelet fait main, alliant la beauté naturelle des pierres de tourmaline multicolores à la durabilité de l'acier inoxydable. Chaque perle est unique, arborant des teintes qui voyagent du vert lumineux au rose vibrant en passant par des nuances de bleu profond, reflets de la richesse minérale de la terre.</p><p>La chaîne d'extension permet d'ajuster le bracelet à votre poignet pour un confort optimal. Un bijou artisanal authentique, fabriqué avec soin par SophsCraft — idéal pour sublimer votre quotidien ou offrir un cadeau d'exception.</p><p><strong>Caractéristiques :</strong><br>Matière : Tourmaline naturelle et acier inoxydable<br>Fermeture : Chaîne d'extension dorée</p>`,

  // Trop court (107 cars)
  'tera': `<p>Découvrez l'élégance naturelle du Collier Tera, une pièce artisanale qui traverse les continents et les époques. Ce collier raffiné arbore une séquence harmonieuse de perles multicolores, évoquant les teintes profondes de la terre et les reflets changeants de la mer.</p><p>Chaque perle est soigneusement sélectionnée pour sa couleur et son éclat singulier, créant un bijou qui raconte une histoire de beauté naturelle. Polyvalent et intemporel, il se porte aussi bien au quotidien que pour une soirée habillée.</p><p><strong>Caractéristiques :</strong><br>Matière : Pierres semi-précieuses multicolores et acier inoxydable<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court (132 cars) + fin de phrase coupée
  'etoiles-perdue': `<p>Découvrez la beauté brute et mystérieuse du Collier Étoiles Perdues. Composé de pierres semi-précieuses œil de tigre ambrées, ce bijou artisanal capture l'essence lumineuse des étoiles dans ses reflets dorés et chatoyants.</p><p>Chaque pierre est unique, révélant des motifs naturels qui rappellent la profondeur du cosmos et la magie des nuits étoilées. L'œil de tigre est réputé pour apporter confiance, courage et clarté d'esprit à celle qui le porte.</p><p><strong>Caractéristiques :</strong><br>Matière : Œil de tigre naturel et acier inoxydable<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court (138 cars)
  'harmonie': `<p>Laissez-vous envoûter par la délicatesse du Bracelet Harmonie. Ce bijou raffiné en acier inoxydable est orné de perles semi-précieuses d'améthyste aux nuances violettes apaisantes, symboles de sagesse, de sérénité et d'équilibre intérieur.</p><p>La finesse de sa conception en fait un accessoire polyvalent, aussi bien adapté au quotidien qu'aux occasions spéciales. Portez-le seul pour un look épuré ou superposé avec d'autres bracelets pour un effet plus audacieux.</p><p><strong>Caractéristiques :</strong><br>Matière : Améthyste naturelle et acier inoxydable<br>Longueur : ajustable avec chaîne d'extension</p>`,

  // Trop court + en anglais (157 cars)
  'dolce-4': `<p>La Bague Dolce est une pièce chic en argent sterling 925, ornée d'une délicate courbe de pierres scintillantes. Alliant minimalisme élégant et raffinement contemporain, ce bijou capture la lumière à chaque mouvement pour un effet subtilement lumineux.</p><p>Idéale pour une élégance quotidienne ou pour sublimer une tenue de soirée, cette bague s'adapte à tous les styles. Sa conception soignée en fait un accessoire intemporel, parfait pour se faire plaisir ou offrir.</p><p><strong>Caractéristiques :</strong><br>Matière : Argent sterling 925<br>Taille : Ajustable</p>`,

  // En anglais (175 cars)
  'mira': `<p>Les Boucles d'Oreilles Mira sont de belles créoles en argent sterling 925, épurées et résolument contemporaines. Leur finition polie et leur forme intemporelle en font un accessoire essentiel de toute collection de bijoux.</p><p>Légères et confortables, elles s'adaptent à toutes les tenues — du look décontracté à la soirée habillée. Un classique indémodable qui apporte une touche d'élégance discrète à chaque instant.</p><p><strong>Caractéristiques :</strong><br>Matière : Argent sterling 925<br>Fermeture : Système à pression sécurisé</p>`,

  // En anglais (202 cars)
  'mirror': `<p>Les Boucles d'Oreilles Mirror sont de majestueuses créoles en argent sterling 925, avec une forme circulaire lisse de 41 mm. Conçues pour capter la lumière et créer un halo lumineux autour de votre visage, elles apportent une touche de glamour à toutes vos tenues.</p><p>Légères malgré leur présence affirmée, elles sont parfaites pour toutes les occasions. Un statement piece qui allie audace et élégance, signé SophsCraft.</p><p><strong>Caractéristiques :</strong><br>Matière : Argent sterling 925<br>Diamètre : 41 mm<br>Fermeture : Anneau à ressort</p>`,

  // Trop court (225 cars)
  'laura': `<p>Illuminez votre garde-robe avec le Collier Laura, une pièce qui allie simplicité et touches de couleur vivifiantes. Ce bijou délicat mais audacieux est conçu pour apporter une étincelle de joie et de légèreté à votre quotidien.</p><p>La qualité artisanale SophsCraft se retrouve dans chaque détail — des perles soigneusement sélectionnées aux finitions dorées qui rehaussent l'ensemble. À porter seul pour un look épuré ou superposé avec d'autres colliers pour plus d'audace.</p><p><strong>Caractéristiques :</strong><br>Matière : Pierres naturelles et acier inoxydable doré<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court (240 cars)
  'etincelle-multicolore': `<p>Un mariage parfait entre élégance classique et fantaisie colorée, le collier Étincelle Multicolore est une explosion de joie portée autour du cou. Chaque créole est agrémentée d'un charmant pendentif en forme de coquillage, méticuleusement incrusté de gemmes multicolores qui captent la lumière sous tous les angles.</p><p>Ces boucles d'oreilles uniques allient l'artisanat précis à une exubérance joyeuse, parfaites pour affirmer votre personnalité lors de toutes les occasions. Un bijou qui ne passe pas inaperçu.</p><p><strong>Caractéristiques :</strong><br>Matière : Alliage doré et pierres de couleur<br>Style : Créoles avec pendentif coquillage</p>`,

  // Tronqué (268 cars)
  'sans-titre-10mars_19-35': `<p>Laissez-vous séduire par la grâce intemporelle du Collier Lueur Nacrée. Chaque segment de nacre est soigneusement sélectionné pour sa luminosité naturelle, s'harmonisant avec des touches dorées pour un rendu tout en finesse.</p><p>La nacre, symbole de pureté et d'élégance, capture la lumière et irradie un éclat doux et chaleureux. Ce collier est idéal pour illuminer chaque instant, du quotidien aux occasions les plus festives. Sa longueur ajustable permet de le porter à différentes hauteurs selon vos envies.</p><p><strong>Caractéristiques :</strong><br>Matière : Nacre naturelle et acier inoxydable doré<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court + titre SEO à nettoyer (270 cars)
  'blue-azure': `<p>Sublimez votre style avec le Collier Blue Azure, un bijou fait main qui capture l'essence de l'azur méditerranéen. Fabriqué avec des pierres naturelles aux teintes bleues profondes, ce collier artisanal apporte une touche de fraîcheur et de raffinement à tous vos looks.</p><p>Chaque pièce est unique, façonnée avec soin par les artisans SophsCraft. Qu'il soit porté seul ou superposé, le Collier Blue Azure est un accessoire polyvalent, aussi beau au quotidien que pour une soirée.</p><p><strong>Caractéristiques :</strong><br>Matière : Pierres naturelles bleues et acier inoxydable<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court + en français approximatif (274 cars)
  'golden-wite-adjustable-ring-a-symphony-of-love': `<p>La Bague Symphony of Love est une ode à l'amour et à l'élégance. Fabriquée en acier inoxydable doré, cette bague ajustable présente un motif central raffiné, classique dans son symbolisme et résolument moderne dans son design.</p><p>Son caractère ajustable la rend parfaite pour toutes les morphologies. Portez-la comme un symbole d'affection ou offrez-la pour marquer un moment précieux — anniversaire, Saint-Valentin ou simple déclaration d'amour au quotidien.</p><p><strong>Caractéristiques :</strong><br>Matière : Acier inoxydable doré<br>Taille : Ajustable</p>`,

  // Trop court (279 cars)
  'romance-de-florence': `<p>Le Bracelet Romance de Florence est une composition délicate de perles translucides dans des teintes pastel douces, rehaussées par des perles roses vives pour un contraste subtil et féminin. Il est orné de détails dorés soigneusement travaillés, dont une breloque en forme de cœur et un fermoir sophistiqué qui apportent une touche romantique.</p><p>Inspiré par la douceur et l'élégance de la Renaissance florentine, ce bracelet est idéal pour toutes les occasions. Portez-le seul ou associez-le à d'autres bracelets pour un effet plus affirmé.</p><p><strong>Caractéristiques :</strong><br>Matière : Perles de verre et acier inoxydable doré<br>Fermeture : Fermoir à mousqueton</p>`,

  // Trop court (285 cars)
  'violet-de-venise': `<p>Le Bracelet Violet de Venise arbore une sélection de perles en tons violets évocateurs, agencées pour créer un subtil effet de dégradé qui rappelle les teintes de l'améthyste au coucher du soleil. Les éléments dorés qui les séparent ajoutent un éclat raffiné à l'ensemble.</p><p>Une breloque en cœur doré, symbole d'affection, orne le fermoir — faisant de ce bracelet un cadeau sentimental idéal. Inspiré par la palette chromatique et le romantisme de la Sérénissime, il est aussi beau porté seul qu'en accumulation.</p><p><strong>Caractéristiques :</strong><br>Matière : Perles en cristal violet et acier inoxydable doré<br>Fermeture : Fermoir à mousqueton avec breloque cœur</p>`,

  // Trop court (291 cars)
  'rosee-de-toulouse': `<p>Le Collier Rosée de Toulouse capture la douceur du sud-ouest de la France dans ses délicates pierres couleur lavande, enchâssées dans de l'or fin. Chaque perle reflète la richesse historique et la beauté artistique de la Ville Rose, évoquant les matins de printemps et les champs de lavande à perte de vue.</p><p>Ce collier raffiné s'adapte aussi bien à une tenue de jour qu'à une soirée élégante. Un bijou à offrir ou à s'offrir, pour garder un peu de la douceur toulousaine près de son cœur.</p><p><strong>Caractéristiques :</strong><br>Matière : Plaqué or 18 carats et pierres lavande<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court (296 cars) + titre en anglais
  'the-vibrant-multicolores-tourmaline-bead-star-necklace': `<p>Ce collier vibrant célèbre la beauté et la diversité des pierres de tourmaline naturelles. Un dégradé harmonieux de perles multicolores — du violet profond au vert lumineux, en passant par des nuances rosées et terreuses — crée une composition qui capture l'essence d'un arc-en-ciel minéral.</p><p>Chaque perle est choisie pour sa couleur éclatante et sa transparence naturelle. Un bijou artisanal unique qui apporte de la vie et de la couleur à toutes vos tenues, du quotidien aux occasions spéciales.</p><p><strong>Caractéristiques :</strong><br>Matière : Tourmaline naturelle multicolore et acier inoxydable<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Trop court (316 cars) + titre SEO
  'colier-sophia': `<p>Le Collier Sophia incarne l'élégance dans sa forme la plus pure. Conçu pour celles qui recherchent une touche d'élégance intemporelle, il allie des matériaux de qualité sélectionnés avec soin à une finition irréprochable.</p><p>Sa simplicité raffinée en fait un accessoire extrêmement polyvalent, parfait en solo pour un look épuré ou superposé avec d'autres pièces pour un style plus affirmé. Fabriqué avec passion par les artisans SophsCraft, il est disponible pour sublimer toutes vos tenues.</p><p><strong>Caractéristiques :</strong><br>Matière : Acier inoxydable et pierres naturelles<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Tronqué (330 cars) + titre en anglais
  'gemstone-symphony-the-mixed-tourmaline-bead-necklace': `<p>Le Collier Gemstone Symphony est une célébration de la beauté et de la diversité des pierres naturelles. Enfilé avec harmonie, un assortiment de perles aux couleurs et transparences variées — violets profonds, verts terreux, ocres lumineux — crée une composition vibrante et raffinée.</p><p>Inspiré par la richesse du règne minéral, chaque perle de tourmaline est unique et reflète l'artisanat soigné de SophsCraft. Un bijou audacieux et élégant, idéal pour affirmer une personnalité colorée et sensible à la beauté naturelle.</p><p><strong>Caractéristiques :</strong><br>Matière : Tourmaline multicolore naturelle et acier inoxydable<br>Longueur : 40 cm + 5 cm d'extension</p>`,

  // Tronqué (399 cars)
  'lilas': `<p>Le Collier Lilas est une pièce classique d'une polyvalence remarquable. Conçu pour compléter n'importe quelle tenue, il apporte une touche de raffinement aussi bien à une tenue de soirée qu'à un look de jour. Sa beauté réside dans sa discrétion élégante — il sublime sans jamais dominer.</p><p>Fabriqué avec des matériaux de qualité soigneusement sélectionnés, ce collier est le reflet de l'exigence artisanale de SophsCraft. Un incontournable de toute collection de bijoux, à porter au quotidien ou à offrir pour marquer une occasion spéciale.</p><p><strong>Caractéristiques :</strong><br>Matière : Acier inoxydable et finitions dorées<br>Longueur : 40 cm + 5 cm d'extension</p>`,
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const inputPath = join(process.cwd(), 'data', 'products.csv')
  const outputPath = join(process.cwd(), 'data', 'products-clean.csv')

  const content = readFileSync(inputPath, 'utf-8')

  const rows: Record<string, string>[] = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: false, // preserve exact values; we'll trim handle only
    relax_column_count: true,
  })

  const headers = Object.keys(rows[0])

  // --- Phase 1 : identifier les handles valides ---

  // Groupe par handle pour appliquer les filtres au niveau produit
  const productMeta = new Map<string, { valid: boolean; reason: string }>()

  for (const row of rows) {
    const handle = row['Handle']?.trim()
    if (!handle || productMeta.has(handle)) continue

    // Forcément supprimé
    if (REMOVE_HANDLES.has(handle)) {
      productMeta.set(handle, { valid: false, reason: 'handle blacklisté' })
      continue
    }

    const title = row['Title']?.trim()
    const status = row['Status']?.trim().toLowerCase()
    const qtyRaw = row['Variant Inventory Qty']?.trim()
    const qty = parseInt(qtyRaw, 10)
    const html = row['Body (HTML)'] ?? ''

    // Draft
    if (status === 'draft') {
      productMeta.set(handle, { valid: false, reason: `draft` })
      continue
    }

    // Qty ≤ 0
    if (!isNaN(qty) && qty <= 0) {
      productMeta.set(handle, { valid: false, reason: `qty=${qty}` })
      continue
    }

    // HTML ChatGPT corrompu
    if (isCorruptedHTML(html)) {
      productMeta.set(handle, { valid: false, reason: 'HTML corrompu (ChatGPT)' })
      continue
    }

    // Pas de titre
    if (!title) {
      productMeta.set(handle, { valid: false, reason: 'pas de titre' })
      continue
    }

    productMeta.set(handle, { valid: true, reason: '' })
  }

  // --- Phase 2 : filtrer et corriger les lignes ---

  const outputRows: Record<string, string>[] = []
  let corrected = 0
  let descFixed = 0
  let removed = 0
  let kept = 0

  // Pour éviter de compter plusieurs fois la correction de description (multi-lignes par produit)
  const descCorrectedHandles = new Set<string>()

  for (const row of rows) {
    const handle = row['Handle']?.trim()
    if (!handle) continue

    const meta = productMeta.get(handle)
    if (!meta || !meta.valid) continue

    const isMainRow = !!row['Title']?.trim()

    // Correction de titre (seulement sur la ligne principale qui a un titre)
    if (isMainRow && TITLE_FIXES[handle] && row['Title']?.trim() !== TITLE_FIXES[handle]) {
      row['Title'] = TITLE_FIXES[handle]
      corrected++
    }

    // Correction de description (seulement sur la ligne principale)
    if (isMainRow && DESCRIPTION_FIXES[handle] && !descCorrectedHandles.has(handle)) {
      row['Body (HTML)'] = DESCRIPTION_FIXES[handle]
      descCorrectedHandles.add(handle)
      descFixed++
    }

    outputRows.push(row)
  }

  // Stats
  Array.from(productMeta.entries()).forEach(([handle, meta]) => {
    if (!meta.valid) {
      removed++
      console.log(`  \u2717 ${handle} \u2014 ${meta.reason}`)
    } else {
      kept++
    }
  })

  // Écriture du CSV
  const lines: string[] = [
    serializeRow(headers, Object.fromEntries(headers.map((h) => [h, h]))),
    ...outputRows.map((row) => serializeRow(headers, row)),
  ]

  // La première ligne doit être les headers réels, pas leurs noms répétés
  // On réécrit l'en-tête correctement
  lines[0] = headers.map(csvField).join(',')

  writeFileSync(outputPath, lines.join('\n'), 'utf-8')

  console.log('\n' + '─'.repeat(60))
  console.log(`✅ Nettoyage terminé`)
  console.log(`   Produits conservés  : ${kept}`)
  console.log(`   Produits supprimés  : ${removed}`)
  console.log(`   Titres corrigés     : ${corrected}`)
  console.log(`   Descriptions fixées : ${descFixed}`)
  console.log(`   Fichier généré      : data/products-clean.csv`)
  console.log('─'.repeat(60) + '\n')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
