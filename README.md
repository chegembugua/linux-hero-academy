# Linux Hero: Professional Engineering Path

A professional, full-stack Linux and Bash training ecosystem. From absolute beginner to Cloud Engineer through simulated terminal practice, real-world troubleshooting scenarios, and professional DevOps labs.

## Features

- **Real Terminal Environment**: High-fidelity terminal simulation with realistic Linux behavior.
- **Engineering Path**: Structured modules covering Linux SysAdmin, Docker, Networking, and Cloud Engineering.
- **Professional Routine**: 1-hour daily focused practice system.
- **AI Mentorship**: Real-time feedback and guidance (powered by Google Gemini).
- **Troubleshooting Scenarios**: Real-world production outage simulations.
- **Gamification**: XP, Levels, and Engineering Ranks.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: SQLite (via better-sqlite3).
- **Authentication**: JWT (JSON Web Tokens).
- **AI**: Google Generative AI (Gemini API).

## Local Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd linux-hero-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Deployment

### Docker

Build and run with Docker:
```bash
docker build -t linux-hero .
docker run -p 3000:3000 --env-file .env linux-hero
```

### Railway / Render

1. Connect your GitHub repository.
2. Set the Environment Variables (`JWT_SECRET`, `GEMINI_API_KEY`).
3. Railway/Render will automatically detect the `package.json` and start the build/deployment process.
4. The start command is `npm run start`.

## Project Structure

- `src/`: Client-side React application.
- `server.ts`: Express backend server and API routes.
- `metadata.json`: App metadata.
- `Dockerfile`: Container configuration.
- `firebase-blueprint.json`: (Optional) Database schema for migration.

## License

MIT
