"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  Folder,
  MoreVertical,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Note } from "./note-app";

type Props = {
  note?: Note;
  onChange?: (note: Note) => void;
  onSave?: (note: Note) => void;
  folders?: { id: number; name: string }[];
};

const DynamicTipTapEditor = lazy(() => import("./tiptap-editor"));

export default function NoteEditor({ note, onChange, onSave, folders }: Props) {
  const [local, setLocal] = useState<Note | null>(note ? { ...note } : null);

  if (note && local?.id !== note.id) {
    setLocal({ ...note });
  }

  const disabled = useMemo(() => !local?.title || !local?.content, [local]);

  function update<K extends keyof Note>(key: K, value: Note[K]) {
    if (!local) return;
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  }

  const handleContentChange = (html: string) => {
  if (!local) return;
  const next = { ...local, content: html };
  setLocal(next);
  onChange?.(next); 
};

  const handleSave = async () => {
    if (!local) return;

    try {
      let res;
      if (local.id) {
        // Update note
        res = await fetch(`/api/notes?id=${local.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: local.title,
            content: local.content,
            folder: local.folder || null,
          }),
        });
      } else {
        res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: local.title,
            content: local.content,
            folder: local.folder || null,
          }),
        });
      }

      if (!res.ok) {
        throw new Error(`Failed to save note: ${res.status}`);
      }

      const data = await res.json();
      console.log("Saved note:", data.data);

      // Panggil onSave di parent untuk update state notes
      onSave?.(data.data);

      alert("Note saved successfully!");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Failed to save note");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Empty state */}
      {!local ? (
        <div className="h-full grid place-items-center">
          <div className="text-center text-muted-foreground">
            Select or create a note to start writing.
          </div>
        </div>
      ) : (
        <>
          {/* Title bar */}
          <div className="px-6 py-5 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <Input
                value={local.title}
                onChange={(e) => update("title", e.target.value)}
                className="bg-transparent text-2xl md:text-3xl font-semibold border-none focus-visible:ring-0 px-0"
                aria-label="Note title"
              />
              <button
                aria-label="More options"
                className="p-2 rounded-md hover:bg-accent/50"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            {/* Meta */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={
                    local.created_at
                      ? new Date(local.created_at).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => update("created_at", e.target.value)}
                  className="ml-2 bg-secondary border border-border rounded-md px-2 py-1"
                  aria-label="Select date"
                />
              </div>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Folder</span>
                <select
                  value={local.folder || ""}
                  onChange={(e) =>
                    update(
                      "folder",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="ml-2 bg-secondary border border-border rounded-md px-2 py-1"
                  aria-label="Select folder"
                >
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <Suspense fallback={<div className="p-4 text-center text-muted-foreground">Loading editor...</div>}>
              <DynamicTipTapEditor
                content={local.content || ""} 
                onUpdate={handleContentChange} 
                onSave={handleSave}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}
