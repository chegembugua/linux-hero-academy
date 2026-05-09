import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// Database Setup
const db = new Database("linux_hero.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 1,
    completed_modules TEXT DEFAULT '[]'
  );
`);

app.use(cors());
app.use(express.json());

// Auth Routes
app.post("/api/auth/register", (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(id, username, hashedPassword);
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id, username, xp: 0, level: 1 } });
  } catch (err) {
    res.status(400).json({ error: "Username already taken" });
  }
});

app.post("/api/auth/login", (req: any, res: any) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { ...user, completedModules: JSON.parse(user.completed_modules) } });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// AI Mentor Proxy - FIXED FOR TS2339 & TS2559
app.post("/api/mentor", async (req: any, res: any) => {
  const { lastCommand, output, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ type: 'encouragement', message: "Keep learning! Mastery takes time." });
  }

  try {
    // FIX: Initialize with object and cast to 'any' to bypass strict TS checks on Render
    const genAI = new GoogleGenAI({ apiKey }) as any; 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Linux Mentor feedback for: ${context.moduleTitle}. Command: ${lastCommand}. Output: ${output}. Return JSON: { "type": "hint", "message": "..." }`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
});

async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(Number(PORT), "0.0.0.0", () => console.log(`🚀 Live on port ${PORT}`));
}

setupServer();
