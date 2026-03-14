# Music Trivia Game - Docker Guide

This guide explains how to run the Music Trivia Game using Docker containers.

## Overview

The application consists of three containerized services:

1. **MongoDB** - Database service (MongoDB 7)
2. **Backend** - Node.js/Express API server
3. **Frontend** - React application served by Nginx

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose V2 (included with Docker Desktop)

## Quick Start

### Using the Helper Script (Easiest)

```bash
./scripts/docker-start.sh
```

Select:
- **Option 1 (Production)**: Optimized builds with Nginx serving static files
- **Option 2 (Development)**: Hot reload for both frontend and backend

### Manual Start

#### Production Mode

```bash
# Build and start all services
docker compose up --build -d

# Seed the database with 25 games
docker compose exec backend npm run seed

# View the app at http://localhost:3000
```

#### Development Mode

```bash
# Build and start in development mode
docker compose -f docker-compose.dev.yml up --build -d

# Seed the database
docker compose -f docker-compose.dev.yml exec backend npm run seed

# View the app at http://localhost:3000
```

## Docker Compose Files

### docker-compose.yml (Production)
- Uses multi-stage builds for optimized images
- Frontend served by Nginx
- Health checks enabled
- Persistent MongoDB volumes

### docker-compose.dev.yml (Development)
- Volume mounts for hot reload
- Development servers (React dev server, nodemon)
- Faster iteration for development

## Useful Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

### Stop Services
```bash
# Stop and remove containers
docker compose down

# Stop, remove containers, and delete volumes (⚠️ deletes all data!)
docker compose down -v
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Execute Commands in Containers
```bash
# Access backend shell
docker compose exec backend sh

# Run seed script
docker compose exec backend npm run seed

# Access MongoDB shell
docker compose exec mongodb mongosh music-trivia
```

### View Container Status
```bash
docker compose ps
```

### Rebuild Specific Service
```bash
# Rebuild and restart backend
docker compose up -d --build backend

# Rebuild and restart frontend
docker compose up -d --build frontend
```

## Ports

| Service  | Port | Description |
|----------|------|-------------|
| Frontend | 3000 | React app (production via Nginx) |
| Backend  | 5000 | Express API server |
| MongoDB  | 27017 | MongoDB database |

## Volumes

MongoDB data persists across container restarts via named volumes:
- `mongodb_data` - Database files
- `mongodb_config` - MongoDB configuration

## Environment Variables

The backend service uses these environment variables (configured in docker-compose.yml):

- `NODE_ENV` - Environment mode (production/development)
- `PORT` - Backend server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string

## Networking

All services communicate via the `music-trivia-network` bridge network:
- Services reference each other by service name (e.g., `mongodb://mongodb:27017`)
- Frontend proxies API requests to backend via Nginx configuration

## Health Checks

### Backend
- Endpoint: `http://localhost:5000/api/health`
- Checks every 30 seconds
- 3 retries before marking unhealthy

### Frontend
- Checks Nginx is responding on port 80
- Every 30 seconds

### MongoDB
- Uses `mongosh` ping command
- Checks every 10 seconds
- Backend waits for MongoDB to be healthy before starting

## Troubleshooting

### Port Already in Use
If ports 3000, 5000, or 27017 are in use:

1. Stop conflicting services
2. Or modify ports in docker-compose.yml:
   ```yaml
   ports:
     - "8080:80"  # Change 3000 -> 8080
   ```

### Container Won't Start
```bash
# View detailed logs
docker compose logs backend

# Check container status
docker compose ps

# Restart specific service
docker compose restart backend
```

### Database Connection Issues
```bash
# Check MongoDB is running
docker compose ps mongodb

# Check MongoDB logs
docker compose logs mongodb

# Verify network
docker network inspect jitterbox-rocks_jitterbox-rocks-network
```

### Clear Everything and Start Fresh
```bash
# Stop all containers and remove volumes
docker compose down -v

# Remove all images
docker compose down --rmi all

# Rebuild from scratch
docker compose up --build -d

# Re-seed database
docker compose exec backend npm run seed
```

## Production Deployment

For production deployment (e.g., AWS, DigitalOcean, etc.):

1. **Set environment variables** in docker-compose.yml or use .env file
2. **Use production MongoDB** (update MONGODB_URI)
3. **Configure reverse proxy** (Nginx/Caddy) for SSL
4. **Set up backup** for MongoDB volumes
5. **Monitor logs** with logging service

Example production MongoDB URI:
```yaml
environment:
  MONGODB_URI: mongodb+srv://user:pass@cluster.mongodb.net/music-trivia
```

## Development Workflow

1. Start development containers:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

2. Code changes automatically reload (volume mounts)

3. View logs while developing:
   ```bash
   docker compose -f docker-compose.dev.yml logs -f
   ```

4. Test changes without rebuilding containers

5. When ready, test production build:
   ```bash
   docker compose up --build -d
   ```

## Benefits of Docker Approach

✅ **No MongoDB Installation** - Everything runs in containers  
✅ **Consistent Environment** - Works same on all machines  
✅ **Easy Setup** - One command to start everything  
✅ **Isolated** - Doesn't conflict with other projects  
✅ **Production-Ready** - Same setup for dev and prod  
✅ **Easy Cleanup** - Remove everything with one command  

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
