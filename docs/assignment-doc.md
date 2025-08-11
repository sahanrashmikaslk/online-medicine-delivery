# Online Medicine Delivery System

## 1. Introduction
This project implements a cloud‑native **Online Medicine Delivery System** with microservices for authentication, catalog, ordering, delivery, and notifications. It demonstrates core cloud principles: scalability, high availability, security, synchronous/async communication, and modern deployment.

## 2. Architecture
- **Gateway** exposes a unified API and validates JWT.
- **Auth** manages users and tokens.
- **Catalog** serves medicines and uses Redis caching.
- **Order** creates orders and publishes `order.created` events.
- **Delivery** consumes events to create delivery tasks and emits `delivery.updated` events.
- **Notification** consumes events to notify users (demo: logs).
- **PostgreSQL** stores relational data; **Redis** caches; **RabbitMQ** provides asynchronous messaging.
- **Docker Compose** orchestrates local deployment; **Kubernetes manifests** show horizontal scaling and HA.

## 3. Implementation Steps
1. Containerize each service (Dockerfiles).
2. Provision infra (Postgres, Redis, RabbitMQ) via Compose.
3. Implement REST endpoints and validations.
4. Implement event publishing/consumption (RabbitMQ).
5. Add security (JWT, bcrypt), rate limiting, Helmet, CORS.
6. Build frontend with React + Tailwind and connect to gateway.
7. Add K8s manifests for scaling and ingress.
8. Add CI workflow for build and lint.

## 4. Challenges Faced
- **Distributed data consistency:** addressed with event-driven updates and idempotent consumers.
- **Secret management:** kept via env vars for demo; recommend Vault or cloud KMS for prod.
- **Local developer UX:** Docker Compose healthchecks and seed scripts smooth onboarding.
- **Caching correctness:** cache invalidation on catalog writes.

## 5. Lessons Learned
- Designing for failure (message retries, stateless services) is key to HA.
- Separating concerns (auth/catalog/order) speeds up feature development and scaling.
- Async events decouple teams and reduce synchronous coupling.
- Automated deploys and healthchecks make rollouts safer.
