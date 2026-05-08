"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const ICON = 18;
const STROKE = 2;

export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Écris ici…",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: "perso-richtext-content",
        "data-placeholder": placeholder ?? "Écris ici…",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const next = value ?? "";
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, false);
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien :", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="perso-richtext">
      <div className="perso-richtext-toolbar">
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("bold") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Gras"
        >
          <Bold size={ICON} strokeWidth={STROKE} />
        </button>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("italic") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italique"
        >
          <Italic size={ICON} strokeWidth={STROKE} />
        </button>
        <div className="perso-richtext-divider"></div>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Titre"
        >
          <Heading2 size={ICON} strokeWidth={STROKE} />
        </button>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("heading", { level: 3 }) ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Sous-titre"
        >
          <Heading3 size={ICON} strokeWidth={STROKE} />
        </button>
        <div className="perso-richtext-divider"></div>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Liste à puces"
        >
          <List size={ICON} strokeWidth={STROKE} />
        </button>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Liste numérotée"
        >
          <ListOrdered size={ICON} strokeWidth={STROKE} />
        </button>
        <div className="perso-richtext-divider"></div>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Citation"
        >
          <Quote size={ICON} strokeWidth={STROKE} />
        </button>
        <button
          type="button"
          className={`perso-richtext-btn ${editor.isActive("link") ? "is-active" : ""}`}
          onClick={setLink}
          title="Lien"
        >
          <LinkIcon size={ICON} strokeWidth={STROKE} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
