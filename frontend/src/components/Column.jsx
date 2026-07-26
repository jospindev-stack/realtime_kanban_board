import { Droppable } from '@hello-pangea/dnd'
import Card from './Card.jsx'
import AddCard from './AddCard.jsx'

const COLUMN_META = {
  todo:       { label: 'To Do',       color: 'from-gray-500 to-gray-400' },
  inprogress: { label: 'In Progress', color: 'from-blue-500 to-indigo-500' },
  review:     { label: 'Review',      color: 'from-amber-500 to-orange-500' },
  done:       { label: 'Done',        color: 'from-emerald-500 to-teal-500' },
}

export default function Column({ columnId, cards, onAddCard, onUpdateCard, onDeleteCard }) {
  const meta = COLUMN_META[columnId]

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${meta.color}`} />
        <span className="text-gray-300 font-semibold text-sm">{meta.label}</span>
        <span className="ml-auto bg-gray-800 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] rounded-2xl p-2 space-y-2.5 transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-indigo-500/5 ring-1 ring-indigo-500/20' : 'bg-gray-900/30'
            }`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add card */}
      <div className="mt-2 px-1">
        <AddCard onAdd={(title) => onAddCard({ title, column: columnId })} />
      </div>
    </div>
  )
}
