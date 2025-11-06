"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Note } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import {
  Archive,
  FilePlus2,
  Folder,
  Plus,
  Search,
  Star,
  Trash2,
  Pencil,
  Trash,
  Check,
  X,
} from "lucide-react";
import ProfileMenu from "./profile-menu";

type Props = {
  folders: { id: number; name: string }[];
  selectedFolderId: number | string | null;
  onSelectFolder: (id: number | string | null) => void;
  onNewNote: () => void;
  recents: Note[];
  selectedId: string | null;
};

export default function Sidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onNewNote,
  recents,
  selectedId,
}: Props) {
  const [folderList, setFolderList] = useState(folders);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setFolderList(folders);
  }, [folders]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      const { data } = await res.json();
      setFolderList((prev) => [...prev, data]);
    } catch (err) {
      console.error("Offline/guest mode, folder not saved:", err);
      setFolderList((prev) => [
        ...prev,
        { id: Date.now(), name: newFolderName },
      ]);
    } finally {
      setNewFolderName("");
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-sidebar-border">
        <span className="text-lg font-semibold">Memora</span>
        <ProfileMenu />
      </div>

      {/* New Note */}
      <div className="p-4">
        <Button
          onClick={onNewNote}
          className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90"
        >
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="px-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-8 bg-secondary border-sidebar-border"
          />
        </div>
      </div>

      {/* Recents */}
      <nav aria-label="Recent notes" className="mt-4">
        <div className="px-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Recents
        </div>
        <ul className="px-2 space-y-1 overflow-y-auto max-h-44">
          {recents.map((n) => (
            <li key={n.id}>
              <Button
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start px-2.5 py-2 text-left rounded-md hover:bg-sidebar-accent/60",
                  selectedId === n.id &&
                    "bg-sidebar-primary/20 border border-sidebar-primary"
                )}
              >
                <span onClick={() => onSelectFolder(null)}>
                  <div className="text-sm">{n.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleDateString()
                      : "No date"}
                  </div>
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Folders */}
      <nav aria-label="Folders" className="mt-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Folders
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={() => setCreating(!creating)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {creating && (
          <div className="flex items-center gap-2 px-4 pb-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="text-sm"
            />
            <Button size="icon" variant="ghost" onClick={handleCreateFolder}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setCreating(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <ul className="px-2 space-y-1">
          {/* All Notes */}
          <li>
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60",
                selectedFolderId === null &&
                  "bg-sidebar-primary/20 border border-sidebar-primary"
              )}
            >
              <span onClick={() => onSelectFolder(null)}>
                <Folder className="h-4 w-4" />
                <span className="text-sm">All Notes</span>
              </span>
            </Button>
          </li>

          {folderList.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onSelect={() => onSelectFolder(folder.id)}
              onRename={(newName) => {
                setFolderList((prev) =>
                  prev.map((f) =>
                    f.id === folder.id ? { ...f, name: newName } : f
                  )
                );
              }}
              onDelete={() => {
                setFolderList((prev) => prev.filter((f) => f.id !== folder.id));
              }}
            />
          ))}
        </ul>

        {/* More */}
        <div className="px-4 pt-6 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          More
        </div>
        <ul className="px-2 space-y-1 pb-4">
          {/* Favorites */}
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors",
                "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                selectedFolderId === "favorites" &&
                  "bg-sidebar-primary/20 border border-sidebar-primary"
              )}
              onClick={() => onSelectFolder("favorites")}
            >
              <Star className="h-4 w-4" />
              <span className="text-sm">Favorites</span>
            </Button>
          </li>

          {/* Trash */}
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors",
                "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                selectedFolderId === "trash" &&
                  "bg-sidebar-primary/20 border border-sidebar-primary"
              )}
              onClick={() => onSelectFolder("trash")}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Trash</span>
            </Button>
          </li>

          {/* Archived */}
          <li>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors",
                "hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                selectedFolderId === "archived" &&
                  "bg-sidebar-primary/20 border border-sidebar-primary"
              )}
              onClick={() => onSelectFolder("archived")}
            >
              <Archive className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Archived Notes</span>
            </Button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function FolderItem({
  folder,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  folder: { id: number; name: string };
  isSelected: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);

  const handleRename = async () => {
    setIsEditing(false);
    if (name.trim() === folder.name) return;
    try {
      const res = await fetch(`/api/folders/${folder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update folder");
      onRename(name);
    } catch (err) {
      console.error("Rename failed:", err);
      onRename(name);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete folder "${folder.name}"?`)) return;
    try {
      const res = await fetch(`/api/folders?id=${folder.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      onDelete();
    } catch (err) {
      console.error("Delete failed:", err);
      onDelete();
    }
  };

  return (
    <li className="group relative">
      {isEditing ? (
        <div className="flex items-center gap-2 px-2.5">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="text-sm py-1"
            autoFocus
          />
        </div>
      ) : (
        <Button
          asChild
          variant="ghost"
          className={cn(
            "w-full justify-between px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60",
            isSelected && "bg-sidebar-primary/20 border border-sidebar-primary"
          )}
        >
          <span
            onClick={onSelect}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <Folder className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">{folder.name}</span>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <Button asChild size="icon" variant="ghost" className="h-5 w-5">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </span>
              </Button>
              <Button
                asChild
                size="icon"
                variant="ghost"
                className="h-5 w-5 text-red-500 hover:text-red-600"
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                >
                  <Trash className="h-3.5 w-3.5" />
                </span>
              </Button>
            </div>
          </span>
        </Button>
      )}
    </li>
  );
}
