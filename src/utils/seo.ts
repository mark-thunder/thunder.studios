import { createClient } from "@sanity/client";
import { LAUNCHED, NOINDEX_ROUTES, SANITY } from "../consts.ts";

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

const excluded = new Set(NOINDEX_ROUTES.map(normalize));

/** Checks whether a route should be hidden from search. Used by BaseHead. */
export function isNoindexRoute(pathname: string): boolean {
  return !LAUNCHED || excluded.has(normalize(pathname));
}

/** GROQ: a service-area city with no local story yet. Search leaves it out until one is written (Google's doorway-page policy); a place we work from, with its address, stays in. */
export const THIN_LOCATION = `role == "service-area" && !defined(body[0])`;

/** The paths of thin location pages, for the sitemap at build. */
export const thinLocationPaths = () =>
  createClient({ ...SANITY, useCdn: false, perspective: "published" }).fetch<
    string[]
  >(
    `*[_type == "location" && ${THIN_LOCATION}]{ "path": "/locations/" + slug.current }.path`,
  );
