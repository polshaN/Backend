# Petadoption Backend

This folder contains the API server and MongoDB for the Pet Adoption app.

## How to Run

```sh
cd petadoption-backend
# Start API and MongoDB
# API: http://localhost:3000
# MongoDB: localhost:27017
docker-compose up -d
```

- The API expects Keycloak to be running at http://localhost:8091 (see ../auth)
- Environment variables are set in `.env` and `docker-compose.yaml`

## Environment Variables
- `PORT=3000`
- `MONGO_URL=mongodb://mongo:27017/petadoption`
- `CORS_ORIGIN=http://localhost:4173`
- `KEYCLOAK_BASE_URL=http://localhost:8091`
- `KEYCLOAK_REALM=PETADOPTION-APP`
- `KEYCLOAK_CLIENT_ID=WEB-APP`

## Notes
- MongoDB data is stored in the `mongo-data` Docker volume.
- Keycloak is not started by this compose file. See the `auth` folder for Keycloak setup.
