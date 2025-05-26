# MongoDB Atlas to Self-Hosted Transition Guide

This guide covers the complete transition from MongoDB Atlas to self-hosted MongoDB with Docker deployment.

## Current Status

 **Completed Steps:**
- Local MongoDB installed and running on Fedora
- Docker configuration files created
- Environment files set up for different deployment modes
- Helper scripts created for easy setup
- Health check endpoint added to server

## Transition Process

### Phase 1: Local Development (READY)

Your local development environment is now configured to use local MongoDB instead of Atlas.

**Files Created/Modified:**
- `docker-compose.yml` - Docker orchestration
- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration
- `backend/config/.env.local` - Local development environment
- `backend/config/.env.docker` - Docker environment
- `backend/mongo-init/init-db.js` - MongoDB initialization script
- `scripts/setup-local.sh` - Local setup automation
- `scripts/setup-docker.sh` - Docker setup automation
- `scripts/migrate-data.sh` - Data migration helper

### Phase 2: Data Migration

To migrate your existing data from Atlas to local MongoDB:

```bash
# Install MongoDB tools (if not already installed)
sudo dnf install mongodb-database-tools

# Run the migration script
./scripts/migrate-data.sh
```

### Phase 3: Development Workflow

**For Local Development:**
```bash
# Setup (run once)
./scripts/setup-local.sh

# Start development
cd backend && npm run dev
cd frontend && npm run dev  # in another terminal
```

**For Docker Development:**
```bash
# Setup and run
./scripts/setup-docker.sh

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Configurations

### Local Development (.env.local)
- MongoDB: `mongodb://localhost:27017/project_test`
- No authentication required
- Direct connection to local MongoDB service

### Docker Environment (.env.docker)
- MongoDB: `mongodb://admin:password123@mongodb:27017/project_test?authSource=admin`
- Uses MongoDB container with authentication
- Isolated network between services

## Docker Services

The `docker-compose.yml` includes:

1. **MongoDB Service**
   - Image: `mongo:7.0`
   - Port: `27017`
   - Persistent data volume
   - Authentication enabled

2. **Backend Service**
   - Built from `./backend/Dockerfile`
   - Port: `5000`
   - Depends on MongoDB
   - Health checks enabled

3. **Frontend Service** (optional)
   - Built from `./frontend/Dockerfile`
   - Port: `3000`
   - Nginx-based serving

## Migration Commands

```bash
# Export from Atlas
mongodump --uri="mongodb+srv://aviral:dassProject123@cluster0.dk3s4.mongodb.net/project_test" --out="./mongodb-backup"

# Import to local
mongorestore --uri="mongodb://localhost:27017/project_test" "./mongodb-backup/project_test"

# Or use the automated script
./scripts/migrate-data.sh
```

## Deployment Options

### Development
- Local MongoDB + Local Node.js
- Hot reloading enabled
- Direct file system access

### Staging/Testing
- Docker Compose
- Isolated services
- Production-like environment

### Production
- Docker Compose with additional configurations
- External volumes for data persistence
- Environment-specific configurations
- SSL/TLS encryption
- Backup strategies

## Health Monitoring

The server now includes a health check endpoint:
- **URL:** `GET /api/health`
- **Response:** Server status, uptime, timestamp
- **Used by:** Docker health checks

## Security Considerations

### Local Development
- No authentication required
- Accessible only from localhost

### Docker/Production
- MongoDB admin user: `admin:password123`
- Application user: `app_user:app_password123`
- **Change passwords in production!**

## Directory Structure

```
project/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── config/
│   │   ├── .env.local      # Local development
│   │   ├── .env.docker     # Docker environment
│   │   └── .env            # Active environment (git-ignored)
│   └── mongo-init/
│       └── init-db.js      # Database initialization
├── frontend/
│   └── Dockerfile
└── scripts/
    ├── setup-local.sh      # Local setup
    ├── setup-docker.sh     # Docker setup
    └── migrate-data.sh     # Data migration
```

## Next Steps

1. **Test Local Development:**
   ```bash
   cd backend && npm run dev
   ```

2. **Migrate Your Data:**
   ```bash
   ./scripts/migrate-data.sh
   ```

3. **Test Docker Environment:**
   ```bash
   ./scripts/setup-docker.sh
   ```

4. **Update Production Secrets:**
   - Change MongoDB passwords
   - Update JWT secrets
   - Configure SSL certificates

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo journalctl -u mongod
```

### Docker Issues
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
./scripts/setup-docker.sh
```

### Data Migration Issues
```bash
# Check if tools are installed
mongodump --version
mongorestore --version

# Install if missing
sudo dnf install mongodb-database-tools
```

## Notes

- Environment files are git-ignored for security
- Upload and temp directories are preserved in Docker volumes
- Health checks ensure container reliability
- Scripts automate common tasks
