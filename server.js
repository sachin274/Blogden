import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ─── Page Routes ─────────────────────────────────────────────────────────────

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    res.render("index.ejs", { posts: response.data });
  } catch {
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.get("/login", (req, res) => {
  res.render("auth.ejs", { heading: "Login", action: "/login", error: null });
});

app.get("/register", (req, res) => {
  res.render("auth.ejs", { heading: "Register", action: "/register", error: null });
});

app.get("/posts/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    res.render("post.ejs", { post: response.data });
  } catch {
    res.status(404).json({ message: "Post not found" });
  }
});

app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "New Post", submit: "Create Post", post: null });
});

app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    res.render("modify.ejs", {
      heading: "Edit Post",
      submit: "Update Post",
      post: response.data,
    });
  } catch {
    res.status(500).json({ message: "Error fetching post" });
  }
});

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    const { token, user } = response.data;
    res.redirect(`/?token=${token}&username=${user.username}&userId=${user.id}`);
  } catch (err) {
    const message = err.response?.data?.message || "Registration failed";
    res.render("auth.ejs", { heading: "Register", action: "/register", error: message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    const { token, user } = response.data;
    res.redirect(`/?token=${token}&username=${user.username}&userId=${user.id}`);
  } catch (err) {
    const message = err.response?.data?.message || "Login failed";
    res.render("auth.ejs", { heading: "Login", action: "/login", error: message });
  }
});

app.get("/logout", (req, res) => {
  res.render("logout.ejs");
});

// ─── Post Action Routes ───────────────────────────────────────────────────────

app.post("/api/posts", async (req, res) => {
  const { title, content, token } = req.body;
  try {
    await axios.post(
      `${API_URL}/posts`,
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.redirect("/");
  } catch {
    res.status(500).json({ message: "Error creating post" });
  }
});

app.post("/api/posts/:id", async (req, res) => {
  const { title, content, topic, token } = req.body;
  try {
    await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      { title, content, topic },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    res.redirect("/");
  } catch {
    res.status(500).json({ message: "Error updating post" });
  }
});

app.get("/api/posts/delete/:id", async (req, res) => {
  const token = req.query.token;
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.redirect("/");
  } catch {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`Frontend server running at http://localhost:${port}`);
});
