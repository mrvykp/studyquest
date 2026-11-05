import { useEffect, useMemo, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { Button, Flex, message } from "antd";

import { editorExtensions } from "./editorExtensions";
import { emptyDocument, isValidUrl } from "./editorUtils";
import "./richText.css";

interface RichTextEditorProps {
  value?: JSONContent | null;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Write something...",
}: RichTextEditorProps) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const extensions = useMemo(
    () => [...editorExtensions, Placeholder.configure({ placeholder })],
    [placeholder],
  );

  const editor = useEditor(
    {
      extensions,
      content: value ?? emptyDocument,

      onUpdate: ({ editor }) => {
        onChangeRef.current?.(editor.getJSON());
      },
    },
    [extensions],
  );

  // Restore saved content when the form value changes.
  useEffect(() => {
    if (!editor) return;

    const nextContent = value ?? emptyDocument;

    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) return null;

  const addLink = () => {
    const currentUrl = editor.getAttributes("link").href || "";

    const url = window.prompt(
      "Enter link URL (http:// or https://):",
      currentUrl,
    );

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    if (!isValidUrl(url.trim())) {
      message.error("Please enter a valid HTTP or HTTPS URL");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const addImage = () => {
    const url = window.prompt("Enter HTTPS image URL:");

    if (url === null) return;

    if (!isValidUrl(url.trim(), true)) {
      message.error("Image URL must use HTTPS");
      return;
    }

    editor
      .chain()
      .focus()
      .setImage({
        src: url.trim(),
        alt: "Study image",
      })
      .run();
  };

  return (
    <div className="studyquest-editor">
      <Flex gap={4} wrap className="studyquest-toolbar">
        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </Button>

        <Button
          size="small"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullet List
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numbered List
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Quote
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          Inline Code
        </Button>

        <Button
          size="small"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          Code Block
        </Button>

        <Button size="small" onClick={addLink}>
          Link
        </Button>

        <Button size="small" onClick={addImage}>
          Image
        </Button>

        <Button
          size="small"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          Undo
        </Button>

        <Button
          size="small"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          Redo
        </Button>
      </Flex>

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
