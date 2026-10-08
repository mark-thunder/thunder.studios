import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  sanityLoader,
  postFields,
  caseStudyFields,
  serviceFields,
  settingsFields,
  locationFields,
  clientFields,
  teamFields,
} from "@/utils/sanity.ts";
import { WORK_KINDS, LOCATION_ROLES, DAYS } from "@/consts.ts";

/** A Studio Type of work: one of the three video services. */
const kind = z.enum(WORK_KINDS.map(({ kind }) => kind));

/** A mark from `src/assets/icons/thunder`, by file name. */
const icon = z.enum([
  "star",
  "film",
  "event",
  "podcast",
  "call",
  "proposal",
  "production",
  "trophy",
  "globe",
  "camera",
]);

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
    children: z.array(z.object({ text: z.string(), marks: z.array(z.string()) })),
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
    icon,
  }),
});

const points = defineCollection({
  loader: sanityLoader("point"),
  schema: z.object({
    title: z.string(),
    text: z.string(),
  }),
});

/** A Sanity video: an R2 .mp4 or YouTube link, its title and shape, and an optional poster. */
const sanityVideo = z.object({
  _type: z.literal("video"),
  title: z.string().nullish(),
  url: z.url(),
  ratio: z.enum([
    "16-9",
    "9-16",
    "1-1",
    "4-5",
    "3-4",
    "2-3",
    "3-2",
    "5-4",
    "2-1",
  ]),
  poster: z.url().nullish(),
});

/** The fields a blog post and a case study share. */
const article = {
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  image: sanityImage,
  video: sanityVideo.nullish(),
  body: z.array(z.looseObject({ _type: z.string() })),
};

const posts = defineCollection({
  loader: sanityLoader("post", postFields),
  schema: z.object({
    ...article,
    kind,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    author: z.object({ name: z.string(), role: z.string() }).nullish(),
  }),
});

const caseStudies = defineCollection({
  loader: sanityLoader("caseStudy", caseStudyFields),
  schema: z.object({
    ...article,
    client: z.string(),
    contact: z
      .object({
        name: z.string(),
        role: z.string().nullish(),
        photo: z.url().nullish(),
      })
      .nullish(),
    /** Required in the Studio; nullish until older studies are filled in. */
    kind: kind.nullish(),
    services: z.array(z.string()).nullish(),
    year: z.number().int(),
  }),
});

const locations = defineCollection({
  loader: sanityLoader("location", locationFields),
  schema: z.object({
    city: z.string(),
    state: z.string(),
    slug: z.string(),
    role: z.enum(
      Object.keys(LOCATION_ROLES) as (keyof typeof LOCATION_ROLES)[],
    ),
    intro: z.string(),
    address: z.string().nullish(),
    nearby: z.array(z.string()).nullish(),
    body: z.array(z.looseObject({ _type: z.string() })).nullish(),
    faq: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .nullish(),
    seo: z.object({ title: z.string(), description: z.string() }),
    thin: z.boolean(),
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
    reviewCount: z.number().int(),
    heroPhoto: sanityImage.nullish(),
    heroFilm: z.url().nullish(),
    onSetPhoto: sanityImage.nullish(),
    aboutPhoto: sanityImage.nullish(),
    servicesPhoto: sanityImage.nullish(),
    otherServices: z
      .object({
        eyebrow: z.string().nullish(),
        heading: heading.nullish(),
        text: z.string().nullish(),
      })
      .nullish(),
  }),
});

const process = defineCollection({
  loader: file("src/data/process.json"),
  schema: z.object({
    step: z.string(),
    title: z.string(),
    text: z.string(),
    icon,
  }),
});

const audiences = defineCollection({
  loader: file("src/data/audiences.json"),
  schema: z.object({
    label: z.string(),
    title: z.string(),
    text: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: sanityLoader("testimonial"),
  schema: z.object({
    quote: z.string(),
    name: z.string(),
    source: z.string(),
    url: z.url().optional(),
  }),
});

const awards = defineCollection({
  loader: file("src/data/awards.json"),
  schema: z.object({
    name: z.string(),
    detail: z.string(),
    icon,
  }),
});

const team = defineCollection({
  loader: sanityLoader("teamMember", teamFields),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.url().nullish(),
    film: z.url().nullish(),
    bio: z.string().nullish(),
    links: z
      .array(
        z.object({
          network: z.enum([
            "linkedin",
            "instagram",
            "threads",
            "facebook",
            "tiktok",
            "x",
          ]),
          url: z.url(),
        }),
      )
      .nullish(),
  }),
});

const faq = defineCollection({
  loader: sanityLoader("faq"),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
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

const clients = defineCollection({
  loader: sanityLoader("client", clientFields),
  schema: z.object({
    name: z.string(),
    logo: z.url(),
    width: z.number(),
    height: z.number(),
  }),
});

export const collections = {
  services,
  points,
  process,
  audiences,
  testimonials,
  awards,
  team,
  faq,
  legal,
  clients,
  posts,
  caseStudies,
  locations,
  settings,
};
