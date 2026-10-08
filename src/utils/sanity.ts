import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { Loader } from "astro/loaders";
import { SANITY } from "@/consts.ts";
import { youtubeId, youtubeThumbnail } from "@/utils/youtube.ts";
import { THIN_LOCATION } from "@/utils/seo.ts";

const client = createClient({
  ...SANITY,
  useCdn: false,
  perspective: "published",
});

/** GROQ for an image with its alt text, resolved to the CDN URL and size `Img` needs, plus the editor's crop and hotspot. */
const image = `{ _type, alt, asset, crop, hotspot, "url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }`;

/** GROQ for a video: its R2 link, title, shape, and the poster's CDN URL. */
const video = `{ _type, title, url, ratio, "poster": poster.asset->url }`;

/** GROQ for a Portable Text body, its images and videos resolved as above. */
const body = `body[]{ ..., _type == "image" => ${image}, _type == "video" => ${video} }`;

/** GROQ fields for a document with a slug, a cover image, an optional cover video and a Portable Text body. */
export const articleFields = `..., "slug": slug.current, image ${image}, video ${video}, ${body}`;

/** Article fields plus the post's optional author and when it was last edited. */
export const postFields = `${articleFields}, "updatedAt": _updatedAt, author->{ name, role }`;

/** A client logo: its name, and the file's CDN URL and size, so the strip holds its shape before it loads. */
export const clientFields = `name, "logo": logo.asset->url, "width": logo.asset->metadata.dimensions.width, "height": logo.asset->metadata.dimensions.height`;

/** A team member, with the portrait's CDN URL once one is uploaded. */
export const teamFields = `..., "photo": photo.asset->url`;

/** A location's search title and description: the editor's, or one written from the city and intro. */
const call = `" Book a discovery call or phone " + *[_id == "settings"][0].phone + "."`;
const locationSeo = `"seo": {
  "title": coalesce(seo.title, "Video Production in " + city + ", " + state),
  "description": coalesce(seo.description, select(length(intro + ${call}) <= 160 => intro + ${call}, intro))
}`;

/** GROQ fields for a location page: its slug, optional body, search text, and whether search should skip it. */
export const locationFields = `..., "slug": slug.current, ${body}, ${locationSeo}, "thin": ${THIN_LOCATION}`;

/** Article fields plus the case study's optional client contact, its photo resolved to the CDN URL. */
export const caseStudyFields = `${articleFields}, contact{ name, role, "photo": photo.asset->url }`;

/** A service's heading keeps its bold and italic marks; `title` is the same words as plain text. Its card photo counts only once a file is uploaded. */
/** GROQ for Site settings: everything, with each fixed-place photo resolved as an image or left empty. */
const photo = (name: string) =>
  `"${name}": select(defined(${name}.asset) => ${name} ${image})`;
export const settingsFields = `..., ${photo("heroPhoto")}, ${photo("onSetPhoto")}, ${photo("aboutPhoto")}, ${photo("servicesPhoto")}`;

export const serviceFields = `..., "heading": title, "title": pt::text(title), "image": select(defined(image.asset) => image ${image})`;

type Cover = { url?: string; title?: string | null } | null | undefined;

/** Gives a document with no cover image file (alt text alone counts as none) its YouTube cover video's thumbnail, so every list, card and preview still has a picture. */
const coverFromYoutube = async (doc: Record<string, unknown>) => {
  const video = doc.video as Cover;
  const image = doc.image as { url?: string | null } | null;
  const id = !image?.url && video?.url ? youtubeId(video.url) : undefined;
  if (!id) return;
  doc.image = {
    _type: "image",
    alt: video?.title ?? doc.title,
    ...(await youtubeThumbnail(id)),
  };
};

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
      await coverFromYoutube(doc);
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
