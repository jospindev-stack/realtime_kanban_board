# Realtime Kanban Board

> A collaborative Kanban board built with **React**, **Express**, **MongoDB**, and **Socket.io**, featuring real-time task synchronization, drag-and-drop management, and JWT authentication.

![CI](https://github.com/jospindev-stack/realtime_kanban_board/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## About

Realtime Kanban Board is a Trello-inspired task management application that allows multiple users to collaborate in real time.

The project demonstrates modern full-stack web development using **React**, **Express**, **MongoDB**, and **Socket.io**, with real-time synchronization, JWT authentication, automated backend tests, and CI validation.

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
| Testing                 | Node.js test runner   |
| CI                      | GitHub Actions        |

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
├── .github/
│   └── workflows/
│       └── ci.yml
├── package.json
├── .env.example
│
├── backend/
│   ├── package.json
│   ├── test/
│   │   ├── auth.test.js
│   │   └── socket.test.js
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
git clone https://github.com/jospindev-stack/realtime_kanban_board.git
cd realtime_kanban_board
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

```text
http://localhost:3001
```

Frontend:

```bash
npm run dev:frontend
```

Application:

```text
http://localhost:5173
```

Open two browser windows to verify that changes are synchronized in real time.

---

## Testing

The backend test suite uses the native Node.js test runner and does not require a live MongoDB instance.

Run the tests locally:

```bash
cd backend
npm test
```

The suite currently covers:

- registration validation and duplicate-user handling
- valid and invalid login flows
- Socket.io authentication with JWT
- online-user presence broadcasts
- initial board synchronization
- card creation and missing-card errors
- card movement and cross-column reordering

Mongoose model operations are mocked in the tests so backend behavior can be validated deterministically without external infrastructure.

---

## Continuous Integration

GitHub Actions runs the backend test suite automatically on pushes to `main`, pushes to `test/**` branches, and pull requests targeting `main`.

The CI workflow uses Node.js 20 and executes:

```bash
npm ci
npm test
```

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

Deploy the backend to platforms such as Railway or Render.

Start command:

```bash
node src/index.js
```

### Frontend

Deploy the frontend to Vercel or Netlify.

```bash
cd frontend
npm run build
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
- Frontend component tests
- Docker support

---

## License

This project is licensed under the **MIT License**.

---

## Author

**Jospin Meka**

Software Developer

- GitHub: https://github.com/jospindev-stack
- LinkedIn: https://linkedin.com/in/jospin-meka
