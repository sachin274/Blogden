import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const port = 4000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ─── JWT Middleware ───────────────────────────────────────────────────────────
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// Register
app.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Email or username already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Post Routes ──────────────────────────────────────────────────────────────

// GET all posts — newest first
app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY date DESC");
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

// GET a specific post by id
app.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// POST a new post — protected
app.post("/posts", verifyToken, async (req, res) => {
  const { title, content, topic } = req.body;
  const author = req.user.username;
  const user_id = req.user.userId;
  try {
    const result = await pool.query(
      "INSERT INTO posts (title, content, author, user_id, topic) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, content, author, user_id, topic || "General"]
    );
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: "Error creating post" });
  }
});

// PATCH a post — protected + must own the post
app.patch("/posts/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });

    const post = result.rows[0];
    if (post.user_id !== req.user.userId)
      return res.status(403).json({ message: "You can only edit your own posts" });

    const title = req.body.title || post.title;
    const content = req.body.content || post.content;
    const topic = req.body.topic || post.topic;

    const updated = await pool.query(
      "UPDATE posts SET title = $1, content = $2, topic = $3 WHERE id = $4 RETURNING *",
      [title, content, topic, req.params.id]
    );
    res.json(updated.rows[0]);
  } catch {
    res.status(500).json({ message: "Error updating post" });
  }
});

// DELETE a post — protected + must own the post
app.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Post not found" });

    const post = result.rows[0];
    if (post.user_id !== req.user.userId)
      return res.status(403).json({ message: "You can only delete your own posts" });

    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
