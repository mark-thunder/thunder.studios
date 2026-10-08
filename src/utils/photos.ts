import { getCollection } from "astro:content";
import studio from "@/assets/images/hero-thunder.jpg";
import onSet from "@/assets/images/why-thunder.jpg";
import fan from "@/assets/stand-ins/about-fan.png";
import paint from "@/assets/stand-ins/work-skywardtech.jpg";

/** The photos shown in fixed places, from the Studio's Site settings (Photos). Each falls back to the photo built into the site until one is uploaded. */
export const getPhotos = async () => {
  const settings = (await getCollection("settings"))[0]?.data;
  const pick = (
    photo: { url: string; alt: string; focus?: string } | null | undefined,
    fallback: ImageMetadata,
    alt: string,
  ) => ({
    src: photo?.url ?? fallback,
    alt: photo?.alt ?? alt,
    /** The hotspot set in the Studio, as a CSS position. */
    focus: photo?.focus,
  });
  return {
    /** The R2 film behind the hero, or `undefined` for the Studio photo alone. */
    heroFilm: settings?.heroFilm ?? undefined,
    studio: pick(
      settings?.heroPhoto,
      studio,
      "Thunder Media filming an interview in the studio",
    ),
    onSet: pick(settings?.onSetPhoto, onSet, "Thunder Media on set"),
    about: pick(settings?.aboutPhoto, fan, ""),
    services: pick(settings?.servicesPhoto, paint, ""),
  };
};
