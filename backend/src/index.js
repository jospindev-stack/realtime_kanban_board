import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.js'
import { setupSocket } from './socket/handlers.js'

const app = express()
const httpServer = createServer(app)

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

const io = new Server(httpServer, {
  cors: { origin: CLIENT_URL, methods: ['GET', 'POST'] },
})

app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.get('/api/health', (_, res) => res.json({ ok: true }))

setupSocket(io)

const PORT = process.env.PORT || 3001

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err.message)
  process.exit(1)
})
