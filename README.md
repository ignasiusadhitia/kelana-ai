<div align="center">

# 🧭 KelanaAI

**Enterprise Cloud-Native Travel Intelligence & Itinerary Synthesis Platform**

[Live Application](https://kelana-ai-ignasiusadhitia.vercel.app) • [API Documentation](http://127.0.0.1:8000/docs) • [System Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference--route-specifications)

[![Release](https://img.shields.io/badge/Release-v0.2.0-10B981?style=flat)](https://github.com/ignasiusadhitia/kelana-ai/releases)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Amazon Bedrock](https://img.shields.io/badge/Amazon_Bedrock-Nova_Lite-FF9900?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Live Cloud Deployments](#-live-cloud-deployments)
- [System Architecture](#-system-architecture)
  - [Topology Diagram](#topology-diagram)
  - [Architectural Principles](#architectural-principles)
- [Core Engineering Capabilities](#-core-engineering-capabilities)
  - [1. Model 3: Chat-to-Blueprint Relational Grounding](#1-model-3-chat-to-blueprint-relational-grounding)
  - [2. Modular Breakdown Policy for Extended Journeys (>14 Days)](#2-modular-breakdown-policy-for-extended-journeys-14-days)
  - [3. Destination-Scoped Vector RAG](#3-destination-scoped-vector-rag)
  - [4. Multi-Turn Conversational Memory & Real-Time SSE](#4-multi-turn-conversational-memory--real-time-sse)
  - [5. Enterprise Security Posture & Hardening](#5-enterprise-security-posture--hardening)
  - [6. Progressive Web App (PWA) & Offline Resiliency](#6-progressive-web-app-pwa--offline-resiliency)
- [Domain Architecture & Conceptual Entity Model](#-domain-architecture--conceptual-entity-model)
- [API Reference & Route Specifications](#-api-reference--route-specifications)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration Matrix](#-environment-configuration-matrix)
- [Cloud Deployment Runbook](#-cloud-deployment-runbook)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Codebase Documentation Standards](#-codebase-documentation-standards)
- [Contributing](#-contributing)
- [Security Policy](#-security-policy)
- [Acknowledgements](#-acknowledgements)
- [License](#-license)

---

## 🔭 Overview

**KelanaAI** is a cloud-native travel planning and itinerary synthesis platform engineered with **Next.js 16 (App Router & Turbopack)**, **Python FastAPI 0.115**, **Amazon Bedrock (Amazon Nova Lite)**, and **Neon Serverless PostgreSQL 16**.

The system addresses fundamental reliability and security challenges common in LLM-based itinerary planning:
* **Context Drift & Hallucination**: Eliminates regulatory and geographic contamination via destination-scoped OpenSearch vector retrieval (RAG).
* **Token Output Truncation**: Enforces a strict 14-day limit per synthesis unit and partitions extended trips (>14 days) into balanced 6–7 day regional legs with conversational selection gates.
* **Disconnected Chat State**: Implements **Model 3 Bidirectional Grounding**, coupling conversation threads with saved trip records (`trip_id` foreign key) for real-time prompt context injection and in-place blueprint modifications.
* **Client Token Insecurity**: Employs an asynchronous **Backend-For-Frontend (BFF)** proxy pattern that stores JWT authentication tokens in `HttpOnly`, `SameSite=Lax` cookies, removing client-side token exposure.

Developed as the capstone showcase project for the **Alkademi AI Native Software Engineer Bootcamp**.

---

## 🚀 Live Cloud Deployments

| Component | Platform | Role / Runtime | Deployment Region | Status |
|---|---|---|---|---|
| **Frontend & BFF Edge** | [Vercel](https://vercel.com) | Next.js 16 App Router UI, Edge Proxy & Service Worker | Global Edge Network | [Live Application](https://kelana-ai-ignasiusadhitia.vercel.app) |
| **Backend API Engine** | [FastAPI Cloud](https://fastapicloud.com) | Asynchronous Python 3.12 REST & SSE Microservice | Containerized Cloud | Active (`/health`) |
| **Relational Database** | [Neon](https://neon.tech) | Managed Serverless PostgreSQL 16 (Connection Pooled) | `ap-southeast-1` / `us-east-1` | Active (SSL Enforced) |
| **Foundation LLM** | [Amazon Bedrock](https://aws.amazon.com/bedrock) | Amazon Nova Lite (`amazon.nova-lite-v1:0`) | `ap-southeast-2` (Sydney) | Active |
| **Vector Knowledge Base** | [Amazon Bedrock KB](https://aws.amazon.com/bedrock/knowledge-bases/) | OpenSearch Serverless Vector Store (Cosine Similarity) | `ap-southeast-2` (Sydney) | Active |

---

## 🏛️ System Architecture

### Topology Diagram

```mermaid
graph TD
    Client([Client Browser / Installed PWA\nDesktop or Mobile]) -->|HTTPS / W3C Manifest| Vercel[Vercel Edge Network\nNext.js 16 App Router UI]
    
    subgraph Vercel_Edge [Edge Proxy & Session Guard Layer]
        Vercel -->|HttpOnly Cookie 'kelana_token'| BFF[Next.js API Route Handlers\nZero-CORS BFF Proxy & Credential Shield]
        BFF -->|Next.js 16 proxy.ts| EdgeGuard[Edge Route Guard\nSynchronous Unauthenticated Redirection]
    end
    
    subgraph Cloud_Backend [Application Layer: FastAPI Cloud]
        BFF -->|Authorization: Bearer <JWT> & SSE Streaming| FastAPI[FastAPI Asynchronous Engine\nPython 3.12 + Uvicorn]
        FastAPI -->|GZip Compression & Rate Limiter| Middleware[In-Memory Sliding Window Limiter]
        FastAPI -->|Pre-Execution Inspection| Guardrails[Dual-Layer Prompt Injection Shield]
    end
    
    subgraph Persistence_AI [Data & AI Inference Layer]
        FastAPI -->|SQLAlchemy 2.0 Connection Pool| Neon[(Neon Serverless PostgreSQL\nUsers, Trips, Conversations, Messages)]
        FastAPI -->|Boto3 Converse API| Bedrock[Amazon Bedrock LLM\nAmazon Nova Lite v1:0]
        FastAPI -->|Destination-Scoped Vector Filter| RAG[Amazon Bedrock Knowledge Base\nOpenSearch Serverless RAG]
    end
```

### Architectural Principles

1. **Zero Client-Side Token Exposure**:
   JWT authentication tokens are stored exclusively in `HttpOnly`, `Secure`, `SameSite=Lax` cookies with a synchronized 7-day TTL. Client-side JavaScript cannot read the token, mitigating Cross-Site Scripting (XSS) credential theft.
2. **Upstream Credential Isolation**:
   AWS IAM credentials, JWT secret keys, and PostgreSQL connection strings are bound strictly to server-side environments. Client requests pass through the BFF proxy, which extracts the session cookie and injects standard `Authorization: Bearer <token>` headers into upstream requests.
3. **Model 3 Relational Grounding**:
   Conversation threads maintain optional relational foreign keys (`conversations.trip_id`) to saved trip records. System prompts inject active itinerary state directly into conversational context to support accurate trip modifications.
4. **Resilient Streaming Architecture**:
   Token generation utilizes Server-Sent Events (SSE) via the Amazon Bedrock Converse API, paired with client-side abort controllers, markdown parsing, and automatic database persistence upon stream completion.

---

## ⚙️ Core Engineering Capabilities

### 1. Model 3: Chat-to-Blueprint Relational Grounding
* **Relational Schema Link**: `conversations.trip_id` references `trips.id` with `ON DELETE SET NULL` cascade behavior. Linking a conversation to a trip allows travelers to query, expand, or adjust their itineraries interactively.
* **Context Injection Pipeline**: When `trip_id` is supplied, `_inject_trip_context()` extracts destination, duration, budget, style, and daily activities, serializing them into the LLM system prompt as an immutable baseline.
* **Blueprint Promotion Workflow**: Travelers can apply conversational recommendations directly back to their saved trip blueprint via `PUT /api/v1/trips/{id}/recommendation`, which sanitizes markdown preambles and writes the updated itinerary in-place.
* **Multi-Tier Markdown Sanitizer**:
  * Strips stacked markdown headers (e.g., `#### ## Day 1` $\rightarrow$ `## Day 1`) generated under multi-layer system prompts.
  * Normalizes unescaped LaTeX math syntax (`\[ 2000 \times 150 \]` $\rightarrow$ `$2,000 × 150 = 300,000 JPY`).
  * Classifies time blocks (`Morning`, `Afternoon`, `Evening`, `Breakfast`, `Lunch`, `Dinner`) into structured UI pill badges with dedicated color coding and Lucide icons.

### 2. Modular Breakdown Policy for Extended Journeys (>14 Days)
* **Token Ceiling Protection**: To prevent context exhaustion and mid-itinerary text truncation on long trips, the platform enforces an optimal 14-day limit per synthesis unit.
* **Algorithmic Leg Segmentation**: Inquiries exceeding 14 days trigger an automated modular breakdown into balanced 6–7 day regional legs with proportional budget allocations:
  * *Leg 1 (Days 1–7)*: Primary metropolitan gateway and core cultural highlights.
  * *Leg 2 (Days 8–14)*: Secondary historic or regional transit corridor.
  * *Leg 3 (Days 15–20+)*: Specialized regional excursions or nature exploration.
* **Conversational Selection Gate**: The model presents structured leg cards and pauses generation, requesting that the user select which leg to detail first, preventing premature and truncated day-by-day dumps.
* **Anti-Placeholder & Anti-Fabrication Directive**: Strictly prohibits repetitive generic quoted venue placeholders (e.g., `"Halal Japanese Dining"`) or generic `"free time"` fillers. Mandates authentic food streets, verified dining districts (e.g., Omoide Yokocho, Nishiki Market), or verified dietary anchors.

### 3. Destination-Scoped Vector RAG
* **Scoped Vector Retrieval**: Vector search requests pass a `destination_scope` parameter to `retrieve_passages()`. This prevents documents for indexed destinations (e.g., `KyotoTravelGuideEN.md`) from leaking into inquiries for distinct locations (e.g., Maldives).
* **Semantic Threshold Verification**: Knowledge base passages are filtered by a strict cosine similarity cutoff (`RAG_SEMANTIC_THRESHOLD=0.35`). Passages scoring below threshold are rejected.
* **Deterministic Source Attribution**: Retrieved passages attach URI citations and chunk offsets to generated responses, exposed in the UI as verified source badges.
* **Autonomous Out-of-Domain Handling**: When an inquiry targets a location outside indexed travel guides, the system gracefully generates authentic, reality-grounded itineraries without fabricating non-existent visa or regulatory claims.

### 4. Multi-Turn Conversational Memory & Real-Time SSE
* **Hybrid Sliding-Window Memory**: Preserves recent conversation turns verbatim to maintain acute conversational context, while synthesizing older dialogue into compressed background summaries to prevent context drift.
* **Server-Sent Events (SSE) Protocol**: Real-time token streaming using FastAPI `StreamingResponse` and event streams (`event: token`, `event: error`, `event: done`), supporting client-side abort controllers.
* **Thread Management**: Supports title auto-generation, multi-thread persistence, turn-by-turn history, message editing, and response regeneration.

### 5. Enterprise Security Posture & Hardening
* **HttpOnly Cookie Architecture**: Completely avoids browser `localStorage` for authentication tokens. JWT cookies use `HttpOnly`, `Secure`, and `SameSite=Lax` configurations.
* **Edge Route Protection (`proxy.ts`)**: Next.js 16 edge middleware intercepts navigation to private routes (`/profile`, `/trips`) before client rendering, eliminating authentication flicker.
* **Production DevTools Lockdown**: Neutralizes React DevTools global hooks, disables right-click context inspection, and blocks developer keyboard shortcuts (`F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`) in production environments.
* **AST Compiler Stripping**: Next.js compiler configuration strips all `console.log`, `console.info`, and `console.debug` calls from production bundles and disables client source maps.
* **Prompt Injection Shield**: Pre-execution heuristic regex matching and LLM classifier routines identify and neutralize prompt-injection attempts.
* **Soft Deletes & Ownership Verification**: Database queries enforce row-level user ownership filters (`user_id == current_user.id`). Deletions use `deleted_at` timestamps with explicit recovery (`/restore`) and permanent purge (`/permanent`) endpoints.

### 6. Progressive Web App (PWA) & Offline Resiliency
* **W3C Standards Compliance**: Configured with Web App Manifest (`app/manifest.ts`), maskable icons (192×192, 512×512), and theme color specifications.
* **Custom Service Worker (`public/sw.js`)**: Implements a cache-first caching strategy for static application shell assets, network-first strategy for navigation requests, and dynamic bypass for API endpoints.
* **Offline Fallback Route (`/offline`)**: Displays a styled, functional offline interface when network connectivity is lost, with automatic reconnection listeners.

---

## 🗄️ Domain Architecture & Conceptual Entity Model

KelanaAI structures travel data into four isolated domain entities, enforcing relational ownership, cascading lifecycles, and Model 3 Chat-to-Blueprint context binding:

```mermaid
erDiagram
    USER ||--o{ TRIP : "manages"
    USER ||--o{ CONVERSATION : "initiates"
    TRIP ||--o{ CONVERSATION : "grounds (Model 3 trip_id)"
    CONVERSATION ||--o{ MESSAGE : "contains"

    USER {
        string Identifier "Cryptographic Public UUID"
        string Identity "Account Credentials & Preferences"
        string Audit "Audit Timestamps"
    }

    TRIP {
        string Identifier "Cryptographic Public UUID"
        string Specifications "Destination, Duration & Style"
        string Financials "Total Budget & Daily Allocation"
        string State "Active / Soft-Deleted Lifecycle"
    }

    CONVERSATION {
        string Identifier "Cryptographic Public UUID"
        string Grounding "Optional Relational Trip Reference"
        string Metadata "Session Title & Timestamps"
    }

    MESSAGE {
        string Identifier "Cryptographic Public UUID"
        string Turn "Role (User / Assistant)"
        string Payload "Itinerary Content & RAG Citations"
    }
```

---

## 🔌 API Reference & Route Specifications

### Authentication Services (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Registers a new user account with hashed password credentials. |
| `POST` | `/api/v1/auth/login` | Public | Validates credentials and issues an HttpOnly session JWT cookie. |
| `POST` | `/api/v1/auth/logout` | Session | Invalidates the session cookie with an immediate expiration header. |
| `GET` | `/api/v1/auth/me` | Bearer | Returns the authenticated user profile and travel preferences. |
| `PUT` | `/api/v1/auth/profile` | Bearer | Updates profile information (full name, travel style, preferred currency). |
| `PUT` | `/api/v1/auth/password` | Bearer | Updates user password after verifying current credentials. |
| `DELETE` | `/api/v1/auth/account` | Bearer | Permanently deletes user account and cascades through associated data. |

### Trip Planning & Blueprint Services (`/api/v1/trips`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/trips` | Bearer | Lists active trips for the authenticated user with pagination and filters. |
| `POST` | `/api/v1/trips` | Bearer | Synthesizes a new trip blueprint and generates an initial itinerary. |
| `GET` | `/api/v1/trips/{id}` | Bearer | Retrieves full trip blueprint details and daily itinerary schedule. |
| `PUT` | `/api/v1/trips/{id}` | Bearer | Modifies trip metadata (budget, notes, duration, travel style). |
| `DELETE` | `/api/v1/trips/{id}` | Bearer | Soft-deletes a trip record by setting `deleted_at`. |
| `POST` | `/api/v1/trips/{id}/restore` | Bearer | Restores a soft-deleted trip record to active status. |
| `DELETE` | `/api/v1/trips/{id}/permanent`| Bearer | Permanently purges a soft-deleted trip from the database. |
| `PUT` | `/api/v1/trips/{id}/recommendation` | Bearer | Promotes chat recommendations into the saved trip blueprint. |
| `POST` | `/api/v1/trips/{id}/generate`| Bearer | Triggers an automated itinerary re-synthesis via Bedrock Nova Lite. |

### Conversational Memory & SSE Streaming (`/api/v1/conversations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/conversations` | Bearer | Lists user conversation threads sorted by last activity timestamp. |
| `POST` | `/api/v1/conversations` | Bearer | Initializes a new conversation thread, optionally bound to `trip_id`. |
| `GET` | `/api/v1/conversations/{id}`| Bearer | Retrieves full chronological message history for a conversation thread. |
| `DELETE` | `/api/v1/conversations/{id}`| Bearer | Deletes a conversation thread and cascades through child messages. |
| `POST` | `/api/v1/conversations/{id}/messages` | Bearer | Appends a user message and streams assistant response via SSE. |
| `POST` | `/api/v1/conversations/{id}/messages/{msg_id}/edit` | Bearer | Edits a previous user message, truncates downstream turns, and streams SSE. |
| `POST` | `/api/v1/conversations/{id}/regenerate` | Bearer | Regenerates the latest assistant message turn via SSE. |

### Knowledge Base Assistant Service (`/api/v1/assistant`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/assistant` | Public | Submits inquiries to the Bedrock Knowledge Base vector store with citations. |

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | Next.js | 16.3.2 | React App Router, Turbopack, Edge Middleware, Static Site Generation |
| **UI Library** | React / React DOM | 19.2.8 | Declarative component UI and concurrent rendering |
| **Language** | TypeScript | 5.x | Strict static typing across frontend interfaces and API contracts |
| **Styling** | Tailwind CSS | 4.x | Utility-first styling with PostCSS pipeline |
| **State Management** | TanStack Query | 5.102.2 | Client-side cache synchronization and async query management |
| **Form & Validation** | React Hook Form & Zod | 7.86 / 4.4 | Typed client-side form controls and runtime schema validation |
| **Icons** | Lucide React | 1.34.0 | Accessible SVG iconography |
| **Offline Engine** | Vanilla Service Worker | Native | Cache-first shell asset storage and network-first navigation fallback |
| **Backend Framework** | FastAPI | 0.115+ | High-throughput asynchronous Python REST and SSE microservice |
| **ASGI Server** | Uvicorn | Standard | Asynchronous production web server |
| **Database ORM** | SQLAlchemy | 2.0+ | Object-relational mapping with connection pooling |
| **Database Driver** | Psycopg2-Binary | 2.9+ | High-performance PostgreSQL interface |
| **Data Validation** | Pydantic | 2.x | Strict request/response serialization and schema enforcement |
| **Authentication** | Python-JOSE / Passlib | 3.3 / 1.7 | JWT generation, validation, and Bcrypt password hashing |
| **Cloud Database** | Neon PostgreSQL | 16 | Serverless PostgreSQL with auto-scaling connection pooling |
| **AI Foundation** | Amazon Bedrock | Nova Lite | Foundation model inference via Boto3 Converse API |
| **Vector Engine** | Bedrock Knowledge Bases | OpenSearch | Managed serverless vector search with cosine similarity filtering |

---

## 💻 Getting Started

### Prerequisites

* **Node.js**: `v20.10.0` LTS or higher
* **Python**: `3.11` or `3.12`
* **PostgreSQL**: Local instance or a free [Neon](https://neon.tech) connection URI
* **AWS Credentials**: IAM user or role with `AmazonBedrockFullAccess`

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

# Install locked dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your development credentials (see [Environment Configuration Matrix](#-environment-configuration-matrix)).

Execute database schema initialization and migrations:

```bash
python migrate.py
```

Launch the Uvicorn development server:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

* **API Base URL**: `http://127.0.0.1:8000`
* **Interactive Swagger Documentation**: `http://127.0.0.1:8000/docs`
* **Health Check Endpoint**: `http://127.0.0.1:8000/health`

---

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure local environment
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

## 🔐 Environment Configuration Matrix

### Backend (`backend/.env`)

| Variable | Required | Default / Example | Description |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@localhost:5432/kelana_ai` | PostgreSQL connection string (append `?sslmode=require` for Neon). |
| `AWS_REGION` | **Yes** | `ap-southeast-2` | AWS region hosting Amazon Bedrock and Knowledge Bases. |
| `MODEL_ID` | **Yes** | `amazon.nova-lite-v1:0` | Amazon Bedrock foundation model identifier. |
| `AWS_ACCESS_KEY_ID` | **Yes** | `AKIA...` | AWS IAM access key with Bedrock permissions. |
| `AWS_SECRET_ACCESS_KEY`| **Yes** | `wJalr...` | AWS IAM secret access key. |
| `KNOWLEDGE_BASE_ID` | **Yes** | `your_kb_id` | Amazon Bedrock Knowledge Base identifier. |
| `KNOWLEDGE_BASE_MODEL_ARN` | **Yes** | `arn:aws:bedrock:...` | Model ARN configured for Knowledge Base retrieval. |
| `JWT_SECRET_KEY` | **Yes** | `64_character_random_hex` | Cryptographic secret for signing session JWTs. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` (7 days) | Lifetime of access tokens, synchronized with cookie expiry. |
| `RAG_SEMANTIC_THRESHOLD` | No | `0.35` | Minimum cosine similarity score for vector passage filtering. |
| `CORS_ORIGINS` | No | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated list of allowed CORS origins. |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default / Example | Description |
|---|---|---|---|
| `BACKEND_URL` | **Yes** | `http://127.0.0.1:8000` | Upstream FastAPI backend URL consumed by the server-side BFF proxy. |
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3000` | Public origin of the frontend web application. |

---

## ☁️ Cloud Deployment Runbook

### 1. Neon Serverless PostgreSQL
1. Create a project at [neon.tech](https://neon.tech) in your target region (`ap-southeast-1` or `us-east-1`).
2. Copy the pooled connection string containing `?sslmode=require`.
3. Apply database migrations from a terminal:
   ```bash
   $env:DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
   python migrate.py
   ```

### 2. FastAPI Cloud Application
1. Connect your GitHub repository to [FastAPI Cloud](https://fastapicloud.com).
2. Configure build and runtime parameters:
   * **Root Directory**: `backend`
   * **Python Version**: `3.12`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Configure environment variables in the console according to the [Backend Matrix](#backend-backendenv).
4. Record the deployed API URL (e.g., `https://api.your-domain.fastapicloud.com`).

### 3. Vercel Frontend & BFF Proxy
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset resolves automatically to **Next.js**.
4. Configure environment variables:
   * `BACKEND_URL`: Public URL of your FastAPI Cloud deployment *(without trailing slash)*.
   * `NEXT_PUBLIC_API_URL`: Public URL of your Vercel deployment or empty string.
5. Trigger production deployment.

---

## 🧪 Testing & Quality Assurance

### Automated Backend Test Suites

The backend test suite verifies multi-turn memory, authentication isolation, Model 3 Chat-to-Blueprint grounding, rate limiting, and RAG retrieval:

```bash
cd backend

# 1. Multi-turn chat state machine & LLM consistency suite
.\.venv\Scripts\python.exe test_conversations.py
# Result: 11/11 PASS (100%)

# 2. Authentication, profile & ownership lockdown suite
.\.venv\Scripts\python.exe test_auth_flow.py
# Result: 8/8 PASS (100%)

# 3. Model 3 Chat-to-Blueprint grounding bridge suite
.\.venv\Scripts\python.exe test_model3_bridge.py
# Result: 3/3 PASS (100%)

# 4. Knowledge base vector assistant API suite
.\.venv\Scripts\python.exe test_assistant_api.py
# Result: 4/4 PASS (100%)

# Comprehensive runner across all test suites:
.\.venv\Scripts\python.exe -m unittest test_main.py test_conversations.py test_model3_bridge.py
# Result: 26/26 PASS (100%)
```

### Frontend Production Verification

Validates TypeScript strict type checking, static route generation, PWA manifest bundling, and edge proxy compilation:

```bash
cd frontend
npm run build
```

Expected output:
```text
▲ Next.js 16.3.2 (Turbopack)
✓ Running next.config.ts took 221ms
✓ Compiled successfully in 8.8s
✓ Finished TypeScript in 10.1s (0 errors)
✓ Generating static pages using 3 workers (24/24) in 3.8s
✓ Finalizing page optimization ...
Route (app): 24 static pages, 8 dynamic API routes, 1 edge proxy middleware
```

---

## 📜 Codebase Documentation Standards

The entire KelanaAI codebase adheres to unified, production-grade documentation standards in **English**:

* **Python Backend (PEP 257 Standard)**:
  Every module, class, route handler, database model, service method, and test case contains standardized English PEP 257 docstrings detailing operational semantics, argument types, return values, and failure modes.
* **Frontend Application (TSDoc / JSDoc Standard)**:
  All React components, Next.js App Router pages, custom hooks, providers, and utility functions feature comprehensive JSDoc/TSDoc type annotations and parameter descriptions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit Changes**: Follow conventional commits (`feat: ...`, `fix: ...`, `docs: ...`). Ensure all docstrings and comments are in English.
4. **Run Verification**: Ensure all backend unit tests (`26/26 PASS`) and frontend build (`npm run build`) pass cleanly.
5. **Open a Pull Request** with a detailed summary of changes and testing evidence.

---

## 🛡️ Security Policy

### Reporting Vulnerabilities

If you discover a security vulnerability in KelanaAI, please do not open a public issue. Instead, report it privately to the maintainers via [GitHub Security Advisories](https://github.com/ignasiusadhitia/kelana-ai/security/advisories).

### Session & Token Security
* KelanaAI enforces strict zero-trust token handling: JWTs are never stored in browser `localStorage` or `sessionStorage`.
* Production bundles strip all debugging console outputs and suppress browser source maps.
* All database queries enforce row-level ownership isolation (`user_id == current_user.id`).

---

## 🎓 Acknowledgements

* **Bootcamp**: [Alkademi](https://alkademi.id) — AI Native Software Engineer Bootcamp
* **Curriculum**: Alkademi Capstone Showcase & Production Deployment Track
* **Inference Platform**: Amazon Bedrock (Amazon Nova Lite & Bedrock Knowledge Bases)

---

## 📄 License

Distributed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
