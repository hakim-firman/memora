"use client";

import { Input } from "@/components/ui/input";
import { Suspense, lazy, useMemo, useState } from "react";
import {
  MoreVertical,
  Trash2,
  CalendarDays,
  FolderIcon,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Note } from "./note-app";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGroup } from "@radix-ui/react-select";

const DynamicTipTapEditor = lazy(() => import("./tiptap-editor"));

type Props = {
  note?: Note;
  onChange?: (note: Note) => void;
  onSave?: (note: Note) => void;
  onDelete?: (id: string) => void;
  folders?: { id: number; name: string }[];
  onFolderCreated?: (folder: { id: number; name: string }) => void;
};

export default function NoteEditor({
  note,
  onChange,
  onSave,
  onDelete,
  folders = [],
  onFolderCreated,
}: Props) {
  const [local, setLocal] = useState<Note | null>(note ? { ...note } : null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  if (note && local?.id !== note.id) {
    setLocal({ ...note });
  }

  const disabled = useMemo(() => !local?.title, [local]);

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

      if (!res.ok) throw new Error(`Failed to save note: ${res.status}`);

      const data = await res.json();
      onSave?.(data.data);
      alert("✅ Note saved successfully!");
    } catch (err) {
      console.error("Error saving note:", err);
      alert("❌ Failed to save note");
    }
  };

  const handleDelete = () => {
    if (local?.id) onDelete?.(local.id);
  };

  const handleCreateFolder = async () => {
  try {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newFolderName }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = result?.message || "Failed to create folder";
      throw new Error(message);
    }

    onFolderCreated?.(result.data);
    setIsDialogOpen(false);
    setNewFolderName("");
    alert("Folder created successfully!");
  } catch (err: any) {
    console.error("Error creating folder:", err);
    alert(err.message || "Something went wrong");
  }
};


  if (!local) {
    return (
      <div className="h-full grid place-items-center">
        <div className="text-center text-muted-foreground">
          Select or create a note to start writing.
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Title Bar */}
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
              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="focus:text-blue-600"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
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

        {/* Info Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
          {/* Editable Date */}
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date</span>
            <input
              type="date"
              value={
                local.created_at
                  ? new Date(local.created_at).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => {
                const isoDate = new Date(e.target.value).toISOString();
                update("created_at", isoDate);
              }}
              className="ml-2 bg-secondary border border-border rounded-md px-2 py-1"
              aria-label="Select date"
            />
          </div>

          {/* Folder Select */}
          <div className="flex items-center gap-1.5">
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Folder</span>

            <Select
              value={local.folder ? String(local.folder) : ""}
              onValueChange={(value) => update("folder", Number(value))}
            >
              <SelectTrigger className="w-[160px] bg-secondary border border-border rounded-md px-2 py-1">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>

              <SelectContent align="start">
                <SelectGroup>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      <div className="relative flex items-center justify-between w-full">
                        <span>{f.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
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

      {/* Dialog: New Folder */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="folderName">Folder name</Label>
            <Input
              id="folderName"
              placeholder="e.g. Work Notes"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              disabled={loading}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
