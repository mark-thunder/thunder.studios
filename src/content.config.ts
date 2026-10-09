import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  sanityLoader,
  serviceFields,
  settingsFields,
  locationFields,
} from "@/utils/sanity.ts";
import { WORK_KINDS, DAYS } from "@/consts.ts";

/** A Studio Type of work: one of the three video services. */
const kind = z.enum(WORK_KINDS.map(({ kind }) => kind));

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

const services = defineCollection({
  loader: sanityLoader("service", serviceFields),
  schema: z.object({
    title: z.string(),
    heading,
    text: z.string(),
    kind: kind.nullish(),
    image: sanityImage.nullish(),
  }),
});

const locations = defineCollection({
  loader: sanityLoader("location", locationFields),
  schema: z.object({
    city: z.string(),
    state: z.string(),
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
    heroPhoto: sanityImage.nullish(),
    onSetPhoto: sanityImage.nullish(),
    servicesPhoto: sanityImage.nullish(),
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
  legal,
  locations,
  settings,
};
