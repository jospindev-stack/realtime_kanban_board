# Realtime Kanban Board

> A collaborative Kanban board built with **React**, **Express**, **MongoDB**, and **Socket.io**, featuring real-time task synchronization, drag-and-drop management, and JWT authentication.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## About

Realtime Kanban Board is a Trello-inspired task management application that allows multiple users to collaborate in real time.

The project demonstrates modern full-stack web development using **React**, **Express**, **MongoDB**, and **Socket.io**, with real-time synchronization, JWT authentication, and an intuitive drag-and-drop interface.

---

## Technology Stack

| Category                | Technology            |
| ----------------------- | --------------------- |
| Frontend                | React 18 + Vite       |
| Backend                 | Express.js            |
| Database                | MongoDB Atlas         |
| Authentication          | JSON Web Tokens (JWT) |
| Real-Time Communication | Socket.io             |
| Styling                 | Tailwind CSS          |
| Drag & Drop             | @hello-pangea/dnd     |

---

## Features

- Four workflow columns:
  - To Do
  - In Progress
  - Review
  - Done
- Drag and drop tasks between columns
- Real-time synchronization across all connected users
- JWT authentication with persistent sessions
- User registration and login
- Online users indicator
- Card creation, editing, deletion, and reordering
- Card priority management (Low, Medium, High)
- Author information displayed on every card
- Persistent storage using MongoDB Atlas or a local MongoDB instance

---

## Project Structure

```text
realtime-kanban-board/
│
├── package.json
├── .env.example
│
├── backend/
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── config/
│       │   └── db.js
│       ├── middleware/
│       │   └── auth.js
│       ├── models/
│       │   ├── User.js
│       │   └── Card.js
│       ├── routes/
│       │   └── auth.js
│       └── socket/
│           └── handlers.js
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── contexts/
        │   └── AuthContext.jsx
        └── components/
            ├── Login.jsx
            ├── Register.jsx
            ├── KanbanBoard.jsx
            ├── Column.jsx
            ├── Card.jsx
            ├── CardModal.jsx
            ├── AddCard.jsx
            └── OnlineUsers.jsx
```

---

## Architecture

```text
React Application
        │
        ▼
Socket.io Client
        │
        ▼
Express REST API
        │
        ▼
Socket.io Server
        │
        ▼
MongoDB Atlas
```

---

## Application Workflow

```text
User drags a card
        │
        ▼
Socket.io event emitted
        │
        ▼
Server updates MongoDB
        │
        ▼
Updated board is broadcast
        │
        ▼
All connected clients update instantly
```

---

## Prerequisites

- Node.js 18 or later
- MongoDB Atlas account or a local MongoDB installation

---

## Installation

Clone the repository:

```bash
git clone https://github.com/jospindev-stack/realtime-kanban-board.git
cd realtime-kanban-board
```

Install all dependencies:

```bash
npm run install:all
```

Configure the backend environment:

Linux/macOS

```bash
cp .env.example backend/.env
```

Windows

```powershell
copy .env.example backend\.env
```

Edit `backend/.env` and provide:

```env
MONGODB_URL=your_connection_string

JWT_SECRET=your_random_secret

PORT=3001

CLIENT_URL=http://localhost:5173
```

---

## Running the Project

Start both applications simultaneously:

```bash
npm run dev
```

Or start them independently:

```bash
npm run dev:backend
```

Backend:

```
http://localhost:3001
```

Frontend:

```bash
npm run dev:frontend
```

Application:

```
http://localhost:5173
```

Open two browser windows to verify that changes are synchronized in real time.

---

## Socket.io Events

### Client → Server

| Event         | Payload                                                        | Description            |
| ------------- | -------------------------------------------------------------- | ---------------------- |
| `card:create` | `{ title, column, priority }`                                  | Create a new card      |
| `card:update` | `{ cardId, title, description, priority }`                     | Update a card          |
| `card:delete` | `{ cardId }`                                                   | Delete a card          |
| `card:move`   | `{ cardId, sourceColumn, destColumn, sourceIndex, destIndex }` | Move or reorder a card |

### Server → Client

| Event          | Payload                         | Description              |
| -------------- | ------------------------------- | ------------------------ |
| `board:init`   | `Card[]`                        | Send initial board state |
| `board:sync`   | `Card[]`                        | Synchronize the board    |
| `card:created` | `Card`                          | Broadcast card creation  |
| `card:updated` | `Card`                          | Broadcast card update    |
| `card:deleted` | `{ cardId }`                    | Broadcast card deletion  |
| `users:online` | `{ userId, username, color }[]` | Send online users        |

---

## REST API

### Register

```http
POST /api/auth/register
```

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "...",
  "user": {}
}
```

---

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "...",
  "user": {}
}
```

---

## Security

The application includes:

- JWT authentication
- Password hashing using bcrypt
- Protected API routes
- Configurable CORS policy
- Environment variables for secrets
- Persistent authenticated sessions

---

## Environment Variables

| Variable      | Description                  |
| ------------- | ---------------------------- |
| `MONGODB_URL` | MongoDB connection string    |
| `JWT_SECRET`  | JWT signing secret           |
| `PORT`        | Backend server port          |
| `CLIENT_URL`  | Frontend URL allowed by CORS |

---

## Deployment

### Backend

Deploy the backend to platforms such as:

- Railway
- Render

Start command:

```bash
node src/index.js
```

Required environment variables:

- `MONGODB_URL`
- `JWT_SECRET`
- `PORT`
- `CLIENT_URL`

---

### Frontend

Deploy the frontend to:

- Vercel
- Netlify

Build:

```bash
cd frontend
npm run build
```

Generated files:

```
frontend/dist
```

Configure the frontend to communicate with the deployed backend using `VITE_API_URL` and secure WebSocket connections (`wss://`).

---

## Roadmap

Planned improvements include:

- Multiple boards
- Team workspaces
- Comments
- File attachments
- Due dates
- Notifications
- Dark mode
- Unit tests
- Integration tests
- Docker support

---

## License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute it under the terms of the license.

---

## Author

**Jospin Meka**

Software Developer

- GitHub: https://github.com/jospindev-stack
- LinkedIn: https://linkedin.com/in/jospin-meka
