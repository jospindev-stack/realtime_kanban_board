import test from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-secret'

const { setupSocket } = await import('../src/socket/handlers.js')
const { default: Card } = await import('../src/models/Card.js')

class FakeIO {
  constructor() {
    this.middleware = null
    this.connectionHandler = null
    this.emitted = []
  }

  use(fn) {
    this.middleware = fn
  }

  on(event, fn) {
    if (event === 'connection') this.connectionHandler = fn
  }

  emit(event, payload) {
    this.emitted.push({ event, payload })
  }
}

class FakeSocket {
  constructor({ id = 'socket-1', token } = {}) {
    this.id = id
    this.handshake = { auth: { token } }
    this.user = null
    this.handlers = new Map()
    this.emitted = []
  }

  on(event, fn) {
    this.handlers.set(event, fn)
  }

  emit(event, payload) {
    this.emitted.push({ event, payload })
  }
}

function queryResult(cards) {
  return {
    sort() {
      return cards
    },
  }
}

function makeCard(overrides = {}) {
  return {
    _id: 'card-1',
    title: 'Task',
    description: '',
    column: 'todo',
    order: 0,
    priority: 'medium',
    authorId: 'user-1',
    authorName: 'Jospin',
    authorColor: '#3b82f6',
    createdAt: new Date('2026-08-15T12:00:00Z'),
    ...overrides,
  }
}

test('socket middleware rejects missing token', async () => {
  const io = new FakeIO()
  setupSocket(io)
  const socket = new FakeSocket()

  const error = await new Promise((resolve) => {
    io.middleware(socket, (err) => resolve(err))
  })

  assert.equal(error.message, 'Authentication required')
})

test('socket middleware accepts a valid JWT and attaches user', async () => {
  const io = new FakeIO()
  setupSocket(io)
  const token = jwt.sign(
    { id: 'user-1', username: 'Jospin', color: '#3b82f6' },
    process.env.JWT_SECRET
  )
  const socket = new FakeSocket({ token })

  const error = await new Promise((resolve) => {
    io.middleware(socket, (err) => resolve(err))
  })

  assert.equal(error, undefined)
  assert.equal(socket.user.username, 'Jospin')
})

test('connection emits online users and initial board', async () => {
  const originalFind = Card.find
  Card.find = () => queryResult([makeCard()])

  try {
    const io = new FakeIO()
    setupSocket(io)
    const socket = new FakeSocket()
    socket.user = { id: 'user-1', username: 'Jospin', color: '#3b82f6' }

    await io.connectionHandler(socket)

    assert.equal(io.emitted[0].event, 'users:online')
    const init = socket.emitted.find((entry) => entry.event === 'board:init')
    assert.ok(init)
    assert.equal(init.payload[0].id, 'card-1')
  } finally {
    Card.find = originalFind
  }
})

test('card creation broadcasts the serialized card', async () => {
  const originals = {
    find: Card.find,
    countDocuments: Card.countDocuments,
    create: Card.create,
  }
  Card.find = () => queryResult([])
  Card.countDocuments = async () => 2
  Card.create = async (data) => makeCard({ _id: 'card-2', order: data.order, ...data })

  try {
    const io = new FakeIO()
    setupSocket(io)
    const socket = new FakeSocket()
    socket.user = { id: 'user-1', username: 'Jospin', color: '#3b82f6' }
    await io.connectionHandler(socket)

    await socket.handlers.get('card:create')({
      title: '  New task  ',
      description: '  Details  ',
      column: 'todo',
      priority: 'high',
    })

    const created = io.emitted.find((entry) => entry.event === 'card:created')
    assert.ok(created)
    assert.equal(created.payload.title, 'New task')
    assert.equal(created.payload.description, 'Details')
    assert.equal(created.payload.order, 2)
  } finally {
    Card.find = originals.find
    Card.countDocuments = originals.countDocuments
    Card.create = originals.create
  }
})

test('card update reports missing cards to the requesting socket', async () => {
  const originals = { find: Card.find, findByIdAndUpdate: Card.findByIdAndUpdate }
  Card.find = () => queryResult([])
  Card.findByIdAndUpdate = async () => null

  try {
    const io = new FakeIO()
    setupSocket(io)
    const socket = new FakeSocket()
    socket.user = { id: 'user-1', username: 'Jospin', color: '#3b82f6' }
    await io.connectionHandler(socket)

    await socket.handlers.get('card:update')({ cardId: 'missing', title: 'Updated' })

    assert.deepEqual(socket.emitted.at(-1), {
      event: 'error',
      payload: { message: 'Card not found' },
    })
  } finally {
    Card.find = originals.find
    Card.findByIdAndUpdate = originals.findByIdAndUpdate
  }
})

test('moving a card across columns reorders both columns and broadcasts board sync', async () => {
  const originals = {
    find: Card.find,
    findById: Card.findById,
    updateOne: Card.updateOne,
  }

  const moving = makeCard({ _id: 'moving', column: 'todo', order: 1 })
  const todoCard = makeCard({ _id: 'todo-1', column: 'todo', order: 0 })
  const doneCard = makeCard({ _id: 'done-1', column: 'done', order: 0 })
  const updates = []

  Card.findById = async () => moving
  Card.updateOne = async (filter, update) => {
    updates.push({ filter, update })
  }
  Card.find = (query) => {
    if (!query) return queryResult([todoCard, doneCard, { ...moving, column: 'done', order: 1 }])
    if (query.column === 'todo') return queryResult([todoCard, moving])
    if (query.column === 'done') return queryResult([doneCard])
    return queryResult([])
  }

  try {
    const io = new FakeIO()
    setupSocket(io)
    const socket = new FakeSocket()
    socket.user = { id: 'user-1', username: 'Jospin', color: '#3b82f6' }
    await io.connectionHandler(socket)

    await socket.handlers.get('card:move')({
      cardId: 'moving',
      sourceColumn: 'todo',
      destColumn: 'done',
      sourceIndex: 1,
      destIndex: 1,
    })

    assert.ok(
      updates.some(
        ({ filter, update }) => filter._id === 'moving' && update.column === 'done' && update.order === 1
      )
    )
    const sync = io.emitted.find((entry) => entry.event === 'board:sync')
    assert.ok(sync)
    assert.equal(sync.payload.length, 3)
  } finally {
    Card.find = originals.find
    Card.findById = originals.findById
    Card.updateOne = originals.updateOne
  }
})
