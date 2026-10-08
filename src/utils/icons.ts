import type { SvgComponent } from "astro/types";

const byName = (modules: Record<string, { default: SvgComponent }>) =>
  Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => [
      path.slice(path.lastIndexOf("/") + 1, -".svg".length),
      mod.default,
    ]),
  );

/** Thunder's marks by file name, so a collection can name one as a string. */
export const icons: Record<string, SvgComponent> = byName(
  import.meta.glob("@/assets/icons/thunder/*.svg", { eager: true }),
);

/** The social networks' marks by file name: facebook, instagram, linkedin, threads, tiktok, x, google. */
export const socialIcons: Record<string, SvgComponent> = byName(
  import.meta.glob("@/assets/icons/social/*.svg", { eager: true }),
);
