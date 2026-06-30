# Blogden

A full stack blogging platform where users can register, write, and manage their own blog posts. Built with Node.js, Express, PostgreSQL, and JWT authentication.

---

## Features

- **Authentication** — Register and login with JWT-based auth. Sessions persist across page refreshes.
- **Create Posts** — Write and publish blog posts with a title, content, and topic tag.
- **Topic Tags** — Categorize posts under topics like Technology, Finance, Health, Lifestyle, and more.
- **Ownership** — Users can only edit or delete their own posts. Other users' posts are read-only.
- **Full Post View** — Homepage shows a preview snippet. Click to read the full post on a dedicated page.
- **Newest First** — Posts are always sorted by date, most recent at the top.
- **Persistent Storage** — All data stored in a cloud PostgreSQL database (Neon).

---

## Live Demo

[https://blogden.onrender.com](https://blogden.onrender.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Server | Node.js, Express, EJS |
| REST API | Node.js, Express |
| Database | PostgreSQL (Neon) |
| Authentication | JWT, bcrypt |
| HTTP Client | Axios |
| Styling | Custom CSS |

---

## Architecture

Blogden runs as two separate servers:

```
Browser
   ↕
Frontend Server (port 3000)  —  serves EJS views, handles form submissions
   ↕  Axios (HTTP)
REST API Server (port 4000)  —  handles all data, auth, and DB queries
   ↕  SQL
PostgreSQL (Neon Cloud)
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) PostgreSQL database

### Installation

```bash
git clone https://github.com/sachin274/Blogden.git
cd Blogden
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Database Setup

Run the schema file against your PostgreSQL database to create tables and seed initial posts:

```bash
psql $DATABASE_URL -f schema.sql
```

### Running the App

Open two terminals:

**Terminal 1 — API Server:**
```bash
node index.js
```

**Terminal 2 — Frontend Server:**
```bash
node server.js
```

Visit `http://localhost:3000`

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT token |

### Posts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/posts` | Public | Get all posts (newest first) |
| GET | `/posts/:id` | Public | Get a single post |
| POST | `/posts` | Protected | Create a new post |
| PATCH | `/posts/:id` | Protected + Owner | Update a post |
| DELETE | `/posts/:id` | Protected + Owner | Delete a post |

