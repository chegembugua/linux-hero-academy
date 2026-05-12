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

// Database Setup - EXPANDED FOR ENTERPRISE ARCHITECTURE
const db = new Database("linux_hero.db");
db.exec(`
 CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    first_name TEXT,
    password TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 1,
    daily_minutes INTEGER DEFAULT 0,
    completed_modules TEXT DEFAULT '[]'
  );

  -- NEW: Track every command for the AI to analyze later
  CREATE TABLE IF NOT EXISTS command_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    command TEXT,
    is_correct BOOLEAN,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- NEW: Track specific enterprise labs
  CREATE TABLE IF NOT EXISTS lab_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    lab_id TEXT,
    status TEXT DEFAULT 'IN_PROGRESS',
    score INTEGER DEFAULT 0,
    UNIQUE(user_id, lab_id)
  );
`);

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
// This protects your new routes so only logged-in users can access them
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Heartbeat endpoint to track practice time
app.post("/api/user/heartbeat", (req: any, res: any) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send();

  try {
    const stmt = db.prepare("UPDATE users SET daily_minutes = daily_minutes + 1 WHERE id = ?");
    stmt.run(userId);
    
    const user = db.prepare("SELECT daily_minutes FROM users WHERE id = ?").get(userId) as any;
    res.json({ dailyMinutes: user.daily_minutes });
  } catch (err) {
    res.status(500).send();
  }
});

// --- Auth Routes (UPDATED FOR EMAIL & FIRST NAME) ---
app.post("/api/auth/register", (req: any, res: any) => {
  try {
    const { email, firstName, password } = req.body; 
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    
    db.prepare("INSERT INTO users (id, email, first_name, password) VALUES (?, ?, ?, ?)").run(id, email, firstName, hashedPassword);
    
    const token = jwt.sign({ id, email, firstName }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id, email, firstName, xp: 0, level: 1, dailyMinutes: 0 } });
  } catch (err) {
    res.status(400).json({ error: "Email already registered" });
  }
});

app.post("/api/auth/login", (req: any, res: any) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, email: user.email, firstName: user.first_name }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ 
        token, 
        user: { 
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            completedModules: JSON.parse(user.completed_modules),
            dailyMinutes: user.daily_minutes 
        } 
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// --- Progress Routes (NEW) ---

// Route to fetch progress on page load
app.get("/api/user/progress", authenticateToken, (req: any, res: any) => {
    try {
        const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id) as any;
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            userId: user.id,
            email: user.email,
            firstName: user.first_name,
            xp: user.xp,
            level: user.level,
            streak: user.streak,
            dailyMinutes: user.daily_minutes,
            completedModules: JSON.parse(user.completed_modules)
        });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// Route to save module completion permanently
app.post("/api/user/complete-module", authenticateToken, (req: any, res: any) => {
    const { moduleId, xpBonus } = req.body;
    try {
        const user = db.prepare("SELECT completed_modules, xp FROM users WHERE id = ?").get(req.user.id) as any;
        let completed = JSON.parse(user.completed_modules);
        
        if (!completed.includes(moduleId)) {
            completed.push(moduleId);
            const newXp = user.xp + xpBonus;
            const newLevel = Math.floor(newXp / 500) + 1;

            const stmt = db.prepare(`
                UPDATE users 
                SET completed_modules = ?, xp = ?, level = ? 
                WHERE id = ?
            `);
            stmt.run(JSON.stringify(completed), newXp, newLevel, req.user.id);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- AI Mentor Proxy ---
app.post("/api/mentor", async (req: any, res: any) => {
  const { lastCommand, output, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.json({ type: 'encouragement', message: "Keep learning!" });

  try {
    const genAI = new GoogleGenAI({ apiKey }) as any; 
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a senior Linux engineer mentoring a junior student.
      Context: ${context.moduleTitle}
      The student just typed the command: "${lastCommand}"
      The terminal output was: "${output}"

      Analyze their command carefully.
      1. If correct: Congratulate them briefly.
      2. If syntax error: Explain what the flag or command actually does, but do not give the exact answer.
      3. If completely lost: Give them a subtle hint.
      
      You MUST respond in strict JSON format like this:
      {
        "type": "hint",
        "message": "Your mentor response here"
      }
    `;

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