"use client";

import NoteEditor from "./note-editor";
import Sidebar from "./sidebar";
import NoteList from "./note-list";
import { useEffect, useState } from "react";

export type Note = {
  created_at?: string | number | Date;
  id: string;
  title: string;
  date?: string;
  folder?: string;
  excerpt?: string;
  content?: string;
};

const foldersSeed = [
  "All Notes",
  "Personal",
  "Work",
  "Travel",
  "Events",
  "Finances",
] as const;

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("All Notes");
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();

        console.log("notes data:", data);
        setNotes(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error("Error loading notes:", err);
        setNotes([]);
      }
    };

    const fetchFolders = async () => {
      try {
        const res = await fetch("/api/folders");
        if (!res.ok) throw new Error("Failed to fetch folders");
        const data = await res.json();

        console.log("folders data:", data);
        const folderNames = (data.data || []).map((f: any) => f.name);
        setFolders(folderNames);
      } catch (err) {
        console.error("Error loading folders:", err);
        setFolders([]);
      }
    };

    fetchNotes();
    fetchFolders();
  }, []);

  useEffect(() => {
    console.log("Current notes state:", notes);
  }, [notes]);

  function handleCreateNote() {
    const id = crypto.randomUUID();
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const newNote: Note = {
      id,
      title: "Untitled",
      date,
      folder: selectedFolder,
      excerpt: "Start writing...",
      content: "",
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedId(id);
  }

  return (
    <div className="h-screen w-full flex text-foreground">
      {/* Sidebar kiri */}
      <aside className="hidden md:flex md:w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <Sidebar
          folders={["All Notes", ...folders]}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onNewNote={handleCreateNote}
          recents={Array.isArray(notes) ? notes.slice(0, 5) : []}
          selectedId={selectedId}
        />
      </aside>

      {/* Bagian utama */}
      <main className="flex flex-1">
        {/* List catatan */}
        <section className="w-96 max-w-sm border-r border-border bg-card text-card-foreground hidden sm:flex flex-col">
          <NoteList
            notes={
              Array.isArray(notes)
                ? notes.filter((note) =>
                    selectedFolder === "All Notes"
                      ? true
                      : note.folder === selectedFolder
                  )
                : []
            }
            selectedId={selectedId}
            onSelectNote={setSelectedId}
          />
        </section>

        {/* Editor */}
        <section className="flex-1 min-w-0">
          <NoteEditor />
        </section>
      </main>
    </div>
  );
}
