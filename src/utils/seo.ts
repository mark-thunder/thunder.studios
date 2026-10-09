import { LAUNCHED, NOINDEX_ROUTES } from "../consts.ts";

const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;

const excluded = new Set(NOINDEX_ROUTES.map(normalize));

/** Checks whether a route should be hidden from search. Used by BaseHead. */
export function isNoindexRoute(pathname: string): boolean {
  return !LAUNCHED || excluded.has(normalize(pathname));
}

/** GROQ: a service-area city with no local story yet. Search leaves it out until one is written (Google's doorway-page policy); a place we work from, with its address, stays in. */
export const THIN_LOCATION = `role == "service-area" && !defined(body[0])`;

