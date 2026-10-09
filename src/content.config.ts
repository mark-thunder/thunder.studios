import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  sanityLoader,
  serviceFields,
  spaceFields,
  teamFields,
  settingsFields,
} from "@/utils/sanity.ts";
import { DAYS } from "@/consts.ts";

/** A Sanity image, resolved by the GROQ in `utils/sanity.ts` to what `Img` needs. */
const sanityImage = z.object({
  _type: z.literal("image"),
  alt: z.string(),
  url: z.url(),
  width: z.number(),
  height: z.number(),
  focus: z.string().optional(),
});

/** A one-line heading from the Studio, its words marked bold or italic. */
const heading = z.array(
  z.object({
    children: z.array(
      z.object({ text: z.string(), marks: z.array(z.string()) }),
    ),
  }),
);

/** The Studio's `order`: lower shows first. `getCollection()` returns entries in no set order, so readers sort by it. */
const order = z.number().int();

const services = defineCollection({
  loader: sanityLoader("service", serviceFields),
  schema: z.object({
    title: z.string(),
    heading,
    text: z.string(),
    slug: z.string().nullish(),
    image: sanityImage.nullish(),
    order,
  }),
});

const spaces = defineCollection({
  loader: sanityLoader("space", spaceFields),
  schema: z.object({
    title: z.string(),
    heading,
    text: z.string(),
    photo: sanityImage.nullish(),
    service: z
      .object({ slug: z.string().nullish(), title: z.string() })
      .nullish(),
    order,
  }),
});

const team = defineCollection({
  loader: sanityLoader("teamMember", teamFields),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: sanityImage.nullish(),
    order,
  }),
});

/** Site-wide values the owner edits in the Studio's Site settings. */
const settings = defineCollection({
  loader: sanityLoader("settings", settingsFields),
  schema: z.object({
    name: z.string(),
    legalName: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
    }),
    phone: z.string(),
    email: z.string(),
    hours: z
      .array(
        z.object({
          days: z.array(z.enum(DAYS)),
          opens: z.string(),
          closes: z.string(),
        }),
      )
      .nullish(),
    studioPhoto: sanityImage.nullish(),
    sessionPhoto: sanityImage.nullish(),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: "*.md", base: "src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.coerce.date(),
    status: z.enum(["draft", "final"]),
  }),
});

export const collections = {
  services,
  spaces,
  team,
  settings,
  legal,
};
