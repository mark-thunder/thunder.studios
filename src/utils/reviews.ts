import type { SvgComponent } from "astro/types";
import google from "@/assets/icons/reviews/google.svg";
import facebook from "@/assets/icons/reviews/facebook.svg";

/** The sites reviews come from, read from a Studio review's `source` line. */
export type ReviewSite = "google" | "facebook";

/** Which site a review was posted on, or nothing for one we don't mark. */
export const reviewSite = (source: string): ReviewSite | undefined =>
  /google/i.test(source)
    ? "google"
    : /facebook/i.test(source)
      ? "facebook"
      : undefined;

/** Each site's mark in its own colors, as the sites publish them. */
export const reviewMarks: Record<ReviewSite, SvgComponent> = {
  google,
  facebook,
};

/** The mark for a review's source, if the site has one. */
export const reviewMark = (source: string) => {
  const site = reviewSite(source);
  return site && reviewMarks[site];
};

/**
 * Up to `each` reviews from every marked site, taken in Studio order and
 * dealt in turn (Google, Facebook, Google, …) so no site bunches up.
 */
export const mixReviews = <T extends { source: string }>(
  reviews: T[],
  each: number,
) => {
  const bySite = (Object.keys(reviewMarks) as ReviewSite[]).map((site) =>
    reviews.filter(({ source }) => reviewSite(source) === site).slice(0, each),
  );
  return Array.from({ length: each }, (_, i) => bySite.map((list) => list[i]))
    .flat()
    .filter((review): review is T => !!review);
};
