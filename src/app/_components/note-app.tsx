"use client";

import NoteEditor from "./note-editor";
import Sidebar from "./sidebar";
import NoteList from "./note-list";
import { useEffect, useState } from "react";

export type Note = {
  date: string | number | readonly string[] | undefined;
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  created_at?: string;
  folder: number | null;
};

// Tipe Folder
export type Folder = {
  id: number;
  name: string;
};

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getFolderNameById = (id: number | null): string => {
    if (id === null) return "All Notes";
    const folder = folders.find((f) => f.id === id);
    return folder ? folder.name : "Uncategorized";
  };

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        // Konversi folder ke number agar filter bekerja
        const noteList: Note[] = (data.data || []).map((n: any) => ({
          ...n,
          folder: n.folder !== null ? Number(n.folder) : null,
        }));
        setNotes(noteList);
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
        const folderList: Folder[] = (data.data || []).map((f: any) => ({
          id: Number(f.id),
          name: f.name,
        }));
        setFolders(folderList);
      } catch (err) {
        console.error("Error loading folders:", err);
        setFolders([]);
      }
    };

    fetchNotes();
    fetchFolders();
  }, []);

  function handleCreateNote() {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      folder: selectedFolderId,
    };

    const saveToApi = async () => {
      try {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newNote.title,
            content: newNote.content,
            folder: newNote.folder,
          }),
        });

        if (!res.ok) throw new Error("Failed to create note");

        const data = await res.json();
        console.log("Created note:", data.data);

        setNotes((prev) => [data.data, ...prev]);
        setSelectedId(data.data.id);
      } catch (err) {
        console.error("Error creating note:", err);
        alert("Failed to create note");
      }
    };

    saveToApi();
  }

  const filteredNotes = notes.filter((note) =>
    selectedFolderId === null ? true : note.folder === selectedFolderId
  );

  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  return (
    <div className="h-screen w-full flex text-foreground">
      <aside className="hidden md:flex md:w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <Sidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onNewNote={handleCreateNote}
          recents={notes.slice(0, 5)}
          selectedId={selectedId}
        />
      </aside>

      <main className="flex flex-1">
        <section className="w-96 max-w-sm border-r border-border bg-card text-card-foreground hidden sm:flex flex-col">
          <NoteList
            notes={filteredNotes}
            selectedId={selectedId}
            onSelectNote={setSelectedId}
            getFolderName={getFolderNameById}
          />
        </section>

        {/* Editor */}
        <section className="flex-1 min-w-0">
          <NoteEditor
            note={selectedNote}
            onSave={(updatedNote) => {
              setNotes((prev) =>
                prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
              );
            }}
            folders={folders} 
          />
        </section>
      </main>
    </div>
  );
}
