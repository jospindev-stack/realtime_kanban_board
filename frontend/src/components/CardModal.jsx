import { useState, useEffect } from 'react'
import { X, Trash2, Save } from 'lucide-react'

const PRIORITIES = ['low', 'medium', 'high']
const PRIORITY_COLOR = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-red-400' }

export default function CardModal({ card, onClose, onUpdate, onDelete }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [priority, setPriority] = useState(card.priority)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSave = () => {
    if (!title.trim()) return
    onUpdate({ title: title.trim(), description: description.trim(), priority })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-card w-full max-w-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-base">Edit card</h3>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Title</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Card title"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Optional description…"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                    priority === p
                      ? `border-current bg-gray-800 ${PRIORITY_COLOR[p]}`
                      : 'border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-xs pt-1">
            <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                 style={{ background: card.authorColor }}>
              {card.authorName.charAt(0).toUpperCase()}
            </div>
            Created by <span className="text-gray-400">{card.authorName}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-800">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">Delete?</span>
              <button onClick={() => { onDelete(); onClose() }} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                Yes, delete
              </button>
              <button onClick={() => setConfirmDelete(false)} className="btn-ghost text-xs">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="btn-ghost text-red-400 hover:text-red-300">
              <Trash2 size={14} /> Delete
            </button>
          )}

          <button onClick={handleSave} disabled={!title.trim()} className="btn-primary">
            <Save size={14} /> Save
          </button>
        </div>
      </div>
    </div>
  )
}
