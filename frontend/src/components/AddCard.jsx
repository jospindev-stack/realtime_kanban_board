import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export default function AddCard({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const submit = () => {
    const trimmed = title.trim()
    if (trimmed) {
      onAdd(trimmed)
      setTitle('')
      setOpen(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') { setOpen(false); setTitle('') }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800/60
                   text-sm px-3 py-2 rounded-xl transition-all duration-150 group"
      >
        <Plus size={15} className="group-hover:text-indigo-400 transition-colors" />
        Add card
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Card title…"
        rows={2}
        className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-white
                   placeholder-gray-600 text-sm resize-none focus:outline-none focus:ring-2
                   focus:ring-indigo-500/50 transition-all"
      />
      <div className="flex gap-2">
        <button onClick={submit} disabled={!title.trim()} className="btn-primary text-xs px-3 py-1.5">
          <Plus size={13} /> Add
        </button>
        <button onClick={() => { setOpen(false); setTitle('') }} className="btn-ghost">
          <X size={13} />
        </button>
      </div>
    </div>
  )
}
