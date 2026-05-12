import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; 
import pg from "pg";                          
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai"; 

const app = express();

// --- Prisma 7 & PostgreSQL Adapter Setup ---
// This bridge allows Prisma to talk to Render's PostgreSQL database
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- User Heartbeat (Tracks daily minutes) ---
app.post("/api/user/heartbeat", async (req: any, res: any) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send();

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { dailyMinutes: { increment: 1 } },
      select: { dailyMinutes: true }
    });
    // Responds with dailyMinutes (matching Prisma's camelCase mapping)
    res.json({ dailyMinutes: user.dailyMinutes });
  } catch (err) {
    res.status(500).send();
  }
});

// --- Auth Routes ---

app.post("/api/auth/register", async (req: any, res: any) => {
  try {
    const { email, firstName, password } = req.body; 
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        password: hashedPassword,
      }
    });
    
    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.json({ 
      token, 
      user: { 
        ...user, 
        completedModules: JSON.parse(user.completedModules) 
      } 
    });
  } catch (err) {
    res.status(400).json({ error: "Email already registered" });
  }
});

app.post("/api/auth/login", async (req: any, res: any) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      { id: user.id, email: user.email, firstName: user.firstName }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );
    
    res.json({ 
        token, 
        user: { 
            ...user, 
            completedModules: JSON.parse(user.completedModules)
        } 
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
});

// --- User Progress Fetching ---
app.get("/api/user/progress", authenticateToken, async (req: any, res: any) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            ...user,
            completedModules: JSON.parse(user.completedModules)
        });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- Module Completion Logic ---
app.post("/api/user/complete-module", authenticateToken, async (req: any, res: any) => {
    const { moduleId, xpBonus } = req.body;
    try {
        const user = await prisma.user.findUnique({ 
          where: { id: req.user.id },
          select: { completedModules: true, xp: true }
        });

        if (!user) return res.sendStatus(404);

        let completed = JSON.parse(user.completedModules);
        
        if (!completed.includes(moduleId)) {
            completed.push(moduleId);
            const newXp = user.xp + xpBonus;
            const newLevel = Math.floor(newXp / 500) + 1;

            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    completedModules: JSON.stringify(completed),
                    xp: newXp,
                    level: newLevel
                }
            });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- AI Mentor (2026 Unified SDK Syntax) ---
app.post("/api/mentor", async (req: any, res: any) => {
  const { lastCommand, output, context } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.json({ type: 'encouragement', message: "Keep learning!" });

  try {
    // Correct 2026 SDK initialization
    const ai = new GoogleGenAI({ apiKey }); 
    
    const prompt = `
      You are a senior Linux engineer mentoring a student.
      Context: ${context.moduleTitle}
      Command: "${lastCommand}"
      Output: "${output}"

      Analyze the mistake or success and respond in strict JSON:
      {
        "type": "hint",
        "message": "your advice here"
      }
    `;

    // Modern unified call pattern for 2026
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const text = response.text || ""; 
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(jsonMatch ? jsonMatch[0] : text));
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: "AI Service Unavailable" });
  }
});

// --- Server Environment & Initialization ---
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(Number(PORT), "0.0.0.0", () => console.log(`🚀 System Online: Cloud DB connected at port ${PORT}`));
}

setupServer();