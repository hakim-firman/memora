"use client";

import type { Note } from "@/lib/data/types";
import { cn, stripHtml } from "@/lib/utils";

export default function NoteList({
  notes,
  selectedId,
  onSelectNote,
  getFolderName,
  selectedFolderId,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  getFolderName?: (id: number | null | string) => string | null;
  selectedFolderId: string | number | null;
}) {
  let folderLabel: string;

  if (
    selectedFolderId === null ||
    selectedFolderId === undefined ||
    selectedFolderId === "all"
  ) {
    folderLabel = "All Notes";
  } else if (
    typeof selectedFolderId === "string" &&
    ["favorites", "archived", "trash"].includes(selectedFolderId)
  ) {
    folderLabel =
      selectedFolderId.charAt(0).toUpperCase() + selectedFolderId.slice(1);
  } else {
    const name = getFolderName?.(Number(selectedFolderId));
    folderLabel = name || "Notes";
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 text-base font-semibold border-b border-border">
        {folderLabel}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <p className="text-sm">No notes yet</p>
            <p className="text-sm">Create your first note to get started</p>
          </div>
        ) : (
          notes.map((n) => (
            <button
              key={n.id}
              onClick={() => onSelectNote(n.id)}
              className={cn(
                "w-full rounded-lg border border-border bg-card text-left p-4 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring outline-none transition-colors",
                selectedId === n.id &&
                  "ring-2 ring-sidebar-primary bg-sidebar-primary/10 border-sidebar-primary"
              )}
            >
              <div className="text-xs text-muted-foreground">
                {n.created_at
                  ? new Date(n.created_at).toLocaleDateString()
                  : "No date"}
              </div>

              <div className="mt-1 font-medium truncate">
                {n.title || "Untitled"}
              </div>

              <div className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {stripHtml(n.excerpt || n.content || "")}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
