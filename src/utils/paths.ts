import { getCollection } from "astro:content";
import { getStudioServices } from "@/utils/services.ts";

/** One page per video service Studios offers, with the service's fields. */
export async function servicePaths() {
  const services = await getStudioServices();
  return services.flatMap((service) =>
    service.slug ? [{ params: { slug: service.slug }, props: service }] : [],
  );
}

/** One page per policy, with the entry as `page`. */
export async function legalPaths() {
  const pages = await getCollection("legal");
  return pages.map((page) => ({
    params: { legal: page.id },
    props: { page },
  }));
}
