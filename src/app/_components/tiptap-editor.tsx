// src/app/_components/tiptap-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Italic, Underline, List, Link2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type Props = {
  content: string;
  onUpdate: (content: string) => void;
  onSave?: () => void; 
};

export default function TipTapEditorWrapper({ content, onUpdate, onSave }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: content, // Initial content
    onUpdate: ({ editor }) => {
      // Panggil onUpdate dari parent ketika konten berubah
      onUpdate(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "p-4 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-sidebar-primary min-h-[60vh] prose prose-sm max-w-none",
      },
    },
  });

  // Perbarui konten editor jika props content berubah (misal saat ganti note)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false); // false = jangan panggil onUpdate
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full">
      {/* Toolbar & Save Button */}
      <div className="flex items-center justify-between gap-1 border-b border-border pb-2 mb-2">
        <div className="flex items-center gap-1">
          {/* Toolbar Buttons */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-sidebar-primary/20" : ""}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-sidebar-primary/20" : ""}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            className={
              editor.isActive("underline") ? "bg-sidebar-primary/20" : ""
            }
            aria-label="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive("bulletList") ? "bg-sidebar-primary/20" : ""
            }
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = window.prompt("Enter URL");
              if (url) {
                editor
                  .chain()
                  .focus()
                  .extendMarkRange("link")
                  .setLink({ href: url })
                  .run();
              }
            }}
            className={editor.isActive("link") ? "bg-sidebar-primary/20" : ""}
            aria-label="Insert Link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    editor.chain().focus().setImage({ src: imageUrl }).run();
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            aria-label="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Tombol Save memanggil fungsi onSave dari props */}
        <Button onClick={onSave} variant="default"> 
          Save
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}