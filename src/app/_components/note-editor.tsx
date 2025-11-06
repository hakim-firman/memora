"use client";

import { Input } from "@/components/ui/input";
import { useState, useMemo, lazy, Suspense } from "react";
import {
  MoreVertical,
  Trash2,
  CalendarDays,
  FolderIcon,
  Star,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Note } from "@/lib/data/types";

const DynamicTipTapEditor = lazy(() => import("./tiptap-editor"));

type Props = {
  note?: Note | null;
  onChange?: (note: Note) => void;
  onSave?: (note: Note) => void;
  onDelete?: (id: string) => void;
  folders?: { id: number; name: string }[];
};

export default function NoteEditor({
  note,
  onChange,
  onSave,
  onDelete,
  folders = [],
}: Props) {
  const [local, setLocal] = useState<Note | null>(note ? { ...note } : null);

  if (note && local?.id !== note.id) setLocal({ ...note });

  const disabled = useMemo(() => !local?.title, [local]);

  const update = <K extends keyof Note>(key: K, value: Note[K]) => {
    if (!local) return;
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange?.(next);
  };

  const handleContentChange = (html: string) => {
    if (!local) return;
    const next = { ...local, content: html };
    setLocal(next);
    onChange?.(next);
  };

  const handleSave = async () => {
    if (!local) return;

    try {
      const res = await fetch(
        local.id ? `/api/notes?id=${local.id}` : "/api/notes",
        {
          method: local.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: local.title,
            content: local.content,
            folder: local.folder || null,
            created_at: local.created_at || new Date().toISOString(),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save note");

      const data = await res.json();
      onSave?.(data.data);

      toast.success("Note saved successfully!", {
        description: new Date().toLocaleString(),
      });
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async () => {
    if (!local?.id) return;

    try {
      const res = await fetch(`/api/notes?id=${local.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete note");

      onDelete?.(local.id);
      toast("Note deleted", {
        description: "The note has been permanently deleted.",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo delete"),
        },
      });
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note");
    }
  };

  const toggleFavorite = async () => {
    if (!local?.id) return;
    try {
      const res = await fetch(`/api/notes?id=${local.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...local, is_favorite: !local.is_favorite }),
      });

      if (!res.ok) throw new Error("Failed to update favorite");
      const data = await res.json();

      setLocal(data.data);
      onSave?.(data.data);

      toast(
        local.is_favorite ? "Removed from favorites" : "Added to favorites",
        {
          description: local.is_favorite
            ? "This note was removed from your favorites."
            : "This note is now marked as favorite.",
        }
      );
    } catch (err) {
      console.error("Error updating favorite:", err);
      toast.error("Failed to update favorite status");
    }
  };

  const toggleArchive = async () => {
    if (!local?.id) return;
    try {
      const res = await fetch(`/api/notes?id=${local.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...local, is_archived: !local.is_archived }),
      });

      if (!res.ok) throw new Error("Failed to update archive");
      const data = await res.json();

      setLocal(data.data);
      onSave?.(data.data);

      toast(local.is_archived ? "Removed from archives" : "Added to archives", {
        description: local.is_archived
          ? "This note was removed from your archives."
          : "This note is now marked as archived.",
      });
    } catch (err) {
      console.error("Error updating archive:", err);
      toast.error("Failed to update archive status");
    }
  };

  if (!local)
    return (
      <div className="h-full grid place-items-center text-muted-foreground">
        Select or create a note to start writing.
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <Input
            value={local.title}
            onChange={(e) => update("title", e.target.value)}
            className="bg-transparent text-2xl md:text-3xl font-semibold border-none focus-visible:ring-0 px-0"
            aria-label="Note title"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="More options"
                className="p-2 rounded-md hover:bg-accent/50"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleFavorite}>
                <Star
                  className={`mr-2 h-4 w-4 ${
                    local.is_favorite ? "text-yellow-500 fill-yellow-500" : ""
                  }`}
                />
                {local.is_favorite ? "Unfavorite" : "Add to Favorites"}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={toggleArchive}>
                <Archive
                  className="mr-2 h-4 w-4"
                />
                {local.is_archived ? "Unarchive" : "Move to Archive"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleDelete}
                className="focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            <input
              type="date"
              value={
                local.created_at
                  ? new Date(local.created_at).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                update("created_at", new Date(e.target.value).toISOString())
              }
              className="ml-2 bg-secondary border border-border rounded-md px-2 py-1"
              aria-label="Select date"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <FolderIcon className="h-4 w-4" />
            <Select
              value={local.folder ? String(local.folder) : ""}
              onValueChange={(v) => update("folder", Number(v))}
            >
              <SelectTrigger className="w-[160px] bg-secondary border border-border rounded-md px-2 py-1">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Suspense
          fallback={
            <div className="p-4 text-center text-muted-foreground">
              Loading editor...
            </div>
          }
        >
          <DynamicTipTapEditor
            content={local.content || ""}
            onUpdate={handleContentChange}
            onSave={handleSave}
          />
        </Suspense>
      </div>
    </div>
  );
}
