import { useState, useEffect, useRef, useCallback } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { io } from 'socket.io-client'
import Column from './Column.jsx'
import OnlineUsers from './OnlineUsers.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { LogOut, Kanban, Wifi, WifiOff } from 'lucide-react'

const COLUMNS = ['todo', 'inprogress', 'review', 'done']

function buildBoard(cards) {
  const board = {}
  COLUMNS.forEach((col) => { board[col] = [] })
  cards.forEach((card) => {
    if (board[card.column]) board[card.column].push(card)
  })
  COLUMNS.forEach((col) => board[col].sort((a, b) => a.order - b.order))
  return board
}

export default function KanbanBoard() {
  const { user, token, logout } = useAuth()
  const [board, setBoard] = useState(() => buildBoard([]))
  const [onlineUsers, setOnlineUsers] = useState([])
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('board:init', (cards) => setBoard(buildBoard(cards)))
    socket.on('board:sync', (cards) => setBoard(buildBoard(cards)))

    socket.on('card:created', (card) => {
      setBoard((prev) => {
        const col = [...(prev[card.column] || []), card].sort((a, b) => a.order - b.order)
        return { ...prev, [card.column]: col }
      })
    })

    socket.on('card:updated', (card) => {
      setBoard((prev) => {
        const updated = { ...prev }
        COLUMNS.forEach((col) => {
          updated[col] = updated[col].map((c) => (c.id === card.id ? card : c))
        })
        return updated
      })
    })

    socket.on('card:deleted', ({ cardId }) => {
      setBoard((prev) => {
        const updated = { ...prev }
        COLUMNS.forEach((col) => {
          updated[col] = updated[col].filter((c) => c.id !== cardId)
        })
        return updated
      })
    })

    socket.on('users:online', (users) => setOnlineUsers(users))

    return () => socket.disconnect()
  }, [token])

  const onDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    setBoard((prev) => {
      const next = { ...prev }
      const srcCol = [...next[source.droppableId]]
      const [moved] = srcCol.splice(source.index, 1)

      if (source.droppableId === destination.droppableId) {
        srcCol.splice(destination.index, 0, moved)
        next[source.droppableId] = srcCol
      } else {
        const destCol = [...next[destination.droppableId]]
        destCol.splice(destination.index, 0, { ...moved, column: destination.droppableId })
        next[source.droppableId] = srcCol
        next[destination.droppableId] = destCol
      }
      return next
    })

    socketRef.current?.emit('card:move', {
      cardId: draggableId,
      sourceColumn: source.droppableId,
      destColumn: destination.droppableId,
      sourceIndex: source.index,
      destIndex: destination.index,
    })
  }, [])

  const handleAddCard = useCallback(({ title, column }) => {
    socketRef.current?.emit('card:create', { title, column })
  }, [])

  const handleUpdateCard = useCallback((cardId, updates) => {
    socketRef.current?.emit('card:update', { cardId, ...updates })
  }, [])

  const handleDeleteCard = useCallback((cardId) => {
    socketRef.current?.emit('card:delete', { cardId })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Kanban size={22} className="text-indigo-400" />
          <span className="font-bold text-white text-lg">Kanban Board</span>
          <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
            connected
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : 'text-gray-500 border-gray-700 bg-gray-800/50'
          }`}>
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? 'Live' : 'Connecting…'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <OnlineUsers users={onlineUsers} />
          <div className="flex items-center gap-2.5 pl-4 border-l border-gray-800">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: user.color }}
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-300 text-sm font-medium hidden sm:block">{user.username}</span>
            <button onClick={logout} className="btn-ghost ml-1">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-5 min-w-max">
            {COLUMNS.map((col) => (
              <Column
                key={col}
                columnId={col}
                cards={board[col] || []}
                onAddCard={handleAddCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
              />
            ))}
          </div>
        </DragDropContext>
      </main>
    </div>
  )
}
