import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";

import { editorExtensions } from "./editorExtensions";
import { emptyDocument } from "./editorUtils";
import "./richText.css";

interface RichTextViewerProps {
  content: JSONContent | null;
}

const RichTextViewer = ({ content }: RichTextViewerProps) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content: content ?? emptyDocument,
    editable: false,
  });

  useEffect(() => {
    if (!editor) return;

    const nextContent = content ?? emptyDocument;

    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(nextContent)) {
      editor.commands.setContent(nextContent, {
        emitUpdate: false,
      });
    }
  }, [editor, content]);

  return (
    <div className="studyquest-viewer">
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextViewer;
