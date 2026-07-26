import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = Router()

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, color: user.color },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const user = await User.create({ username, email, password })
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, color: user.color } })
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0]
      return res.status(409).json({ error: `${field} already taken` })
    }
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user)
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, color: user.color } })
  } catch {
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
