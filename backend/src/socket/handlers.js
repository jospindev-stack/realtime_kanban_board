import jwt from 'jsonwebtoken'
import Card from '../models/Card.js'

const onlineUsers = new Map()

function serializeCard(card) {
  return {
    id: card._id.toString(),
    title: card.title,
    description: card.description,
    column: card.column,
    order: card.order,
    priority: card.priority,
    authorId: card.authorId.toString(),
    authorName: card.authorName,
    authorColor: card.authorColor,
    createdAt: card.createdAt,
  }
}

export function setupSocket(io) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('Authentication required'))
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET)
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    const { id, username, color } = socket.user

    onlineUsers.set(socket.id, { userId: id, username, color })
    io.emit('users:online', Array.from(onlineUsers.values()))

    try {
      const cards = await Card.find().sort({ column: 1, order: 1 })
      socket.emit('board:init', cards.map(serializeCard))
    } catch {
      socket.emit('error', { message: 'Failed to load board' })
    }

    socket.on('card:create', async ({ title, description = '', column, priority = 'medium' }) => {
      try {
        const count = await Card.countDocuments({ column })
        const card = await Card.create({
          title: title?.trim(),
          description: description?.trim(),
          column,
          priority,
          order: count,
          authorId: id,
          authorName: username,
          authorColor: color,
        })
        io.emit('card:created', serializeCard(card))
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('card:update', async ({ cardId, title, description, priority }) => {
      try {
        const card = await Card.findByIdAndUpdate(
          cardId,
          { ...(title !== undefined && { title: title.trim() }), ...(description !== undefined && { description: description.trim() }), ...(priority !== undefined && { priority }) },
          { new: true }
        )
        if (!card) return socket.emit('error', { message: 'Card not found' })
        io.emit('card:updated', serializeCard(card))
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('card:delete', async ({ cardId }) => {
      try {
        const card = await Card.findByIdAndDelete(cardId)
        if (!card) return socket.emit('error', { message: 'Card not found' })
        io.emit('card:deleted', { cardId })
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('card:move', async ({ cardId, sourceColumn, destColumn, sourceIndex, destIndex }) => {
      try {
        const moving = await Card.findById(cardId)
        if (!moving) return socket.emit('error', { message: 'Card not found' })

        if (sourceColumn === destColumn) {
          const cards = await Card.find({ column: sourceColumn }).sort({ order: 1 })
          cards.splice(sourceIndex, 1)
          cards.splice(destIndex, 0, moving)
          await Promise.all(cards.map((c, i) => Card.updateOne({ _id: c._id }, { order: i })))
        } else {
          const srcCards = await Card.find({ column: sourceColumn }).sort({ order: 1 })
          srcCards.splice(sourceIndex, 1)
          await Promise.all(srcCards.map((c, i) => Card.updateOne({ _id: c._id }, { order: i })))

          const destCards = await Card.find({ column: destColumn }).sort({ order: 1 })
          destCards.splice(destIndex, 0, moving)
          await Promise.all(destCards.map((c, i) => Card.updateOne({ _id: c._id }, { order: i })))
          await Card.updateOne({ _id: cardId }, { column: destColumn, order: destIndex })
        }

        const allCards = await Card.find().sort({ column: 1, order: 1 })
        io.emit('board:sync', allCards.map(serializeCard))
      } catch (err) {
        socket.emit('error', { message: err.message })
      }
    })

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id)
      io.emit('users:online', Array.from(onlineUsers.values()))
    })
  })
}
