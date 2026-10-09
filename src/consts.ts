/** Fallback meta description for pages that don't set their own. */
export const SITE_DESCRIPTION =
  "Thunder Studios in White Oak, Texas, holds a video podcast studio, an audio podcast studio and a photography studio. Our crew runs the cameras, microphones and edit.";
/** Canonical origin. Resolves canonical URLs, social images, and the sitemap. */
export const SITE_URL = "https://www.thunder.media";
/** BCP 47 locale tag used to format dates and numbers. */
export const SITE_LOCALE = "en-US";
/** Routes excluded from search and the sitemap. Surrounding slashes are ignored. */
export const NOINDEX_ROUTES: string[] = ["/404", "/example-components"];
/** Whether the site is public. Until it is, every page is noindex and the sitemap is empty. */
export const LAUNCHED = false;
/**
 * Widest viewport the fluid scale is tuned for, matching `--viewport-max` in
 * `base.css`. The largest width an image is rendered at.
 */
export const VIEWPORT_MAX = 1440;

/** The site's pages, in the order the nav and footer list them. */
export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];
/** Thunder Media's three video services. `kind` matches the Studio's Type of work; `slug` names the page of each one Studios offers. */
export const WORK_KINDS = [
  { kind: "Brand film", label: "Brand Films", slug: "brand-films" },
  { kind: "Event coverage", label: "Event Coverage", slug: "event-coverage" },
  {
    kind: "Podcast production",
    label: "Podcast Production",
    slug: "podcast-production",
  },
] as const;
/** The services Thunder Studios offers, in order, by their document id in the Studio it shares with Thunder Media. One with a `kind` has its own page at `/services/<slug>`. */
export const STUDIO_SERVICES = [
  "da8fe01c-7463-4cf7-af4e-4d47594e29dd",
  "00ebd617-ec35-4676-87da-0a72e36e63e0",
];
/** What Thunder has in a location, as the Studio stores it and as the page names it. */
export const LOCATION_ROLES = {
  headquarters: "Headquarters",
  studio: "Studio",
  "service-area": "Service area",
} as const;
/** Each network's name, read out for a profile icon. Keys match the Studio's profile networks and `src/assets/icons/social`. */
export const NETWORK_NAMES = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  threads: "Threads",
  facebook: "Facebook",
  tiktok: "TikTok",
  x: "X",
} as const;
/** The week in order, as the Studio's office hours name the days. */
export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
/** The policy pages, in the order the footer lists them. */
export const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];
/** Thunder Media's profiles, in the order they are listed. `icon` names a file in `src/assets/icons/social`. */
export const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/thundermediatx/",
    icon: "instagram",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/www.thunder.media",
    icon: "facebook",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/thunder-media-films/",
    icon: "linkedin",
  },
  {
    label: "Google Business Profile",
    href: "https://share.google/LLBkPf8BM4qDGBRle",
    icon: "google",
  },
];
/** Google Business Profile, where the reviews live. */
export const GOOGLE_REVIEWS_URL = "https://share.google/T2IZeWaPIvzXy0ca9";
/** GoHighLevel external tracking id. Loaded on the live site only. */
export const GHL_TRACKING_ID = "tk_0a9c0103ce8e4509aa18c16afd889db0";
/** Google Analytics 4 measurement id. Loaded on thunder.media only. */
export const GA_MEASUREMENT_ID = "G-VC5VZY83DV";
/** GoHighLevel chat widget id. Loaded on the live site only. */
export const GHL_WIDGET_ID = "6a8f1ed0c9f1f7efa74f2845";
/** Hosts whose images the build may fetch and optimize: Sanity's CDN, the R2 media domain, and YouTube thumbnails. */
export const MEDIA_HOSTS = [
  "cdn.sanity.io",
  "media.thunder.media",
  "i.ytimg.com",
];
/** Sanity project and dataset the content collections read at build. Public; the dataset needs no token. */
export const SANITY = {
  projectId: "6y1gayk4",
  dataset: "production",
  apiVersion: "2026-09-23",
};
/** base44's enquiry endpoint, which also feeds GoHighLevel. A verified enquiry goes here while `SEND_TO_BASE44` is true. */
export const CONTACT_ENDPOINT =
  "https://thunder-2f47f8ae.base44.app/functions/contactForm";
/** Set to `false` once GoHighLevel's own webhook (`GHL_WEBHOOK_URL`) handles every enquiry. */
export const SEND_TO_BASE44 = false;
