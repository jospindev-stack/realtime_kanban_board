import { useState } from 'react'
import { Draggable } from '@hello-pangea/dnd'
import CardModal from './CardModal.jsx'

const PRIORITY_BADGE = {
  low:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  high:   'bg-red-500/15 text-red-400 border-red-500/25',
}

export default function Card({ card, index, onUpdate, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setModalOpen(true)}
            className={`bg-gray-800 border rounded-xl p-3.5 cursor-pointer transition-all duration-150 group
              ${snapshot.isDragging
                ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10 rotate-1 scale-105'
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
              }`}
          >
            <p className="text-white text-sm leading-snug mb-3 line-clamp-3">{card.title}</p>

            {card.description && (
              <p className="text-gray-500 text-xs mb-3 line-clamp-2">{card.description}</p>
            )}

            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${PRIORITY_BADGE[card.priority]}`}>
                {card.priority}
              </span>
              <div
                title={card.authorName}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: card.authorColor }}
              >
                {card.authorName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        )}
      </Draggable>

      {modalOpen && (
        <CardModal
          card={card}
          onClose={() => setModalOpen(false)}
          onUpdate={(updates) => onUpdate(card.id, updates)}
          onDelete={() => onDelete(card.id)}
        />
      )}
    </>
  )
}
