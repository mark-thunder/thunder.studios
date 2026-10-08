import { getCollection } from "astro:content";
import { WORK_KINDS } from "@/consts.ts";

/** One page per blog post, with the post as `post`. */
export async function postPaths() {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

/** One page per case study, with the study as `study` and the one after it as `next`. */
export async function caseStudyPaths() {
  const studies = await getCollection("caseStudies");
  return studies.map((study, index) => ({
    params: { slug: study.data.slug },
    props: {
      study,
      next: studies.length > 1 ? studies[(index + 1) % studies.length] : null,
    },
  }));
}

/** One page per video service with a Studio entry, with the service's fields and its `kind`. */
export async function servicePaths() {
  const services = await getCollection("services");
  return WORK_KINDS.flatMap(({ kind, slug }) => {
    const service = services.find(({ data }) => data.kind === kind)?.data;
    return service ? [{ params: { slug }, props: { ...service, kind } }] : [];
  });
}

/** One page per location, with the location's fields. */
export async function locationPaths() {
  const locations = await getCollection("locations");
  return locations.map(({ data }) => ({
    params: { slug: data.slug },
    props: data,
  }));
}

/** One page per policy, with the entry as `page`. */
export async function legalPaths() {
  const pages = await getCollection("legal");
  return pages.map((page) => ({
    params: { legal: page.id },
    props: { page },
  }));
}
