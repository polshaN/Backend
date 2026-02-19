# Pet Adoption Platform - Microservices Architecture

A distributed microservices-based pet adoption platform built with Node.js, Express, MongoDB, and Keycloak.

## Architecture Overview

The system consists of **4 independent microservices** + **1 API Gateway**, orchestrated via Docker:

```
┌──────────────────────────────────────────────────────────────┐
│                     API Gateway (Port 8080)                  │
│                   Express-HTTP-Proxy Router                  │
└────────────────┬──────────────────┬──────────────────┬────────┘
                 │                  │                  │
      ┌──────────▼──────┐ ┌────────▼──────────┐ ┌─────▼──────────┐
      │  Pet Service    │ │ Profile Service   │ │ Chat Service   │
      │   (Port 4001)   │ │   (Port 4002)     │ │  (Port 4003)   │
      │                 │ │                   │ │                │
      │ • Animals CRUD  │ │ • UserModel Profiles   │ │ • WebSocket    │
      │ • Adoptions     │ │ • Profile Updates │ │ • Messages     │
      └──────────┬──────┘ └────────┬──────────┘ └─────┬──────────┘
                 │                 │                  │
      ┌──────────▼─────────────────▼──────────────────▼──────┐
      │            MongoDB (Shared Engine)                   │
      │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
      │  │  petdb   │  │ profiledb │  │  chatdb  │           │
      │  └──────────┘  └──────────┘  └──────────┘           │
      └────────────────────────────────────────────────────┘
      
      ┌──────────────────────────────────────────────────────┐
      │  Keycloak Auth Service (Port 8091)                   │
      │  ├─ UserModel Management                                  │
      │  ├─ JWT Token Issuance                               │
      │  └─ Realm Configuration: PETADOPTION-APP             │
      │                                                      │
      │  Database: Postgres (keycloak DB)                   │
      └──────────────────────────────────────────────────────┘
```

## Services

### 1. API Gateway (`api-gateway/`)
**Purpose:** Single entry point for all client requests, routes to microservices
- **Port:** 8080
- **Routes:**
  - `/auth/*` → Keycloak
  - `/pets/*`, `/animals/*`, `/adoptions/*` → Pet Service
  - `/profile/*`, `/users/*` → Profile Service
  - `/chat/*`, `/messages/*` → Chat Service
- **Features:** CORS enabled, JWT passthrough, environment-driven URLs

### 2. Pet Service (`pet-service/`)
**Purpose:** Pet adoption domain logic
- **Port:** 4001
- **Database:** `petdb` (MongoDB)
- **Endpoints:**
  - `GET /animals` - List all animals
  - `POST /animals` - Create animal
  - `GET /animals/:id` - Get animal
  - `PUT /animals/:id` - Update animal
  - `DELETE /animals/:id` - Delete animal
  - `POST /adoptions` - Request adoption
  - `GET /adoptions` - Get user adoptions
  - `PUT /adoptions/:id/status` - Update adoption status
  - `DELETE /adoptions/:id` - Cancel adoption
  - `GET /health` - Health check
- **Auth:** JWT validation on all endpoints

### 3. Profile Service (`profile-service/`)
**Purpose:** UserModel profile management
- **Port:** 4002
- **Database:** `profiledb` (MongoDB)
- **Endpoints:**
  - `GET /profile/me` - Fetch current user profile
  - `PUT /profile/me` - Update user profile
  - `POST /profile/create` - Create user profile
  - `GET /health` - Health check
- **Auth:** JWT extraction and validation

### 4. Chat Service (`chat-service/`)
**Purpose:** Real-time messaging
- **Port:** 4003
- **Database:** `chatdb` (MongoDB)
- **WebSocket Events:**
  - `join_room` - Join chat room
  - `send_message` - Send message
  - `disconnect` - Leave chat
- **REST API:**
  - `GET /messages/:userId` - Message history
  - `GET /health` - Health check
- **Auth:** JWT validation on connection

### 5. Auth Service (Keycloak)
**Purpose:** Centralized authentication
- **Port:** 8091
- **Admin Console:** http://localhost:8091
- **Credentials:** admin / admin
- **Realm:** PETADOPTION-APP
- **Database:** Postgres (keycloak)

## Getting Started

### Prerequisites
- Docker & Docker Compose installed
- Node.js 18+ (for local development)

### Quick Start

1. **Start all services:**
   ```bash
   cd petadoption
   docker-compose up -d
   ```

2. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

3. **Check health:**
   ```bash
   curl http://localhost:8080/health
   ```

### Service URLs (Docker Network)
- API Gateway: http://api-gateway:8080
- Pet Service: http://pet-service:4001
- Profile Service: http://profile-service:4002
- Chat Service: http://chat-service:4003
- Keycloak: http://keycloak:8080

### Local Development Setup

1. **Install dependencies for each service:**
   ```bash
   cd api-gateway && npm install && cd ..
   cd pet-service && npm install && cd ..
   cd profile-service && npm install && cd ..
   cd chat-service && npm install && cd ..
   ```

2. **Run individual services locally:**
   ```bash
   cd api-gateway && npm run dev
   cd pet-service && npm run dev
   cd profile-service && npm run dev
   cd chat-service && npm run dev
   ```

3. **MongoDB and Keycloak still run in Docker:**
   ```bash
   docker-compose up mongo keycloak keycloak-db -d
   ```

## Environment Variables

Each service has a `.env` file configured for Docker deployment:

### API Gateway (`.env`)
```
PORT=8080
PET_SERVICE_URL=http://pet-service:4001
PROFILE_SERVICE_URL=http://profile-service:4002
CHAT_SERVICE_URL=http://chat-service:4003
AUTH_SERVICE_URL=http://keycloak:8080
```

### Pet Service (`.env`)
```
PORT=4001
MONGO_URL=mongodb://admin:admin@mongo:27017/petdb?authSource=admin
JWT_ISSUER=http://keycloak:8080
KEYCLOAK_REALM=PETADOPTION-APP
```

### Profile Service (`.env`)
```
PORT=4002
MONGO_URL=mongodb://admin:admin@mongo:27017/profiledb?authSource=admin
JWT_ISSUER=http://keycloak:8080
KEYCLOAK_REALM=PETADOPTION-APP
```

### Chat Service (`.env`)
```
PORT=4003
MONGO_URL=mongodb://admin:admin@mongo:27017/chatdb?authSource=admin
JWT_ISSUER=http://keycloak:8080
KEYCLOAK_REALM=PETADOPTION-APP
CHAT_SERVICE_URL=http://localhost:4003
```

## Database Setup

- **MongoDB:** Shared engine with separate databases per service
  - Credentials: admin / admin
  - Databases: `petdb`, `profiledb`, `chatdb`
  - Port: 27017

- **Postgres (Keycloak):** 
  - Credentials: keycloak / keycloak
  - Database: keycloak
  - Port: 5432

## Authentication Flow

1. UserModel logs in via Keycloak (8091)
2. Keycloak issues JWT token
3. Frontend stores JWT token
4. API requests pass JWT in `Authorization: Bearer <token>` header
5. API Gateway forwards request to service
6. Service validates JWT independently
7. Service extracts userId from JWT payload
8. Service processes request with userId context

## API Gateway Routing

The API Gateway uses `express-http-proxy` to route requests:

```typescript
app.use('/auth', proxy(AUTH_SERVICE_URL));      // → Keycloak
app.use('/animals', proxy(PET_SERVICE_URL));    // → Pet Service
app.use('/adoptions', proxy(PET_SERVICE_URL));  // → Pet Service
app.use('/profile', proxy(PROFILE_SERVICE_URL));// → Profile Service
app.use('/chat', proxy(CHAT_SERVICE_URL));      // → Chat Service
app.use('/messages', proxy(CHAT_SERVICE_URL));  // → Chat Service
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View service logs
docker-compose logs -f api-gateway
docker-compose logs -f pet-service

# Stop all services
docker-compose down

# Rebuild services
docker-compose up -d --build

# Remove all data
docker-compose down -v
```

## Project Structure

```
petadoption/
├── docker-compose.yaml          # Orchestration file (SINGLE SOURCE)
├── api-gateway/                 # API Gateway service
│   ├── src/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── pet-service/                 # Pet adoption service
│   ├── src/
│   │   ├── index.ts
│   │   └── models/
│   │       └── adoption.model.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── profile-service/             # UserModel profile service
│   ├── src/
│   │   ├── index.ts
│   │   └── models/
│   │       └── profile.model.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── chat-service/                # Real-time chat service
│   ├── src/
│   │   ├── index.ts
│   │   ├── models/
│   │   │   └── chat.model.ts
│   │   └── websocket/
│   │       └── chat.websocket.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── auth-service/                # Keycloak configuration
│   ├── Dockerfile
│   └── realm-config/            # Realm setup
└── README.md                     # This file
```

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.0
- **Language:** TypeScript 5.0
- **Database:** MongoDB 6 + Postgres 15
- **Authentication:** Keycloak 21.1.1
- **Real-time:** Socket.IO 4.7
- **Containerization:** Docker + Docker Compose
- **API Gateway:** express-http-proxy
- **JWT Handling:** jwt-decode 3.1

## Testing

Each service can be tested via the API Gateway:

```bash
# Check service health
curl http://localhost:8080/health

# Get all animals
curl http://localhost:8080/animals

# Create animal (requires JWT)
curl -X POST http://localhost:8080/animals \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Buddy","type":"dog","breed":"Golden"}'
```

## Troubleshooting

### Services not starting
```bash
docker-compose down -v
docker-compose up -d
```

### Connection to MongoDB fails
- Check MongoDB is running: `docker-compose ps | grep mongo`
- Verify credentials in .env files

### JWT validation fails
- Ensure token is passed in `Authorization: Bearer <token>` header
- Check Keycloak is accessible at configured URL

### Port conflicts
- Modify `docker-compose.yaml` to use different ports
- Update `.env` files accordingly

## Contributing

- Follow TypeScript strict mode
- Add DTOs for API requests/responses
- Validate all inputs with class-validator
- Each service owns its database
- No direct database access between services
- Use API Gateway for all inter-service communication

## License

This project is part of the Pet Adoption Platform course assignment.
