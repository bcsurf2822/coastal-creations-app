import {defineField, defineType} from 'sanity'

export const galleryType = defineType({
  name: 'eventPictures',
  title: 'Event Pictures',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
  ],
})
