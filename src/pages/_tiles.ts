import { getCollection } from "astro:content";
import { WORK_KINDS } from "@/consts.ts";
import quantumflow from "@/assets/stand-ins/work-quantumflow.jpg";
import vortextech from "@/assets/stand-ins/work-vortextech.jpg";
import nexacore from "@/assets/stand-ins/work-nexacore.jpg";

/* Stand-in pictures from the Mizar theme, shown until each service has its
   Card photo in the Studio. */
const standIns = [quantumflow, vortextech, nexacore];

/**
 * One tile per video service, leading to its page: the service's name, its
 * line from the Studio, and its Card photo or a stand-in.
 */
export async function serviceTiles() {
  const services = await getCollection("services");
  return WORK_KINDS.map(({ kind, label, slug }, index) => {
    const service = services.find(({ data }) => data.kind === kind)?.data;
    return {
      label,
      text: service?.text,
      image: service?.image?.url ?? standIns[index],
      imageAlt: service?.image?.alt,
      href: `/services/${slug}`,
    };
  });
}

