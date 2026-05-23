# AI E-Commerce SaaS — Autonomous Product-to-Fulfilment Pipeline

> **An end-to-end AI-powered SaaS that automates the entire e-commerce lifecycle — from product discovery to order fulfilment — with Human-in-the-Loop (HITL) approval gateways at every critical decision point.**

[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.1-orange)](https://langchain-ai.github.io/langgraph)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Modules](#core-modules)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)

---

## Overview

This SaaS platform acts as an autonomous AI agent that runs multiple e-commerce product pipelines in parallel. Each pipeline progresses through four core modules, pausing at **Human-in-the-Loop gateways** before executing irreversible actions such as launching ad spend or publishing a storefront.

**Key Capabilities:**
- Automated social media trend scraping and product scoring
- AI-generated Shopify storefront creation via GraphQL Admin API
- Programmatic ad campaign launching on Meta and TikTok
- Automated dropshipping fulfilment via Zendrop
- Stop-loss mechanism to kill underperforming campaigns automatically
- Australian GST, customs duty, and legal compliance checks

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ React Dashboard (Frontend) │
│ Pipeline View | Gateway Approvals | Analytics │
└────────────────────┬────────────────────────────────────────┘
 │ REST / WebSocket
┌────────────────────▼────────────────────────────────────────┐
│ FastAPI Backend │
│ /pipelines /gateway /products /analytics │
└────────────────────┬────────────────────────────────────────┘
 │
┌────────────────────▼────────────────────────────────────────┐
│ LangGraph Orchestration Engine │
│ │
│ [research_node] ──► [GATEWAY_1: Go/No-Go] │
│ │ │
│ ▼ │
│ [storefront_node] ──► [social_setup_node] │
│ │ │
│ ▼ │
│ [marketing_node] ──► [GATEWAY_2: Strategy Approval] │
│ │ │
│ ▼ │
│ [ads_launch_node] ──► [monitor_node] ──► [stop_loss_node] │
│ │ │
│ ▼ │
│ [supplier_node] ──► [legal_node] ──► [fulfil_node] │
└─────────────────────────────────────────────────────────────┘
 │
┌───────┬───────┬──────────┬───────────┬──────────┬───────────┐
│Apify │OpenAI │ Shopify │ Meta API │TikTok API│ Zendrop │
│Scraper│GPT-4o │GraphQL │ Marketing │Marketing │ Fulfil │
└───────┴───────┴──────────┴───────────┴──────────┴───────────┘
```

---

## Core Modules

### Module 1 — Product Discovery & Market Research
- Scrapes TikTok, Reddit, Instagram, and Amazon using Apify actors
- Scores products using GPT-4o based on trend velocity, pain-point density, and supplier availability
- **GATEWAY 1:** Presents top-scored products to the user for Go/No-Go approval

### Module 2 — Brand & Website Generation
- Programmatically creates a Shopify store via GraphQL Admin API
- Generates brand name, logo prompt, product copy, and meta descriptions using GPT-4o
- Configures social media handles on Meta and TikTok under the new brand

### Module 3 — Marketing & Ad Automation
- Generates a full UGC-first marketing strategy document
- **GATEWAY 2:** Requests user approval for the strategy before spend
- Auto-launches campaigns on Meta Ads and TikTok Ads APIs
- Polls performance every 6 hours; triggers stop-loss if ROAS < 1.5 or CPC > threshold

### Module 4 — Supply Chain, Logistics & Legal
- Queries Zendrop API for supplier pricing, shipping times, and stock levels
- Calculates Australian GST (10%), import duties, and customs thresholds (de minimis AUD $1,000)
- Generates a compliance checklist for the target market

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TailwindCSS, Zustand, React Query |
| Backend | FastAPI (Python 3.11), Uvicorn, Pydantic v2 |
| AI Orchestration | LangGraph, LangChain, OpenAI GPT-4o |
| Database | PostgreSQL (prod), SQLite (dev), Redis (queue/cache) |
| Scraping | Apify (TikTok, Reddit, Amazon actors) |
| E-Commerce | Shopify GraphQL Admin API |
| Ad Platforms | Meta Marketing API v20, TikTok Marketing API |
| Fulfilment | Zendrop API |
| Auth | Supabase Auth (JWT) |
| Deployment | Docker Compose, Railway / Render |

---

## Project Structure

```
ai-ecommerce-saas/
├── backend/
│ ├── main.py # FastAPI app entry point
│ ├── requirements.txt
│ ├── .env.example
│ ├── agents/
│ │ ├── graph.py # LangGraph state machine definition
│ │ ├── state.py # AgentState TypedDict
│ │ ├── nodes/
│ │ │ ├── research_node.py # Module 1: Product Discovery
│ │ │ ├── storefront_node.py # Module 2: Shopify store creation
│ │ │ ├── social_node.py # Module 2: Social account setup
│ │ │ ├── marketing_node.py # Module 3: Strategy generation
│ │ │ ├── ads_node.py # Module 3: Ad launch & monitoring
│ │ │ ├── stop_loss_node.py # Module 3: Stop-loss mechanism
│ │ │ ├── supplier_node.py # Module 4: Supplier sourcing
│ │ │ └── legal_node.py # Module 4: Compliance checks
│ │ └── gateways/
│ │ ├── gateway_1.py # HITL: Go/No-Go product approval
│ │ └── gateway_2.py # HITL: Marketing strategy approval
│ ├── api/
│ │ ├── routes/
│ │ │ ├── pipelines.py # Pipeline CRUD endpoints
│ │ │ ├── gateway.py # Gateway approval endpoints
│ │ │ ├── products.py # Product data endpoints
│ │ │ └── analytics.py # KPI and ad analytics endpoints
│ │ └── deps.py # Shared dependencies
│ ├── services/
│ │ ├── apify_service.py # Trend scraping
│ │ ├── shopify_service.py # Shopify GraphQL client
│ │ ├── meta_service.py # Meta Marketing API client
│ │ ├── tiktok_service.py # TikTok Marketing API client
│ │ ├── zendrop_service.py # Zendrop fulfilment client
│ │ └── openai_service.py # GPT-4o wrapper
│ └── models/
│ ├── pipeline.py
│ ├── product.py
│ └── campaign.py
├── frontend/
│ ├── package.json
│ ├── src/
│ │ ├── App.jsx
│ │ ├── main.jsx
│ │ ├── pages/
│ │ │ ├── Dashboard.jsx # Pipeline overview
│ │ │ ├── GatewayApproval.jsx # HITL approval UI
│ │ │ ├── Analytics.jsx # KPI charts
│ │ │ └── Settings.jsx
│ │ ├── components/
│ │ │ ├── PipelineCard.jsx
│ │ │ ├── ProductCard.jsx
│ │ │ ├── StopLossAlert.jsx
│ │ │ └── CampaignMetrics.jsx
│ │ └── store/
│ │ └── pipelineStore.js # Zustand global state
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- API keys (see Environment Variables)

### 1. Clone the repository
```bash
git clone https://github.com/selvinjoy/ai-ecommerce-saas.git
cd ai-ecommerce-saas
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys in .env
uvicorn main:app --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Run with Docker
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000` and the frontend at `http://localhost:5173`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and populate all values:

```env
# OpenAI
OPENAI_API_KEY=

# Apify (Scraping)
APIFY_API_TOKEN=

# Shopify
SHOPIFY_SHOP_DOMAIN=
SHOPIFY_ACCESS_TOKEN=

# Meta Marketing API
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=

# TikTok Marketing API
TIKTOK_APP_ID=
TIKTOK_SECRET=
TIKTOK_ACCESS_TOKEN=
TIKTOK_ADVERTISER_ID=

# Zendrop
ZENDROP_API_KEY=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_ecommerce
REDIS_URL=redis://localhost:6379

# Supabase Auth
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

## Development Roadmap

### Phase 1 — Foundation (Week 1)
- [ ] FastAPI project scaffold with health check endpoint
- [ ] LangGraph `AgentState` and base graph skeleton
- [ ] React dashboard scaffold with TailwindCSS
- [ ] Docker Compose setup (API + DB + Redis)
- [ ] Supabase auth integration

### Phase 2 — Product Discovery (Week 2)
- [ ] Apify actor integration for TikTok trending, Reddit, Amazon BSR
- [ ] GPT-4o product scoring prompt with weighted criteria
- [ ] `research_node.py` implementation
- [ ] Gateway 1 interrupt logic and API endpoint
- [ ] Frontend: Product card approval UI

### Phase 3 — Store Generation (Week 3)
- [ ] Shopify GraphQL Admin API client
- [ ] `storefront_node.py` — auto-create collections, products, pages
- [ ] GPT-4o brand name + product copy generation
- [ ] Social handle registration stubs (Meta, TikTok)
- [ ] Frontend: Live store preview component

### Phase 4 — Marketing & Ads (Week 4)
- [ ] GPT-4o UGC marketing strategy generator
- [ ] Gateway 2 interrupt logic
- [ ] Meta Marketing API: campaign/adset/ad creation
- [ ] TikTok Marketing API: campaign creation
- [ ] Stop-loss monitor worker (polls every 6h, pauses on KPI breach)
- [ ] Frontend: Campaign metrics dashboard with stop-loss alerts

### Phase 5 — Fulfilment & Compliance (Week 5)
- [ ] Zendrop API: product search, supplier scoring, order routing
- [ ] Australian GST calculator (10% on imports >AUD $1,000)
- [ ] Customs duty lookup by HS code
- [ ] `legal_node.py` compliance checklist generator
- [ ] End-to-end pipeline integration test

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss the proposed change.

---

## License

[MIT](LICENSE) — Built by selvinjoy
