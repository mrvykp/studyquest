import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

export const editorExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      isAllowedUri: (url, context) => {
        if (!context.defaultValidate(url)) return false;

        try {
          const protocol = new URL(url).protocol;
          return protocol === "http:" || protocol === "https:";
        } catch {
          return false;
        }
      },
    },
  }),
  Image.configure({
    allowBase64: false,
  }),
];
