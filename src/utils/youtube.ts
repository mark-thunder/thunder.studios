const ID =
  /^https:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i;

/** The video id in a YouTube watch, youtu.be, shorts, embed or live link; `undefined` for anything else. */
export const youtubeId = (url: string) => url.match(ID)?.[1];

/** The playlist id in a YouTube link's `list=`; `undefined` for anything else. */
const youtubeList = (url: string) => {
  try {
    const { hostname, searchParams } = new URL(url);
    return /(^|\.)youtube\.com$|^youtu\.be$/i.test(hostname)
      ? (searchParams.get("list") ?? undefined)
      : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The privacy-enhanced player address for a YouTube video, playlist, or video
 * within a playlist; `undefined` for anything else.
 */
export const youtubeEmbed = (url: string) => {
  const id = youtubeId(url);
  const list = youtubeList(url);
  if (!id && !list) return undefined;
  const query = list ? `?list=${list}` : "";
  return `https://www.youtube-nocookie.com/embed/${id ?? "videoseries"}${query}`;
};

/**
 * A YouTube video's thumbnail and its size: the 1280×720 version where
 * YouTube has one, otherwise the 480×360 one every video has. Checked once,
 * at build.
 */
export const youtubeThumbnail = async (id: string) => {
  const large = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  const found = await fetch(large, { method: "HEAD" }).then(
    (res) => res.ok,
    () => false,
  );
  return found
    ? { url: large, width: 1280, height: 720 }
    : {
        url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        width: 480,
        height: 360,
      };
};
