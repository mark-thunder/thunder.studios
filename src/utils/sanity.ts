import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Loader } from "astro/loaders";
import { SANITY } from "@/consts.ts";

const client = createClient({
  ...SANITY,
  useCdn: false,
  perspective: "published",
});

/** GROQ for an image with its alt text, resolved to the CDN URL and size `Img` needs, plus the editor's crop and hotspot. */
const image = `{ _type, alt, asset, crop, hotspot, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;

/** GROQ for a location: the city and state the business serves. */
export const locationFields = `city, state`;

/** GROQ for Site settings: everything, with each fixed-place photo resolved as an image or left empty. */
const photo = (name: string) =>
  `"${name}": select(defined(${name}.asset) => ${name} ${image})`;
export const settingsFields = `..., ${photo("heroPhoto")}, ${photo("onSetPhoto")}, ${photo("servicesPhoto")}`;

/** A service's heading keeps its bold and italic marks; `title` is the same words as plain text. Its card photo counts only once a file is uploaded. */
export const serviceFields = `..., "heading": title, "title": pt::text(title), "image": select(defined(image.asset) => image ${image})`;

const builder = createImageUrlBuilder({
  projectId: SANITY.projectId,
  dataset: SANITY.dataset,
});

type Side = { top: number; bottom: number; left: number; right: number };
type Framed = {
  asset?: { _ref: string };
  crop?: Side | null;
  hotspot?: { x: number; y: number } | null;
  url: string;
  width: number;
  height: number;
  focus?: string;
};

/** Applies the editor's crop to a cover image's URL and size (Sanity's URL builder), and turns its hotspot into `focus`, the point CSS crops keep in view. */
const frame = (image: Framed | null | undefined) => {
  if (!image?.asset || !(image.crop || image.hotspot)) return;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const across = 1 - crop.left - crop.right;
  const down = 1 - crop.top - crop.bottom;
  image.url = builder.image(image).url();
  image.width = Math.round(image.width * across);
  image.height = Math.round(image.height * down);
  if (image.hotspot) {
    const x = ((image.hotspot.x - crop.left) / across) * 100;
    const y = ((image.hotspot.y - crop.top) / down) * 100;
    image.focus = `${x.toFixed(1)}% ${y.toFixed(1)}%`;
  }
};

/** A content collection loader for one Sanity document type, read at build in the Studio's `order`, newest first where there is none. `fields` is a GROQ projection body; the collection's schema validates each entry and drops what it does not name. */
export const sanityLoader = (type: string, fields = "..."): Loader => ({
  name: `sanity-${type}`,
  load: async ({ store, parseData }) => {
    const docs = await client.fetch<Record<string, unknown>[]>(
      `*[_type == $type] | order(order asc, publishedAt desc){ _id, _rev, ${fields} }`,
      { type },
    );
    store.clear();
    for (const [index, doc] of docs.entries()) {
      for (const value of Object.values(doc))
        if ((value as { _type?: string } | null)?._type === "image")
          frame(value as Framed);
      const id = `${String(index).padStart(3, "0")}-${doc._id}`;
      store.set({
        id,
        data: await parseData({ id, data: doc }),
        digest: String(doc._rev),
      });
    }
  },
});
