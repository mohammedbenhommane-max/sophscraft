import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'blogPost',
  title: 'Article de blog',
  type: 'document',
  fields: [
    defineField({
      name: 'titleFR',
      title: 'Titre (FR)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'titleEN',
      title: 'Titre (EN)',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'titleFR', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          { title: 'Événements', value: 'events' },
          { title: 'Inspirations', value: 'inspirations' },
          { title: 'Presse', value: 'presse' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Image de couverture',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'bodyFR',
      title: 'Contenu (FR)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'bodyEN',
      title: 'Contenu (EN)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Date de publication',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'titleFR', subtitle: 'category', media: 'coverImage' },
  },
})
