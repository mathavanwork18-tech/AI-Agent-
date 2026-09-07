# AgentHeal — Autonomous AI Agent Engineering Platform

> **AI that engineers AI agents.**
> Autonomous agent generation, synthetic benchmark testing, failure diagnosis, self-healing prompt optimization, and production deployment.

---

## 🌟 Key Features

1. **Autonomous Agent Creation**: Transforms natural language requirements into comprehensive, production-grade AI agent specifications.
2. **Deterministic Benchmark Suite**: Automatically generates and executes benchmark test suites (TC-001 through TC-008) evaluating accuracy, intent routing, and boundary edge cases.
3. **Automated Root-Cause Diagnosis**: Deep failure analysis classifying hallucinations, policy violations, and unhandled edge conditions.
4. **Self-Healing Optimization Loop**: Multi-generation prompt refinement that fixes failures, optimizes instructions, and retests until reaching 100% benchmark accuracy.
5. **Dify AI Agent Gateway**: Resilient server-to-server gateway supporting Dify workflows and chat applications with automatic fallbacks and live diagnostics.
6. **First-Visit User Onboarding**: Fast, privacy-preserving onboarding with MongoDB Atlas persistence and localized session management.
7. **Production Package Export**: One-click download of production-ready agent bundles (`.zip`) with system prompts, configuration schemas, and evaluation reports.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Installation

```bash
# Clone repository
git clone https://github.com/mathavanwork18-tech/AI-Agent-.git
cd AI-Agent-

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

Copy `.env.example` to `.env` in `backend/`:

```bash
cp backend/.env.example backend/.env
```

Configure your API keys:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Gemini Intelligence Engine
GEMINI_API_KEY=your_gemini_api_key_here

# Dify AI Agent Integration (Optional)
DIFY_API_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key_here
DIFY_APP_TYPE=chat

# MongoDB Atlas Connection
MONGODB_URI=your_mongodb_connection_string
```

### 3. Running Locally

```bash
# Start backend server (Port 3001)
cd backend && npm run dev

# In another terminal, start frontend (Port 5173)
cd frontend && npm run dev
```

Visit **http://localhost:5173** to launch the AgentHeal workspace!

---

## 🌐 Deploy to Netlify

This repository is pre-configured with `netlify.toml` and Netlify Serverless Functions for full-stack deployment.

### Option A: Via Netlify Git Integration (Recommended)
1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: configure Netlify fullstack deployment"
   git push origin main
   ```
2. In [Netlify Dashboard](https://app.netlify.com/):
   * Click **"Add new site"** &rarr; **"Import an existing project"** &rarr; select **`mathavanwork18-tech/AI-Agent-`**.
   * Netlify will auto-detect the configuration from `netlify.toml`:
     * **Build command**: `npm run install:all && npm run build`
     * **Publish directory**: `frontend/dist`
     * **Functions directory**: `netlify/functions`
3. Add your Environment Variables in Netlify **Site configuration > Environment variables**:
   * `GEMINI_API_KEY`: Your Gemini API key
   * `MONGODB_URI`: (Optional) MongoDB Atlas connection string
   * `DIFY_API_KEY` & `DIFY_API_URL`: (Optional) Dify integration keys
4. Click **Deploy Site**!

### Option B: Via Netlify CLI
```bash
npx netlify-cli deploy --prod
```


---

## 🧪 Test Suites

```bash
# Test User Onboarding & MongoDB Flow
node backend/test/user_onboarding.test.mjs

# Test Dify AI Agent Integration
node backend/test/dify_integration.test.mjs

# Test Autonomous Orchestration Engine
node backend/test/orchestration.test.mjs

# Run full end-to-end platform verification
node scratch/verify_all.mjs
```

---

## 🛡️ Architecture & Security
- **React 18 + Vite**: Modern, dark-mode glassmorphic interface with zero client-side credential exposure.
- **Express / Node.js Backend**: Secure reverse proxy and state engine ensuring database URIs and LLM keys remain protected.
- **MongoDB Atlas**: Persistent cloud user store with local fallback.
