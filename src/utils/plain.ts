/** Strips tags and invisible characters from inline markup. Used by Card for the arrow link's accessible name. */
export function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/[​-‏⁠-⁯﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
