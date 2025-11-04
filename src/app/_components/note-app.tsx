"use client";

import NoteEditor from "./note-editor";
import Sidebar from "./sidebar";
import NoteList from "./note-list";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Session } from "@supabase/supabase-js";
import type { Note } from "@/lib/data/types";

export type Folder = {
  id: number;
  name: string;
};

export default function NoteApp() {
  const supabase = createClient();

  const [session, setSession] = useState<Session | null>(null);
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
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!session) {
        const localNotes = JSON.parse(localStorage.getItem("guestNotes") || "[]");
        setNotes(localNotes);
        return;
      }

      try {
        const res = await fetch("/api/notes");
        if (!res.ok) throw new Error("Failed to fetch notes");
        const data = await res.json();
        const noteList: Note[] = (data.data || []).map((n: { folder: null; }) => ({
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
      if (!session) {
        setFolders([{ id: 0, name: "Local" }]); 
        return;
      }

      try {
        const res = await fetch("/api/folders");
        if (!res.ok) throw new Error("Failed to fetch folders");
        const data = await res.json();
        const folderList: Folder[] = (data.data || []).map((f: { id: any; name: any; }) => ({
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
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    if (!session) {
      const guestNotes = JSON.parse(localStorage.getItem("guestNotes") || "[]");
      const updated = guestNotes.filter((n: Note) => n.id !== id);
      localStorage.setItem("guestNotes", JSON.stringify(updated));
      setNotes(updated);
      setSelectedId(null);
      return;
    }

    try {
      const res = await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed to delete note: ${res.status}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note");
    }
  };

  function handleCreateNote() {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      folder: selectedFolderId,
      date: undefined,
    };

    if (!session) {
      const guestNotes = JSON.parse(localStorage.getItem("guestNotes") || "[]");
      const updated = [newNote, ...guestNotes];
      localStorage.setItem("guestNotes", JSON.stringify(updated));
      setNotes(updated);
      setSelectedId(newNote.id);
      alert("Note dibuat secara lokal. Login untuk menyimpannya di cloud!");
      return;
    }

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
        setNotes((prev) => [data.data, ...prev]);
        setSelectedId(data.data.id);
      } catch (err) {
        console.error("Error creating note:", err);
        alert("Failed to create note");
      }
    };

    saveToApi();
  }

  // 🔹 Filter dan memoize note
  const filteredNotes = notes.filter((note) =>
    selectedFolderId === null ? true : note.folder === selectedFolderId
  );

  const selectedNote = useMemo(() => {
    if (selectedId === null) return null;
    return notes.find((n) => n.id === selectedId);
  }, [selectedId, notes]);

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
            key={selectedNote?.id || "empty"}
            note={selectedNote}
            onSave={(updatedNote) => {
              setNotes((prev) =>
                prev.map((n) => (n.id === updatedNote.id ? updatedNote : n))
              );
            }}
            folders={folders}
            onDelete={handleDelete}
          />

          {!session && (
            <div className="p-3 text-sm text-muted-foreground border-t border-border bg-muted/30 text-center">
              Kamu sedang dalam mode tamu. Login untuk menyimpan catatan ke cloud.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
