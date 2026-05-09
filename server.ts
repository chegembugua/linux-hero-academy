import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Initialization
const app = express();

// --- PRODUCTION UPGRADES ---
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// Database Setup
const dbPath = "linux_hero.db";
const db = new Database(dbPath);
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

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

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.post("/api/auth/register", (req: any, res: any) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    
    const stmt = db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)");
    stmt.run(id, username, hashedPassword);
    
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
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        xp: user.xp, 
        level: user.level,
        streak: user.streak,
        completedModules: JSON.parse(user.completed_modules)
      } 
    });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// AI Mentor Proxy
app.post("/api/mentor", async (req: any, res: any) => {
  const { lastCommand, output, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return res.json({ 
      type: 'encouragement', 
      message: "Pro-Tip: Always keep learning. Proficiency in Linux is the foundation of all cloud engineering." 
    });
  }

  try {
    // We use 'as any' here to bypass the strict type checking that's failing on Render
    const genAI = new GoogleGenAI(apiKey) as any;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) as any;
    
    const prompt = `
      You are a professional Linux Mentor. A student is learning Linux terminal.
      Current Module: ${context.moduleTitle}
      Objective: ${context.objective}
      Last Command: ${lastCommand}
      Output: ${output}
      
      Provide brief engineering feedback (under 3 sentences). 
      Return JSON: { "type": "hint"|"explanation"|"encouragement", "message": "..." }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanedJson = jsonMatch ? jsonMatch[0] : text;
    res.json(JSON.parse(cleanedJson));
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
});

// Setup serving
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Linux Hero is live on port ${PORT}`);
  });
}

setupServer();
