# 🧭 KelanaAI — Intelligent Cloud Travel Companion

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Amazon Bedrock](https://img.shields.io/badge/Amazon_Bedrock-Nova_Lite-FF9900?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **KelanaAI** is an enterprise-grade, cloud-deployed travel planning application built with **Next.js 16 (App Router & Turbopack)**, **Python FastAPI**, **Amazon Bedrock (Amazon Nova Lite)**, and **Neon Serverless PostgreSQL**. Developed as the final capstone project for the **Alkademi AI Native Software Engineer Bootcamp**.

---

## 🚀 Live Demo & Cloud Deployment

| Service | Platform | Role | Status |
|---|---|---|---|
| **Frontend Web & PWA** | [Vercel](https://vercel.com) | Next.js 16 App Router UI, BFF Proxy & Service Worker | [Visit Web App](https://kelana-ai-ignasiusadhitia.vercel.app) |
| **Backend REST API** | [FastAPI Cloud](https://fastapicloud.com) | Asynchronous Python REST & SSE Service | Active |
| **Cloud Database** | [Neon](https://neon.tech) | Managed Serverless PostgreSQL (Connection Pooled) | Active (`ap-southeast-1` / `us-east-1`) |
| **Foundation Model** | [Amazon Bedrock](https://aws.amazon.com/bedrock) | Amazon Nova Lite (`amazon.nova-lite-v1:0`) + Knowledge Base RAG | Active (`ap-southeast-2`) |

---

## 🏛️ System Architecture

KelanaAI employs a decoupled, production-grade **Backend-For-Frontend (BFF)** microservice topology with zero client-side token exposure:

```mermaid
graph TD
    User([Explorer / Client Browser\nDesktop, Mobile, or Installed PWA]) -->|HTTPS / Next.js Routing| Vercel[Vercel: Next.js 16 App Router\nFrontend UI & BFF Proxy Engine]
    
    subgraph Vercel_Edge [Vercel Server-Side Edge & BFF Proxy]
        Vercel -->|HttpOnly Cookie 'kelana_token'| BFF[Next.js API Route Handlers\nZero-CORS, Cookie Token Extractor & Secret Protection]
        BFF -->|Next.js 16 proxy.ts| EdgeGuard[Edge Route Protection\nInstant Unauthenticated Redirect]
    end
    
    subgraph Cloud_Backend [FastAPI Cloud Service]
        BFF -->|Authorization: Bearer <token> & SSE Streaming| FastAPI[FastAPI Asynchronous Engine\nPython 3.12 + Uvicorn]
        FastAPI -->|Sliding Window Rate Limiter & LLM Classifier| Guardrails[Enterprise Security Shield]
    end
    
    subgraph Data_Layer [Cloud Database & AI Inference]
        FastAPI -->|psycopg2 / SQLAlchemy Connection Pooling| Neon[(Neon Serverless PostgreSQL\nUsers, Trips, Conversations)]
        FastAPI -->|Boto3 Converse API| Bedrock[Amazon Bedrock LLM\nAmazon Nova Lite v1:0]
        FastAPI -->|Hybrid Vector & Cosine Search| RAG[Knowledge Base RAG\nCustoms & Travel Regulations]
    end
```

### Why This Architecture?
* **Zero Client CORS Errors:** Browsers exclusively communicate with `/api/v1/*` on the same origin. The server-side proxy handles upstream API calls securely.
* **HttpOnly Cookie Session Security:** JWTs are stored in HttpOnly, Secure, SameSite=Lax cookies. JavaScript cannot access tokens, eliminating Cross-Site Scripting (XSS) token theft.
* **Credentials Never Exposed:** AWS IAM keys, JWT secret keys, and database credentials remain strictly within server-side environments.
* **High Availability:** Serverless PostgreSQL on Neon scales automatically with connection pooling, while Vercel serves cached assets at global edge locations.

---

## ✨ Key Features & Capabilities

### 1. Multi-Turn Conversational Memory & AI Chat (`/chat`)
* **Context Retention:** Maintains deterministic chat chronology with unique thread titles and automatic turn-by-turn history.
* **Hybrid Sliding Window:** Verbatim retention of recent turns combined with automated background context summarization.
* **Real-Time Streaming:** Server-Sent Events (SSE) streaming with interactive typing indicators, message editing, and response regeneration.

### 2. Tailored Itinerary Generation
* **8 Curated Travel Styles:** Backpacker, Solo, Family, Couple, Luxury, Adventure, Culinary, and Wellness.
* **Smart Budget Breakdown:** Computes target daily spend and categorizes expenses across accommodation, food, and transit.
* **Interactive Day Accordions:** Collapsible, visually organized daily itineraries with activity suggestions and timings.

### 3. Retrieval-Augmented Generation (RAG) Travel Assistant
* **Grounded Answers:** Bedrock Knowledge Base vector search retrieves authoritative immigration, customs, and travel rules.
* **Direct Citations:** Answers include source document references, location URIs, and similarity threshold verification.

### 4. Enterprise Security & Session Hardening
* **HttpOnly Cookie Authentication:** Complete removal of `localStorage` JWT storage. Tokens are set by the BFF proxy upon login with a synchronized 7-day expiry.
* **Next.js 16 Edge Route Guard (`proxy.ts`):** Automatically protects sensitive routes like `/profile` at the edge before rendering, eliminating client-side flicker.
* **Production DevTools Lockdown:** Neutralizes the React DevTools hook, disables right-click context menu inspect, and blocks keyboard shortcuts (`F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`) in production.
* **Compiler Hardening:** Strips all `console.log`, `console.info`, and `console.debug` statements and disables browser source maps in production bundles.
* **LLM Injection Shield:** Pre-execution heuristic and classifier checks flag prompt-injection attacks.
* **Soft Deletes & Ownership Verification:** Preserves trip recovery with `deleted_at` timestamps, permanent deletion safeguards, and strict database-level ownership isolation.

### 5. Progressive Web App (PWA) & Offline Resiliency
* **Installable Native Experience:** Full PWA compliance with Web App Manifest (`app/manifest.ts`), maskable icons (192×192, 512×512), and Apple Touch Icon support for mobile and desktop home screens.
* **Vanilla Service Worker (`public/sw.js`):** Background Service Worker precaching the app shell and core assets with network-first navigation fallback and dynamic API bypass.
* **Dedicated Offline View (`/offline`):** Unvisited navigations gracefully fall back to a styled offline view when disconnected.
* **1-Click Install Action:** Context-aware install button in the navigation header dynamically triggers the native browser install prompt when available.

### 6. Production UI/UX Polish
* **Dynamic Favicon:** Custom circular SVG compass icon generated via Next.js `ImageResponse` (`app/icon.tsx`).
* **Global Loading Screen:** Seamless page-transition loading spinner (`app/loading.tsx`).
* **Comprehensive Error Boundaries:** Human-readable English error states for `401`, `403`, `404` (`app/not-found.tsx`), and `500` (`app/error.tsx`, `app/global-error.tsx`).
* **Dedicated About & Architecture Page:** Complete technical walkthrough and system design showcase (`/about`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend & PWA** | Next.js 16.3.2, React 19.2.8, TypeScript 5, Tailwind CSS v4, Lucide React, TanStack Query v5, React Hook Form, Zod, Vanilla Service Worker PWA |
| **Backend REST API** | Python 3.12+, FastAPI, Uvicorn, SQLAlchemy 2.0, Psycopg2-Binary, Pydantic, Python-JOSE, Passlib, Bcrypt |
| **AI / LLM** | Amazon Bedrock (`amazon.nova-lite-v1:0`), Amazon Bedrock Knowledge Bases (RAG), Boto3 SDK |
| **Database** | PostgreSQL 16 (Neon Serverless with connection pooling and SSL encryption) |
| **Hosting & Edge** | Vercel (Frontend & Edge Proxy), FastAPI Cloud (Backend API), Neon (Database) |

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js:** `v20.x` or higher
* **Python:** `3.11` or `3.12`
* **PostgreSQL:** Local instance or a free Neon connection string
* **AWS Credentials:** IAM User with `AmazonBedrockFullAccess` permissions

---

### Step 1: Clone Repository
```bash
git clone https://github.com/ignasiusadhitia/kelana-ai.git
cd kelana-ai
```

---

### Step 2: Backend Setup
```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create local environment configuration
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/kelana_ai
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
KNOWLEDGE_BASE_ID=your_knowledge_base_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0
JWT_SECRET_KEY=your_random_64_char_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=10080
RAG_SEMANTIC_THRESHOLD=0.35
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Run database migrations:
```bash
python migrate.py
```

Launch the FastAPI backend server:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend API: `http://127.0.0.1:8000`
* Swagger Interactive Docs: `http://127.0.0.1:8000/docs`
* Healthcheck: `http://127.0.0.1:8000/health`

---

### Step 3: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create local environment configuration
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Launch the Next.js development server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ☁️ Cloud Deployment Guide

### 1. Database Deployment (Neon)
1. Sign up at [neon.tech](https://neon.tech) and create a project named `kelana-ai-db`.
2. Select your preferred region (e.g., `ap-southeast-1` Singapore or `us-east-1`).
3. Copy the pooled connection string with `?sslmode=require`.
4. Apply database migrations from your terminal:
   ```bash
   $env:DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
   python migrate.py
   ```

### 2. Backend Deployment (FastAPI Cloud)
1. Log in to your [FastAPI Cloud](https://fastapicloud.com) console.
2. Create a new service linked to your repository.
3. Configure the service settings:
   * **Root Directory:** `backend`
   * **Python Version:** `3.12`
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables in the FastAPI Cloud dashboard:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string (`?sslmode=require`).
   * `CORS_ORIGINS`: `https://kelana-ai-ignasiusadhitia.vercel.app,http://localhost:3000`
   * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
   * `MODEL_ID`: `amazon.nova-lite-v1:0`
   * `JWT_SECRET_KEY`: Random 64-character secret.
   * `ACCESS_TOKEN_EXPIRE_MINUTES`: `10080` (7 days, aligned with cookie lifetime).
   * `KNOWLEDGE_BASE_ID`, `KNOWLEDGE_BASE_MODEL_ARN`, `RAG_SEMANTIC_THRESHOLD`
5. Deploy the backend and copy your live service URL (e.g., `https://api.your-domain.fastapicloud.com`).

### 3. Frontend Deployment (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Next.js** (auto-detected).
4. Add Environment Variables:
   * `BACKEND_URL`: Your live FastAPI Cloud service URL *(no trailing slash)*.
   * `NEXT_PUBLIC_API_URL`: Disamakan atau dikosongkan (BFF proxy automatically forwards `/api/v1/*` requests).
5. Click **Deploy**.

---

## 🧪 Testing & Verification

### Backend Automated Test Suites
Run the comprehensive automated test suites verifying authentication, data isolation, rate limiting, and conversational RAG:

```bash
cd backend

# 1. Multi-turn chat & LLM consistency suite
.\.venv\Scripts\python.exe test_conversations.py
# Result: 11/11 PASS (100%)

# 2. Authentication, profile & ownership lockdown suite
.\.venv\Scripts\python.exe test_auth_flow.py
# Result: 8/8 PASS (100%)

# 3. Knowledge base assistant API suite
.\.venv\Scripts\python.exe test_assistant_api.py
# Result: 4/4 PASS (100%)
```

### Frontend Production Build
Validate TypeScript strict type checking, static page generation, PWA manifest compilation, and edge proxy bundling:

```bash
cd frontend
npm run build
```

Expected output:
```text
✓ Compiled successfully in 10.0s
✓ Finished TypeScript in 12.1s (0 errors)
✓ Generating static pages (24/24)
✓ Proxy (proxy.ts) compiled cleanly
```

---

## 🎓 Acknowledgements

* **Bootcamp:** [Alkademi](https://alkademi.id) — AI Native Software Engineer Bootcamp
* **Curriculum:** Alkademi AI Native Software Engineer Bootcamp — Capstone Project Showcase
* **LLM Foundation:** Amazon Bedrock (Amazon Nova Lite) & Amazon Bedrock Knowledge Bases

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
