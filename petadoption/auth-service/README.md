# Auth Service (Keycloak)

This service provides authentication and authorization for the Pet Adoption system using Keycloak.

## Features
- UserModel registration, login, and JWT issuance
- Role-based access control
- Uses its own Postgres database (no sharing)

## How to Run

```sh
cd auth-service
# Start Keycloak and its Postgres DB
# Admin: admin / admin
docker-compose up -d
```

- Keycloak admin console: http://localhost:8091
- Default credentials: admin / admin

## Environment Variables
- `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`: Admin credentials
- `KC_DB`, `KC_DB_URL`, `KC_DB_USERNAME`, `KC_DB_PASSWORD`: Postgres DB config

## Data Ownership
- This service owns its own Postgres DB (`keycloak-db`).
- No other service accesses this DB directly.

## JWT Authentication Flow
- Clients authenticate via Keycloak and receive a JWT.
- All other microservices validate JWTs using Keycloak's public keys.
- No business service stores or checks passwords.
