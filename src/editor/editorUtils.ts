import type { JSONContent } from "@tiptap/core";

export const emptyDocument: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const isValidUrl = (value: string, httpsOnly = false): boolean => {
  try {
    const url = new URL(value);

    return httpsOnly
      ? url.protocol === "https:"
      : ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const hasMeaningfulContent = (
  node: JSONContent | null | undefined,
): boolean => {
  if (!node) return false;

  if (node.type === "text" && node.text?.trim()) {
    return true;
  }

  if (node.type === "image") {
    return isValidUrl(String(node.attrs?.src ?? ""), true);
  }

  return node.content?.some(hasMeaningfulContent) ?? false;
};

export const hasValidMedia = (
  node: JSONContent | null | undefined,
): boolean => {
  if (!node) return true;

  if (
    node.type === "image" &&
    !isValidUrl(String(node.attrs?.src ?? ""), true)
  ) {
    return false;
  }

  const validLinks = (node.marks ?? []).every((mark) => {
    if (mark.type !== "link") return true;

    return isValidUrl(String(mark.attrs?.href ?? ""));
  });

  return validLinks && (node.content?.every(hasValidMedia) ?? true);
};
