# 🧬 NeuroGenesis AI — AI-Powered Biomedical Research Platform v2.0

> A startup-grade, enterprise-level biomedical AI research platform for drug repurposing, protein analysis, disease intelligence, and AI-powered research generation.

![NeuroGenesis AI Banner](https://img.shields.io/badge/NeuroGenesis%20AI-v2.0-blue?style=for-the-badge&logo=molecule)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwindcss)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)

---

## ✨ Platform Features

| Feature | Description | Data Sources |
|---------|-------------|-------------|
| 🤖 **AI Research Copilot** | Real-time streaming biomedical chat | Gemini 2.0 Flash |
| 💊 **Drug Repurposing Engine** | Molecular similarity + AI reasoning | PubChem, ChEMBL |
| 🧬 **Protein Structure Explorer** | Interactive 3D visualization with 3DMol.js | UniProt, PDB, ESMFold |
| 🏥 **Disease Intelligence Dashboard** | Disease profiles, trials, proteins | ClinicalTrials.gov |
| 📄 **Paper Analyzer** | PubMed search + AI extraction | PubMed/NCBI |
| ⚛️ **Molecular Docking** | Drug-protein simulation + heatmaps | AI-generated |
| 📊 **AI Report Generator** | Research reports, hypotheses, abstracts | Gemini AI |
| 🗂️ **Research Workspace** | Save and manage experiments | Local store |

---

## 🏗️ Architecture

```
neurogenesis-ai/
├── src/                     # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── layout/          # Navbar, Sidebar
│   │   ├── ui/              # Button, Card, Badge, Input, ProgressBar
│   │   └── ProteinViewer.tsx # 3D protein viewer (3DMol.js)
│   ├── pages/               # All application pages
│   ├── services/
│   │   ├── api.ts           # External biomedical API integrations
│   │   └── gemini.ts        # Gemini AI streaming + generation
│   ├── store/               # Zustand global state
│   ├── types/               # TypeScript type definitions
│   └── lib/utils.ts         # Shared utilities
├── server/
│   └── index.ts             # Express API server
├── Dockerfile               # Docker support
├── vercel.json              # Vercel deployment config
└── .env.example             # Environment variable template
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```env
# Required for AI features
GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Required for authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional - for real protein structure prediction
NVIDIA_NIM_API_KEY=your_nvidia_key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 API Keys Setup

### Gemini AI (Required for AI features)
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add as `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY`

### Clerk Authentication (Required for login)
1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy `Publishable Key` → `VITE_CLERK_PUBLISHABLE_KEY`
4. Copy `Secret Key` → `CLERK_SECRET_KEY`

### NVIDIA NIM (Optional — for real ESMFold)
1. Sign up at [build.nvidia.com](https://build.nvidia.com)
2. Get API key for ESMFold
3. Add as `NVIDIA_NIM_API_KEY`
> Without this, the platform uses a mock PDB structure. All other features work fully.

### External Biomedical APIs (Free, no key required)
- **PubChem**: Compound data (free)
- **UniProt**: Protein data (free)
- **PDB (RCSB)**: Protein structures (free)
- **ClinicalTrials.gov**: Trial data (free)
- **PubMed/NCBI**: Research papers (free)

---

## 🐳 Docker Deployment

```bash
# Build image
docker build -t neurogenesis-ai .

# Run container
docker run -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  -e VITE_CLERK_PUBLISHABLE_KEY=your_key \
  neurogenesis-ai
```

---

## ☁️ Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 6 | Build tool |
| Tailwind CSS | 4 | Styling |
| Framer Motion | 11 | Animations |
| 3DMol.js | 2.5 | 3D protein visualization |
| Recharts | 2.15 | Data charts |
| Zustand | 5 | State management |
| React Markdown | 9 | Markdown rendering |
| Lucide React | 0.5 | Icons |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Express.js | 4.21 | HTTP server |
| Helmet | 8 | Security headers |
| CORS | 2.8 | Cross-origin support |
| express-rate-limit | 7.5 | API rate limiting |
| Axios | 1.13 | HTTP client for external APIs |
| tsx | 4.21 | TypeScript execution |

### AI & Data
| Service | Purpose |
|---------|---------|
| Gemini 2.0 Flash | AI chat, analysis, reports |
| NVIDIA NIM ESMFold | Protein structure prediction |
| PubChem REST API | Drug/compound data |
| UniProt REST API | Protein database |
| RCSB PDB | Protein structures |
| ClinicalTrials.gov v2 API | Trial data |
| PubMed eUtils API | Research papers |

---

## 📡 API Documentation

### POST `/api/analyze`
Predict protein structure and get drug candidates.

**Request:**
```json
{
  "disease": "Alzheimer's",
  // OR
  "proteinSequence": "MDSKGSSQ..."
}
```

**Response:**
```json
{
  "pdb": "HEADER...",
  "sequence": "MDSKGSSQ...",
  "drugs": [
    { "name": "Donepezil", "score": 0.82, "mechanism": "...", "toxicity": "low" }
  ],
  "metadata": { "modelUsed": "ESMFold", "timestamp": "..." }
}
```

### GET `/api/protein/:gene`
Fetch protein information from UniProt.

### GET `/api/drugs/search?q=metformin`
Search PubChem for compound data.

### GET `/api/trials?q=alzheimer`
Get clinical trials from ClinicalTrials.gov.

### GET `/api/health`
Platform health check.

---

## 🎨 UI Highlights

- **Scientific dark theme** with animated gradient backgrounds
- **Glassmorphism cards** with backdrop blur and border glow
- **Neon border effects** on active/important elements
- **Floating particles** animation on landing page
- **Smooth page transitions** via Framer Motion
- **Real-time AI streaming** in the Copilot chat
- **Interactive heatmaps** in molecular docking
- **Responsive layout** from mobile to 4K

---

## 📋 Pages Overview

| Page | Route (internal) | Description |
|------|-----------------|-------------|
| Landing | `home` | Hero + features + CTA |
| Dashboard | `dashboard` | Activity, stats, charts |
| AI Copilot | `copilot` | Streaming chat interface |
| Drug Repurposing | `drug-repurposing` | Analysis + drug candidates |
| Protein Explorer | `protein-explorer` | 3D structure viewer |
| Disease Intelligence | `disease-intelligence` | Disease dashboard |
| Paper Analyzer | `paper-analyzer` | PubMed + AI extraction |
| Molecular Docking | `molecular-docking` | Simulation + heatmap |
| Report Generator | `report-generator` | AI report generation |
| Workspace | `workspace` | Saved experiments |

---

## 🔒 Security

- Helmet.js security headers
- API rate limiting (100 req/15 min per IP)
- Input validation and sanitization
- CORS configuration
- No secrets exposed to frontend

---

## 📄 License

MIT License — © 2026 NeuroGenesis AI Platform

---

## 🙏 Acknowledgments

Built with data from:
- [PubChem](https://pubchem.ncbi.nlm.nih.gov/) — National Institutes of Health
- [UniProt](https://www.uniprot.org/) — Swiss-Prot / EMBL-EBI
- [RCSB PDB](https://www.rcsb.org/) — Protein Data Bank
- [ClinicalTrials.gov](https://clinicaltrials.gov/) — U.S. National Library of Medicine
- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) — NCBI
- [Google Gemini](https://ai.google.dev/) — Google DeepMind
