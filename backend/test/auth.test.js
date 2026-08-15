import test from 'node:test'
import assert from 'node:assert/strict'

process.env.JWT_SECRET = 'test-secret'

const { default: router } = await import('../src/routes/auth.js')
const { default: User } = await import('../src/models/User.js')

function getHandler(method, path) {
  const layer = router.stack.find(
    (entry) => entry.route?.path === path && entry.route?.methods?.[method]
  )
  return layer.route.stack[0].handle
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

const register = getHandler('post', '/register')
const login = getHandler('post', '/login')

test('register rejects missing fields', async () => {
  const res = createResponse()

  await register({ body: { username: 'jospin' } }, res)

  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { error: 'All fields are required' })
})

test('register rejects short passwords', async () => {
  const res = createResponse()

  await register(
    { body: { username: 'jospin', email: 'jospin@example.com', password: '123' } },
    res
  )

  assert.equal(res.statusCode, 400)
  assert.deepEqual(res.body, { error: 'Password must be at least 6 characters' })
})

test('register returns a token and public user data', async () => {
  const originalCreate = User.create
  User.create = async ({ username, email }) => ({
    _id: 'user-1',
    username,
    email,
    color: '#3b82f6',
  })

  try {
    const res = createResponse()
    await register(
      { body: { username: 'jospin', email: 'jospin@example.com', password: 'secret1' } },
      res
    )

    assert.equal(res.statusCode, 201)
    assert.equal(typeof res.body.token, 'string')
    assert.deepEqual(res.body.user, {
      id: 'user-1',
      username: 'jospin',
      email: 'jospin@example.com',
      color: '#3b82f6',
    })
  } finally {
    User.create = originalCreate
  }
})

test('register returns conflict for duplicate email or username', async () => {
  const originalCreate = User.create
  User.create = async () => {
    const error = new Error('duplicate key')
    error.code = 11000
    error.keyPattern = { email: 1 }
    throw error
  }

  try {
    const res = createResponse()
    await register(
      { body: { username: 'jospin', email: 'jospin@example.com', password: 'secret1' } },
      res
    )

    assert.equal(res.statusCode, 409)
    assert.deepEqual(res.body, { error: 'email already taken' })
  } finally {
    User.create = originalCreate
  }
})

test('login rejects invalid credentials', async () => {
  const originalFindOne = User.findOne
  User.findOne = async () => null

  try {
    const res = createResponse()
    await login({ body: { email: 'missing@example.com', password: 'secret1' } }, res)

    assert.equal(res.statusCode, 401)
    assert.deepEqual(res.body, { error: 'Invalid credentials' })
  } finally {
    User.findOne = originalFindOne
  }
})

test('login returns token for valid credentials', async () => {
  const originalFindOne = User.findOne
  User.findOne = async ({ email }) => ({
    _id: 'user-2',
    username: 'tester',
    email,
    color: '#10b981',
    comparePassword: async (password) => password === 'secret1',
  })

  try {
    const res = createResponse()
    await login({ body: { email: 'TEST@example.com', password: 'secret1' } }, res)

    assert.equal(res.statusCode, 200)
    assert.equal(typeof res.body.token, 'string')
    assert.equal(res.body.user.email, 'test@example.com')
  } finally {
    User.findOne = originalFindOne
  }
})
