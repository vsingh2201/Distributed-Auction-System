# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EECS 4413 Team 8 — a Spring Boot microservices auction system. Six services communicate through a Spring Cloud API Gateway backed by a Eureka service registry. Each domain service uses its own SQLite database file (auction.db, catalogue.db, payment.db, user.db). The frontend is a set of static HTML/JS pages served by the API Gateway at `http://localhost:9191/`.

## Build & Run Commands

### Docker (recommended for full stack)
```bash
# Build all JARs first
mvn clean package -DskipTests

# Build Docker images and start all containers
docker compose build
docker compose up          # or: docker compose up -d

# Stop and remove
docker compose down
```

### Local Maven (individual service)
Run `service-registry` and `api-gateway` first, then any other service:
```bash
cd <service-dir>
./mvnw spring-boot:run
```

### Build all modules from root
```bash
mvn clean package -DskipTests
```

### Run tests
```bash
mvn test                   # all modules
cd auction-service && mvn test   # single service
```

## Service Ports

| Service           | Local Port | Docker Exposure |
|-------------------|------------|-----------------|
| service-registry  | 8761       | published        |
| api-gateway       | 9191       | published        |
| auction-service   | 8080       | internal only    |
| catalogue-service | 8081       | internal only    |
| payment-service   | 8082       | internal only    |
| user-service      | 8084       | internal only    |

- Eureka dashboard: `http://localhost:8761/`
- All traffic in production goes through: `http://localhost:9191/`
- Gateway route pattern: `http://localhost:9191/<service-name>/...` (e.g., `/auction-service/auctions/1`)

## Architecture

### Service Responsibilities
- **service-registry**: Netflix Eureka server — all services register here.
- **api-gateway**: Spring Cloud Gateway (WebFlux). Serves the static frontend and routes requests to downstream services via Eureka discovery. URL paths are auto-mapped using lower-case service IDs.
- **user-service** (port 8084): Registration, login, password reset. No JWT — session is stored client-side in `localStorage` (userId, email, username).
- **catalogue-service** (port 8081): Item CRUD, keyword search, shipping cost lookup.
- **auction-service** (port 8080): Auction lifecycle. Split into `AuctionCommandService` (write) and `AuctionQueryService` (read). Uses `@Version` optimistic locking on `Auction` to handle concurrent bids. `AuctionClosingScheduler` polls every 30 seconds and auto-closes expired auctions.
- **payment-service** (port 8082): Creates payments and receipts for auction winners; supports STANDARD and EXPEDITED shipping choices.

### Frontend
All HTML/CSS/JS lives in `api-gateway/src/main/resources/static/`. JavaScript calls backend APIs through `api.js`, which defines `USER_BASE`, `CATALOGUE_BASE`, `AUCTION_BASE`, and `PAYMENT_BASE` as relative paths through the gateway. Session state is plain `localStorage` — no auth tokens.

### Database
Each service uses SQLite with `org.hibernate.community.dialect.SQLiteDialect`. Schema is managed by `spring.jpa.hibernate.ddl-auto=update`. Seed data is in `data.sql` under `auction-service` and `catalogue-service`. Docker deployments mount named volumes (`auction_data`, etc.) at `/data`; the docker application properties point the datasource URLs there.

### Two Spring profiles
Each service has `application.properties` (local, Eureka at `localhost:8761`) and `application-docker.properties` (Docker, Eureka at `service-registry:8761`). Docker Compose sets `SPRING_PROFILES_ACTIVE=docker`.

## Key Patterns

- **Auction bids**: `POST /auction-service/auctions/{itemId}/bid` with `{ bidderId, amount }`. Amount must be a whole integer strictly greater than `currentPrice`.
- **Create auction**: `POST /auction-service/auctions` with `{ itemId, startPrice, endsAt }` where `endsAt` is an ISO-8601 local datetime string (e.g., `"2025-12-05T12:00:00"`).
- **Payment flow**: After auction closes, winner calls `POST /payment-service/payments` then retrieves receipt via `GET /payment-service/receipts/{paymentId}`.
- The `Auction` entity uses `@Version Long version` — always reload the entity inside the same `@Transactional` method before saving to avoid stale-state exceptions.

## Postman Tests
`PostmanTestCases/GatewayRoutes.postman_collection.json` contains pre-built requests for all gateway routes. Import into Postman and set the base URL to `http://localhost:9191`.
