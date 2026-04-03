import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    defineField({
      name: 'nameFR',
      title: 'Nom (FR)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'nameEN',
      title: 'Nom (EN)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'nameFR', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'descriptionFR',
      title: 'Description (FR)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'descriptionEN',
      title: 'Description (EN)',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'price',
      title: 'Prix (€)',
      type: 'number',
      validation: (r) => r.required().positive(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'reference',
      to: [{ type: 'collection' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'inStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isSoldOut',
      title: 'Épuisé',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isCustom',
      title: 'Pièce sur-mesure',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'variants',
      title: 'Variantes (tailles)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', title: 'Taille', type: 'string' },
            { name: 'available', title: 'Disponible', type: 'boolean', initialValue: true },
          ],
          preview: {
            select: { title: 'size', subtitle: 'available' },
            prepare: ({ title, subtitle }) => ({
              title,
              subtitle: subtitle ? 'Disponible' : 'Épuisé',
            }),
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'nameFR', media: 'images.0' },
  },
})
