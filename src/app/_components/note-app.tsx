"use client"
import NoteEditor from "./note-editor"
import Sidebar from "./sidebar"
import NoteList from "./note-list"
import { useEffect, useState } from "react"

export type Note = {
  id: string
  title: string
  date: string 
  folder: string
  excerpt: string
  content: string
}

const foldersSeed = ["All Notes", "Personal", "Work", "Travel", "Events", "Finances"] as const

export default function NoteApp() {
  const [notes, setNotes] = useState<Note[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>("All Notes")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/notes")
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch notes")
      }
      return res.json()
    })
    .then(data => {
      console.log('notes data')
      console.log(data)
      setNotes(data.data)
    })
    fetch("/api/folders")
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch folders")
      }
      return res.json()
    })
    .then(data => {
      console.log('folders data')
      console.log(data)
    })
  }, [])  
  
  useEffect(() => {
    console.log(notes)
  }, [notes])
  
  function handleCreateNote() {
    const id = crypto.randomUUID()
    const now = new Date()
    const date = now.toISOString().slice(0, 10)
    const newNote: Note = {
      id,
      title: "Untitled",
      date,
      folder: selectedFolder,
      excerpt: "Start writing...",
      content: "",
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedId(id)
  }

  return (
    <div className="h-screen w-full flex bg-red text-foreground">
      <aside className="hidden md:flex md:w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <Sidebar 
         folders={foldersSeed as unknown as string[]}
         selectedFolder={selectedFolder}
         onSelectFolder={setSelectedFolder}
         onNewNote={handleCreateNote}
         recents={notes.slice(0, 5)}
         selectedId={selectedId}
        />
      </aside>
      <main className="flex flex-1">
        <section className="w-96 max-w-sm border-r border-border bg-card text-card-foreground hidden sm:flex flex-col"> 
        <NoteList />
        </section>
        <section className="flex-1 min-w-0">
          <NoteEditor/>
        </section>
      </main>
    </div>
  )
}  