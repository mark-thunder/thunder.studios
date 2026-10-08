// @ts-check
import { defineConfig, envField, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { SITE_URL, MEDIA_HOSTS, LAUNCHED } from "./src/consts.ts";
import { isNoindexRoute, thinLocationPaths } from "./src/utils/seo.ts";

import cloudflare from "@astrojs/cloudflare";

const thinLocations = new Set(await thinLocationPaths());

export default defineConfig({
  site: SITE_URL,

  image: { domains: MEDIA_HOSTS },

  integrations: LAUNCHED
    ? [
        sitemap({
          filter: (page) =>
            !isNoindexRoute(new URL(page).pathname) &&
            !thinLocations.has(new URL(page).pathname.replace(/\/$/, "")),
        }),
      ]
    : [],

  fonts: [
    {
      name: "General Sans",
      cssVariable: "--font-general-sans",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "normal",
            src: ["./src/assets/fonts/general-sans-regular.otf"],
          },
          {
            weight: 500,
            style: "normal",
            src: ["./src/assets/fonts/general-sans-medium.otf"],
          },
        ],
      },
    },
    {
      name: "Boska",
      cssVariable: "--font-boska",
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            weight: 400,
            style: "italic",
            src: ["./src/assets/fonts/boska-italic.otf"],
          },
        ],
      },
    },
  ],

  vite: {
    build: { cssTarget: "safari15.4" },
    /* The Cloudflare dev runner cannot scan .astro files for dependencies,
       so it discovers them lazily and re-bundles mid-request, deleting files
       the open page still references. Serving server deps unbundled in dev
       is slower by milliseconds and never stale. */
    ssr: { optimizeDeps: { noDiscovery: true } },
  },
  adapter: cloudflare({
    imageService: { build: "compile", runtime: "cloudflare-binding" },
  }),
  session: false,

  env: {
    schema: {
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      JEV_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      GHL_WEBHOOK_URL: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
});
