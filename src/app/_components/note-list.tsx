export default function NoteList() {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 text-base font-semibold border-b border-border">Personal</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            className={cn(
              "w-full rounded-lg border border-border bg-card text-left p-4 hover:bg-accent/50 focus-visible:ring-2",
              selectedId === n.id && "ring-2 ring-sidebar-primary bg-sidebar-primary/10",
            )}
          >
            <div className="text-sm text-muted-foreground">{new Date(n.date).toLocaleDateString()}</div>
            <div className="mt-1 font-medium">{n.title}</div>
            <div className="mt-1 text-sm text-muted-foreground line-clamp-1">{n.excerpt}</div>
          </button>
        ))} */}
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
          <p className="text-sm">No notes yet</p>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      </div>
    </div>
  )
}