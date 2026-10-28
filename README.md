# 🌐 CivicConnect — Citizen Civic Grievance & Welfare Platform

**CivicConnect** is a multilingual digital civic platform built for Indian citizens to report and resolve civic problems (road potholes, overflowing garbage dumps, water supply contamination, broken streetlights) and access government welfare schemes using voice and AI in **Hindi and English**.

---

## 🚀 Quick Start (Localhost)

### 1-Click Launch (Windows)
Double-click:
```bat
start-localhost.bat
```
*(or run in PowerShell: `.\start-localhost.ps1`)*

- **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

---

## 🌟 Key Features

### 1. 🚧 Real Civic Issue Resolving & Community Tracking
- **Report Civic Problems**: File complaints for potholes, garbage dumps, contaminated water, or streetlights.
- **Municipal Department Assignment**: Automatically identifies the responsible municipal wing (PWD, Jal Board, SWM, DISCOM) and sets emergency SLAs.
- **Community Upvotes**: Local citizens can upvote reported complaints to increase priority.
- **Escalation Guidelines**: Step-by-step instructions on filing under CPGRAMS, Swachhata-MoHUA, or city 311 apps.

### 2. 🤖 AI Civic Resolution Assistant (Voice & Text)
- **Bilingual Voice Input (Microphone)**: Speak naturally in **Hindi (हिंदी)** or **English** using the microphone button with real-time word streaming.
- **Text-to-Speech Audio Readout**: Spoken response playback with dedicated Hindi and English native voice synthesis.
- **Intelligent Dual-Engine**:
  - **Google Gemini 2.0 / 1.5 Flash**: Seamlessly connects via native fetch if `GEMINI_API_KEY` is provided in `.env` or in the web UI.
  - **Built-in Civic AI Resolver**: Comprehensive offline civic resolution engine trained on Indian municipal laws, helplines, and escalation routes.

### 3. 🏛️ Public Welfare Schemes Catalog
- Complete eligibility rules, required document checklists, and online application form for:
  - Ayushman Bharat (PM-JAY) Cashless Healthcare (Helpline: `104 / 14555`)
  - Social Security & Old Age Pensions (Helpline: `1950`)
  - National Merit Scholarships (Helpline: `1800-11-2020`)
  - One Nation One Ration Card (Helpline: `1967`)

### 4. 📁 Local File Storage (Zero Database Dependencies)
- All records (issues, applications, chat logs, user profiles) are saved locally in `app/backend/data/*.json`.
- **Zero MongoDB dependency**: Starts up in 100ms with 100% offline reliability.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Server Dashboard (with frontend redirect button) |
| `GET` | `/api/test` | Healthcheck and active AI engine verification |
| `GET` | `/api/civic-issues` | Fetch all civic issues (filterable by category) |
| `POST` | `/api/civic-issues/report` | Report a new civic issue with automated department assignment |
| `POST` | `/api/civic-issues/:id/upvote` | Upvote a civic complaint to increase priority |
| `POST` | `/api/chat/message` | AI Civic Assistant query (accepts `message`, `language`, `apiKey`) |
| `GET` | `/api/services` | Government welfare schemes directory |
| `POST` | `/api/services/apply` | Submit scheme application (saved locally to `applications.json`) |
| `GET` | `/api/services/applications` | Track submitted applications |
| `POST` | `/api/translate/text` | Text translation API |
