import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required().max(120) }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      type: "text",
      rows: 3,
      description: "Shown in the list and as the teaser on locked posts.",
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: "isPremium",
      title: "Premium",
      type: "boolean",
      initialValue: false,
      description: "Readers need to have bought a coffee to see the body.",
    }),
    defineField({ name: "coverImage", type: "image", options: { hotspot: true } }),
    defineField({ name: "tags", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "publishedAt",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
  },
});
