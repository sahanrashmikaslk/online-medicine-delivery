# Online Medicine Delivery System (Cloud-Native Demo)

A cloud-native microservices demo built for **EC7205** assignment.
It demonstrates scalability, high availability concepts, security, synchronous + asynchronous communications, and modern deployment practices.

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Gateway:** Node.js Express (JWT validation + reverse proxy)
- **Microservices:** Auth, Catalog, Order, Delivery, Notification (Node.js + Express)
- **Data:** PostgreSQL (transactions), Redis (cache), RabbitMQ (async events)
- **Containers:** Docker + Docker Compose
- **Kubernetes (optional):** manifests under `k8s/`
- **CI/CD (sample):** `.github/workflows/ci.yml`

## Quick Start (Local, Docker Compose)
**Prereqs:** Docker + Docker Compose installed.

1. Clone or unzip this repo.
2. Copy environment defaults:
   ```bash
   cp .env.example .env
   cp gateway/.env.example gateway/.env
   cp services/auth/.env.example services/auth/.env
   cp services/catalog/.env.example services/catalog/.env
   cp services/order/.env.example services/order/.env
   cp services/delivery/.env.example services/delivery/.env
   cp services/notification/.env.example services/notification/.env
   cp web/.env.example web/.env
   ```
3. Start everything:
   ```bash
   docker compose up --build
   ```
4. After a minute, access:
   - Frontend: http://localhost:5173
   - Gateway API: http://localhost:8080
   - RabbitMQ UI: http://localhost:15672 (user: guest / pass: guest)
   - Postgres: localhost:5432 (user: postgres / pass: postgres)
5. Default admin user from seed data:
   - **Email:** `admin@meds.com`
   - **Password:** `Admin@123`

## What This Demonstrates
- **Scalability & HA:** stateless services behind a gateway; horizontal scaling via replicas (K8s manifests).
- **Security:** JWT auth, bcrypt password hashing, input validation, CORS, Helmet, rate limiting.
- **Comms:** REST (sync) + RabbitMQ events (async) (`order.created`, `delivery.updated`).
- **Deployment:** One-command Docker Compose; optional K8s manifests (Deployments, Services, Ingress).
- **Extensibility:** Add new services (e.g., payment) without breaking others; publish/subscribe to events.

## Project Structure
```
online-medicine-delivery/
├─ README.md
├─ .env.example
├─ docker-compose.yml
├─ docs/
│  └─ assignment-doc.md
├─ scripts/
│  └─ db/init.sql
├─ gateway/
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ .env.example
│  └─ src/
│     └─ index.js
├─ services/
│  ├─ auth/
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  ├─ .env.example
│  │  └─ src/
│  │     └─ index.js
│  ├─ catalog/
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  ├─ .env.example
│  │  └─ src/
│  │     └─ index.js
│  ├─ order/
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  ├─ .env.example
│  │  └─ src/
│  │     └─ index.js
│  ├─ delivery/
│  │  ├─ Dockerfile
│  │  ├─ package.json
│  │  ├─ .env.example
│  │  └─ src/
│  │     └─ index.js
│  └─ notification/
│     ├─ Dockerfile
│     ├─ package.json
│     ├─ .env.example
│     └─ src/
│        └─ index.js
├─ web/
│  ├─ Dockerfile
│  ├─ index.html
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ tailwind.config.js
│  ├─ vite.config.js
│  ├─ .env.example
│  └─ src/
│     ├─ main.jsx
│     ├─ App.jsx
│     ├─ api.js
│     ├─ pages/
│     │  ├─ Login.jsx
│     │  ├─ Register.jsx
│     │  ├─ Catalog.jsx
│     │  ├─ Cart.jsx
│     │  └─ Orders.jsx
│     └─ components/
│        └─ Navbar.jsx
├─ k8s/
│  ├─ gateway-deploy.yaml
│  ├─ services-deploy.yaml
│  └─ ingress.yaml
└─ .github/workflows/ci.yml
```

## Running Tests (basic)
This demo focuses on architecture. Basic happy-path tests are included as inline scripts (see individual package.json).

## Notes
- This is a **teaching demo**. For production, harden secrets, add HTTPS/ACME, observability (Prometheus/Grafana), structured logs, CI gates, etc.
