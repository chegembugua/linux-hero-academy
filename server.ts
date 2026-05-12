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

// Database Setup - ADDED daily_minutes
const db = new Database("linux_hero.db");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 1,
    daily_minutes INTEGER DEFAULT 0,
    completed_modules TEXT DEFAULT '[]'
  );
`);

app.use(cors());
app.use(express.json());

// Heartbeat endpoint to track practice time
app.post("/api/user/heartbeat", (req: any, res: any) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send();

  try {
    // Add 1 minute to the user's daily count
    const stmt = db.prepare("UPDATE users SET daily_minutes = daily_minutes + 1 WHERE id = ?");
    stmt.run(userId);
    
    const user = db.prepare("SELECT daily_minutes FROM users WHERE id = ?").get(userId) as any;
    res.json({ dailyMinutes: user.daily_minutes });
  } catch (err) {
    res.status(500).send();
  }
});

// Auth Routes - Included daily_minutes in login response
app.post("/api/auth/register", (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(id, username, hashedPassword);
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id, username, xp: 0, level: 1, dailyMinutes: 0 } });
  } catch (err) {
    res.status(400).json({ error: "Username already taken" });
  }
});

app.post("/api/auth/login", (req: any, res: any) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
        token, 
        user: { 
            ...user, 
            completedModules: JSON.parse(user.completed_modules),
            dailyMinutes: user.daily_minutes 
        } 
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// AI Mentor Proxy (Same as before)
app.post("/api/mentor", async (req: any, res: any) => {
  const { lastCommand, output, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.json({ type: 'encouragement', message: "Keep learning!" });

  try {
    const ai = new GoogleGenAI({ apiKey }) as any; 
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Linux Mentor feedback for: ${context.moduleTitle}. Command: ${lastCommand}. Output: ${output}. Return JSON: { "type": "hint", "message": "..." }`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
  } catch (err) {
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