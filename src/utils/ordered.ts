import { getCollection, type CollectionEntry } from "astro:content";

type Ordered = "services" | "spaces" | "team";

/** A Studio list in the editor's `order`, lowest first, as plain data. `getCollection()` itself returns entries in no set order. */
export const getOrdered = async <C extends Ordered>(
  collection: C,
): Promise<CollectionEntry<C>["data"][]> =>
  ((await getCollection(collection)) as CollectionEntry<C>[])
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ data }) => data);
