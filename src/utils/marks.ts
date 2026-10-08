type Span = { text?: string; marks?: string[] };
type Block = { children?: Span[] };

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Turns a one-line Studio heading (Portable Text with bold and italic marks) into inline markup for `set:html`. */
export const marks = (blocks?: Block[] | null) =>
  (blocks ?? [])
    .flatMap((block) => block.children ?? [])
    .map(({ text = "", marks = [] }) =>
      marks
        .filter((mark) => mark === "strong" || mark === "em")
        .reduce((html, mark) => `<${mark}>${html}</${mark}>`, escape(text)),
    )
    .join("");
