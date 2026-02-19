# Quick Start Guide - Pet Adoption Microservices

## 🚀 30-Second Startup

```bash
# Navigate to project
cd petadoption

# Start all services
docker-compose up -d

# Verify running
docker-compose ps

# Check health
curl http://localhost:8080/health
```

## 📍 Service URLs (After `docker-compose up`)

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| API Gateway | http://localhost:8080 | 8080 | Entry point for all requests |
| Pet Service | http://localhost:4001 | 4001 | Animals & Adoptions |
| Profile Service | http://localhost:4002 | 4002 | UserModel profiles |
| Chat Service | http://localhost:4003 | 4003 | Real-time messaging |
| Keycloak | http://localhost:8091 | 8091 | Authentication |
| MongoDB | localhost:27017 | 27017 | Database |

## 🔑 Keycloak Admin Access

- **URL:** http://localhost:8091/admin
- **Username:** admin
- **Password:** admin
- **Realm:** PETADOPTION-APP

## 📝 API Examples

### 1. Get All Animals
```bash
curl http://localhost:8080/animals
```

### 2. Get UserModel Profile (with JWT)
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:8080/profile/me
```

### 3. Update UserModel Profile
```bash
curl -X PUT http://localhost:8080/profile/me \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

### 4. Create AnimalModel (admin)
```bash
curl -X POST http://localhost:8080/animals \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Max",
    "type": "dog",
    "breed": "Labrador",
    "age": 5,
    "health_status": "healthy"
  }'
```

### 5. Request Adoption
```bash
curl -X POST http://localhost:8080/adoptions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "animalId": "507f1f77bcf86cd799439011"
  }'
```

### 6. Get UserModel's Adoptions
```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" \
  http://localhost:8080/adoptions
```

### 7. WebSocket Chat Connection
```javascript
const socket = io('http://localhost:4003', {
  transportOptions: {
    polling: {
      extraHeaders: {
        Authorization: `Bearer ${JWT_TOKEN}`
      }
    }
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('join_room', { roomId: 'adoption-help' });
});

socket.on('new_message', (data) => {
  console.log('Message:', data.message);
});

socket.emit('send_message', { message: 'Hello everyone!' });
```

## 🛠️ Useful Commands

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f pet-service
docker-compose logs -f profile-service
docker-compose logs -f chat-service
docker-compose logs -f api-gateway

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild services (if code changed)
docker-compose up -d --build

# Execute command in running container
docker-compose exec pet-service sh

# View service status
docker-compose ps

# Restart specific service
docker-compose restart pet-service
```

## 🐛 Common Issues & Solutions

### "Connection refused" on port 8080
→ Ensure `docker-compose up -d` completed successfully
→ Check `docker-compose ps` to see if API Gateway is running
→ Review logs: `docker-compose logs api-gateway`

### MongoDB connection error
→ Check MongoDB is running: `docker-compose ps | grep mongo`
→ Verify credentials in .env files (should be admin/admin)
→ Check MONGO_URL format in service .env

### JWT validation failed
→ Ensure token is passed in `Authorization: Bearer <token>` header
→ Verify token is valid (use jwt.io to decode)
→ Check token hasn't expired

### Service won't start
→ Check logs: `docker-compose logs <service-name>`
→ Verify all dependencies are running: `docker-compose ps`
→ Check for port conflicts
→ Ensure .env files exist and are properly formatted

### Cannot connect to Keycloak
→ Verify Keycloak container is running: `docker-compose ps keycloak`
→ Wait ~30 seconds for Keycloak to fully start
→ Check Keycloak logs: `docker-compose logs keycloak`
→ Verify Postgres database is running: `docker-compose ps keycloak-db`

## 📊 Architecture At A Glance

```
Client App
    ↓
API Gateway (8080)
    ├→ Pet Service (4001)      [MongoDB: petdb]
    ├→ Profile Service (4002)  [MongoDB: profiledb]
    ├→ Chat Service (4003)     [MongoDB: chatdb]
    └→ Keycloak (8091)         [Postgres: keycloak]
```

## 🔐 Authentication Flow

```
1. UserModel logs in via Keycloak → gets JWT token
2. Frontend stores JWT → includes in API requests
3. API Gateway forwards request → JWT passed to service
4. Service validates JWT → extracts userId
5. Service processes request → with user context
```

## 📂 Environment Files

Each service has its own .env file configured for Docker deployment:

```
api-gateway/.env
├─ PORT=8080
├─ PET_SERVICE_URL=http://pet-service:4001
├─ PROFILE_SERVICE_URL=http://profile-service:4002
├─ CHAT_SERVICE_URL=http://chat-service:4003
└─ AUTH_SERVICE_URL=http://keycloak:8080

pet-service/.env
├─ PORT=4001
├─ MONGO_URL=mongodb://admin:admin@mongo:27017/petdb?authSource=admin
├─ JWT_ISSUER=http://keycloak:8080
└─ KEYCLOAK_REALM=PETADOPTION-APP

profile-service/.env
├─ PORT=4002
├─ MONGO_URL=mongodb://admin:admin@mongo:27017/profiledb?authSource=admin
├─ JWT_ISSUER=http://keycloak:8080
└─ KEYCLOAK_REALM=PETADOPTION-APP

chat-service/.env
├─ PORT=4003
├─ MONGO_URL=mongodb://admin:admin@mongo:27017/chatdb?authSource=admin
├─ JWT_ISSUER=http://keycloak:8080
└─ KEYCLOAK_REALM=PETADOPTION-APP
```

## 🚀 Local Development

If running services locally (for debugging):

1. Keep Docker services running:
   ```bash
   docker-compose up mongo keycloak keycloak-db -d
   ```

2. Update service .env files for local:
   ```bash
   # pet-service/.env
   MONGO_URL=mongodb://admin:admin@localhost:27017/petdb?authSource=admin
   
   # profile-service/.env
   MONGO_URL=mongodb://admin:admin@localhost:27017/profiledb?authSource=admin
   
   # chat-service/.env
   MONGO_URL=mongodb://admin:admin@localhost:27017/chatdb?authSource=admin
   ```

3. Run services locally:
   ```bash
   cd pet-service && npm run dev
   cd profile-service && npm run dev
   cd chat-service && npm run dev
   cd api-gateway && npm run dev
   ```

## 📞 Quick Support

- **General Setup:** See README.md
- **Detailed Implementation:** See IMPLEMENTATION_SUMMARY.md
- **Docker Issues:** Check docker-compose logs
- **Service Logs:** `docker-compose logs <service>`
- **Port Conflicts:** Edit docker-compose.yaml ports
- **Database Issues:** Check MongoDB credentials in .env

## ✨ Key Files to Know

- `docker-compose.yaml` - Main orchestration file (DO NOT duplicate)
- `api-gateway/src/index.ts` - Router/proxy logic
- `pet-service/src/index.ts` - AnimalModel & adoption endpoints
- `profile-service/src/index.ts` - UserModel profile endpoints
- `chat-service/src/index.ts` - WebSocket server
- `.env` files - Service configuration

## 📋 Checklist Before Going Live

- [ ] `docker-compose up -d` runs without errors
- [ ] `docker-compose ps` shows all 7 services as running
- [ ] `curl http://localhost:8080/health` returns 200
- [ ] Keycloak admin console accessible at port 8091
- [ ] MongoDB accessible via native client or tool
- [ ] All .env files properly configured
- [ ] JWT tokens are being issued by Keycloak
- [ ] Services accepting and validating JWTs
- [ ] Chat WebSocket connection working
- [ ] All database collections created

---

**Last Updated:** 2025  
**Status:** ✅ Ready for Development & Deployment
