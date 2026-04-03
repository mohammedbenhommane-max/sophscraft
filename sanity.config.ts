import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'sophscraft',
  title: 'SophsCraft',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  // Studio accessible à /studio dans l'app Next.js
  basePath: '/studio',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Contenu')
          .items([
            S.listItem().title('Produits').schemaType('product').child(S.documentTypeList('product')),
            S.listItem().title('Collections').schemaType('collection').child(S.documentTypeList('collection')),
            S.listItem().title('Articles de blog').schemaType('blogPost').child(S.documentTypeList('blogPost')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
