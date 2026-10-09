import { getCollection } from "astro:content";
import { STUDIO_SERVICES, WORK_KINDS } from "@/consts.ts";

/** The services Thunder Studios offers, in `STUDIO_SERVICES` order. A video service carries its page's `slug` and `label`. */
export async function getStudioServices() {
  const services = await getCollection("services");
  return STUDIO_SERVICES.flatMap((documentId) => {
    const data = services.find(({ id }) => id.endsWith(`-${documentId}`))?.data;
    if (!data) return [];
    const work = WORK_KINDS.find(({ kind }) => kind === data.kind);
    return [{ ...data, slug: work?.slug, label: work?.label }];
  });
}
