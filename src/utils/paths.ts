import { getCollection } from "astro:content";
import { getOrdered } from "@/utils/ordered.ts";

/** One page per service with a page address, with the service's fields. */
export async function servicePaths() {
  const services = await getOrdered("services");
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
