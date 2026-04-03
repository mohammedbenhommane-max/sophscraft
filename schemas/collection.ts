import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'collection',
  title: 'Collection',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: "Ordre d'affichage",
      type: 'number',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Ordre',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'nameFR', media: 'image' },
  },
})
