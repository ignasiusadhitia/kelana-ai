# 🧭 KelanaAI — Cloud-Native Travel Intelligence Platform

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Amazon Bedrock](https://img.shields.io/badge/Amazon_Bedrock-Nova_Lite-FF9900?style=flat&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Release](https://img.shields.io/badge/Release-v0.2.0-10B981?style=flat)](https://github.com/ignasiusadhitia/kelana-ai/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**KelanaAI** is a cloud-native travel planning and itinerary synthesis platform engineered with **Next.js 16 (App Router & Turbopack)**, **Python FastAPI 0.115**, **Amazon Bedrock (Amazon Nova Lite)**, and **Neon Serverless PostgreSQL 16**. The system implements an asynchronous Backend-For-Frontend (BFF) topology, destination-scoped vector retrieval-augmented generation (RAG), bidirectional chat-to-blueprint synchronization, and strict zero-trust session isolation.

Developed as the capstone project for the **Alkademi AI Native Software Engineer Bootcamp**.

---

## 🚀 Live Cloud Deployment

| Service Component | Cloud Platform | Role / Runtime | Deployment Region | Status |
|---|---|---|---|---|
| **Frontend & BFF Edge** | [Vercel](https://vercel.com) | Next.js 16 App Router UI, BFF Proxy & Service Worker | Global Edge Network | [Live Application](https://kelana-ai-ignasiusadhitia.vercel.app) |
| **Backend API Engine** | [FastAPI Cloud](https://fastapicloud.com) | Asynchronous Python 3.12 REST & SSE Microservice | Containerized Cloud | Active (`/health`) |
| **Relational Database** | [Neon](https://neon.tech) | Managed Serverless PostgreSQL 16 (Connection Pooled) | `ap-southeast-1` / `us-east-1` | Active (SSL Required) |
| **Foundation Model** | [Amazon Bedrock](https://aws.amazon.com/bedrock) | Amazon Nova Lite (`amazon.nova-lite-v1:0`) | `ap-southeast-2` (Sydney) | Active |
| **Vector Knowledge Base** | [Amazon Bedrock KB](https://aws.amazon.com/bedrock/knowledge-bases/) | OpenSearch Serverless Vector Store (Cosine Similarity) | `ap-southeast-2` (Sydney) | Active |

---

## 🏛️ System Architecture

KelanaAI decouples client presentation from upstream cloud services via an asynchronous **Backend-For-Frontend (BFF)** proxy pattern. All client network traffic terminates on same-origin `/api/v1/*` route handlers, preventing Cross-Origin Resource Sharing (CORS) failures and eliminating client-side credential exposure.

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

## ⚙️ Core Subsystems & Technical Specifications

### 1. Model 3: Chat-to-Blueprint Relational Grounding (`/chat` & `/trips`)
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

### 3. Destination-Scoped Vector RAG & Hallucination Elimination
* **Scoped Vector Retrieval**: Vector search requests pass a `destination_scope` parameter to `retrieve_passages()`. This prevents documents for indexed destinations (e.g., `KyotoTravelGuideEN.md`) from leaking into inquiries for distinct locations (e.g., Maldives).
* **Semantic Threshold Verification**: Knowledge base passages are filtered by a strict cosine similarity cutoff (`RAG_SEMANTIC_THRESHOLD=0.35`). Passages scoring below threshold are rejected.
* **Deterministic Source Attribution**: Retrieved passages attach URI citations and chunk offsets to generated responses, exposed in the UI as verified source badges.
* **Autonomous Out-of-Domain Handling**: When an inquiry targets a location outside indexed travel guides, the system gracefully generates authentic, reality-grounded itineraries without fabricating non-existent visa or regulatory claims.

### 4. Multi-Turn Conversational Memory & SSE Streaming
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

## 🗄️ Database Schema & Relational Model

```mermaid
erDiagram
    USERS ||--o{ TRIPS : "owns"
    USERS ||--o{ CONVERSATIONS : "creates"
    TRIPS ||--o{ CONVERSATIONS : "grounds"
    CONVERSATIONS ||--o{ MESSAGES : "contains"

    USERS {
        int id PK
        string public_id UK
        string email UK
        string full_name
        string password_hash
        string travel_style
        string home_currency
        datetime created_at
        datetime updated_at
    }

    TRIPS {
        int id PK
        string public_id UK
        int user_id FK
        string destination
        int duration_days
        string travel_style
        decimal total_budget
        decimal daily_budget
        string status
        text recommendation
        text notes
        datetime deleted_at
        datetime created_at
        datetime updated_at
    }

    CONVERSATIONS {
        int id PK
        string public_id UK
        int user_id FK
        int trip_id FK "Nullable"
        string title
        datetime created_at
        datetime updated_at
    }

    MESSAGES {
        int id PK
        string public_id UK
        int conversation_id FK
        string role "user | assistant | system"
        text content
        jsonb sources
        datetime created_at
    }
```

---

## 🔌 API Specification & Route Reference

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

## 🛠️ Technology Stack & Dependencies

```text
KelanaAI
├── Frontend & PWA
│   ├── Next.js 16.3.2 (App Router, Turbopack, Edge Middleware)
│   ├── React 19.2.8 & React DOM 19.2.8
│   ├── TypeScript 5.x (Strict Type Checking)
│   ├── Tailwind CSS v4 (PostCSS Engine)
│   ├── TanStack Query v5.102.2 (Server State Synchronization)
│   ├── React Hook Form v7.86.0 & Zod v4.4.3 (Schema Validation)
│   ├── Lucide React v1.34.0 (Component Iconography)
│   └── Vanilla Service Worker (Cache-First Shell PWA Engine)
│
├── Backend REST API
│   ├── Python 3.12+ & FastAPI 0.115+ (Asynchronous ASGI Framework)
│   ├── Uvicorn (ASGI Production Server)
│   ├── SQLAlchemy 2.0 (Object-Relational Mapping & Connection Pool)
│   ├── Psycopg2-Binary (PostgreSQL Engine Driver)
│   ├── Pydantic v2 (Request/Response Contract Validation)
│   ├── Python-JOSE & Passlib[Bcrypt] (Cryptographic Auth & JWT)
│   └── Boto3 v1.43.56 (AWS Bedrock & Knowledge Base SDK)
│
└── Cloud Infrastructure
    ├── Vercel (Edge Network Hosting & BFF Proxy Execution)
    ├── FastAPI Cloud (Containerized Backend Application Hosting)
    ├── Neon (Managed Serverless PostgreSQL with Pooled SSL Endpoints)
    └── Amazon Bedrock (Nova Lite Foundation LLM & OpenSearch Serverless RAG)
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: `v20.10.0` LTS or higher
* **Python**: `3.11` or `3.12`
* **PostgreSQL**: Local instance or a free Neon connection URI
* **AWS Credentials**: IAM user or role with `AmazonBedrockFullAccess`

---

### Step 1: Clone Repository

```bash
git clone https://github.com/ignasiusadhitia/kelana-ai.git
cd kelana-ai
```

---

### Step 2: Backend Configuration & Execution

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

Configure `backend/.env` with your development credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kelana_ai
AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
KNOWLEDGE_BASE_ID=your_knowledge_base_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0
JWT_SECRET_KEY=your_random_64_character_cryptographic_secret
ACCESS_TOKEN_EXPIRE_MINUTES=10080
RAG_SEMANTIC_THRESHOLD=0.35
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

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

### Step 3: Frontend Configuration & Execution

```bash
cd ../frontend

# Install dependencies
npm install

# Configure local environment
cp .env.example .env.local
```

Configure `frontend/.env.local`:

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

## ☁️ Cloud Deployment Configuration

### 1. Neon Serverless PostgreSQL
1. Create a project at [neon.tech](https://neon.tech) in your target region (`ap-southeast-1` or `us-east-1`).
2. Copy the pooled connection string containing `?sslmode=require`.
3. Apply database migrations from a terminal with access to the cloud database:
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
3. Configure environment variables in the FastAPI Cloud console:
   * `DATABASE_URL`: Cloud connection string with `?sslmode=require`.
   * `CORS_ORIGINS`: `https://kelana-ai-ignasiusadhitia.vercel.app,http://localhost:3000`
   * `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
   * `MODEL_ID`: `amazon.nova-lite-v1:0`
   * `JWT_SECRET_KEY`: 64-character secret.
   * `ACCESS_TOKEN_EXPIRE_MINUTES`: `10080` (7-day cookie parity).
   * `KNOWLEDGE_BASE_ID`, `KNOWLEDGE_BASE_MODEL_ARN`, `RAG_SEMANTIC_THRESHOLD`
4. Deploy the service and record the public API URL (e.g., `https://api.your-domain.fastapicloud.com`).

### 3. Vercel Frontend & BFF Proxy
1. Import the repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework preset will automatically resolve to **Next.js**.
4. Configure environment variables:
   * `BACKEND_URL`: Public URL of your FastAPI Cloud deployment *(without trailing slash)*.
   * `NEXT_PUBLIC_API_URL`: Public URL of the frontend deployment or empty string *(BFF proxy automatically handles `/api/v1/*` routes)*.
5. Trigger production deployment.

---

## 🧪 Testing & Quality Assurance

### Automated Backend Test Suites

The backend includes comprehensive test suites covering multi-turn memory, authentication isolation, Model 3 Chat-to-Blueprint grounding, rate limiting, and RAG retrieval:

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

## 🎓 Acknowledgements

* **Bootcamp**: [Alkademi](https://alkademi.id) — AI Native Software Engineer Bootcamp
* **Curriculum**: Alkademi Capstone Showcase & Production Deployment Track
* **Inference Platform**: Amazon Bedrock (Amazon Nova Lite & Bedrock Knowledge Bases)

---

## 📄 License

Distributed under the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
