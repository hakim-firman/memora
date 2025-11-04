"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Note } from "@/lib/data/types"; 
import { cn } from "@/lib/utils";
import {
  Archive,
  FilePlus2,
  Folder,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import ProfileMenu from "./profile-menu";

type Props = {
  folders: { id: number; name: string }[];
  selectedFolderId: number | null; 
  onSelectFolder: (id: number | null) => void; 
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
  return (
    <div className="flex h-full w-full flex-col">
      <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Memora</span>
          <span className="sr-only">Notes app</span>
        </div>
        <div>
          <ProfileMenu />
        </div>
      </div>
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
              <button
                onClick={() => onSelectFolder(null)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60 focus-visible:outline-none focus-visible:ring-2",
                  selectedId === n.id &&
                    "bg-sidebar-primary/20 border border-sidebar-primary"
                )}
              >
                <div className="text-sm">{n.title}</div>
                <div className="text-xs text-muted-foreground">
                  {n.created_at
                    ? new Date(n.created_at).toLocaleDateString()
                    : "No date"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Folders */}
      <nav aria-label="Folders" className="mt-4 flex-1 overflow-y-auto">
        <div className="px-4 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Folders
        </div>
        <ul className="px-2 space-y-1">
          {/* All Notes */}
          <li key="all-notes">
            <button
              onClick={() => onSelectFolder(null)} // null = All Notes
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60",
                selectedFolderId === null &&
                  "bg-sidebar-primary/20 border border-sidebar-primary"
              )}
            >
              <Folder className="h-4 w-4" />
              <span className="text-sm">All Notes</span>
            </button>
          </li>
          {folders.map((folder) => (
            <li key={folder.id}> 
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60",
                  selectedFolderId === folder.id &&
                    "bg-sidebar-primary/20 border border-sidebar-primary"
                )}
              >
                <Folder className="h-4 w-4" />
                <span className="text-sm">{folder.name}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* More */}
        <div className="px-4 pt-6 pb-2 text-xs uppercase tracking-wide text-muted-foreground">
          More
        </div>
        <ul className="px-2 space-y-1 pb-4">
          <li>
            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60">
              <Star className="h-4 w-4" />
              <span className="text-sm">Favorites</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60">
              <Trash2 className="h-4 w-4" />
              <span className="text-sm">Trash</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-sidebar-accent/60">
              <Archive className="h-4 w-4" />
              <span className="text-sm">Archived Notes</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}