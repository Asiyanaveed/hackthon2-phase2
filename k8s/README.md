# Kubernetes Deployment - Todo Chatbot

This directory contains all the files needed to deploy the Todo Chatbot application to a local Kubernetes cluster using Minikube.

## Prerequisites

Ensure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker and Kubernetes)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/)
- (Optional) [kubectl-ai](https://github.com/sozercan/kubectl-ai) for AI-assisted cluster operations

## Quick Start

### 1. Configure Secrets

Copy the secrets example file and fill in your actual values:

```bash
cp k8s/helm/values-secrets.yaml.example k8s/helm/values-secrets.yaml
```

Edit `values-secrets.yaml` and update:
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - A strong random string for JWT signing
- `OPENAI_API_KEY` - Your OpenAI API key for AI features

### 2. Deploy to Minikube

Run the deployment script:

```bash
chmod +x k8s/deploy-minikube.sh
./k8s/deploy-minikube.sh
```

This script will:
- Start Minikube (if not running)
- Build Docker images locally
- Configure Helm with proper values
- Deploy all components to Kubernetes
- Show access information

### 3. Access the Application

After deployment, access the application at:

- **Frontend**: http://localhost:30080
- **Backend API**: http://localhost:30080/api
- **Health Check**: http://localhost:30080/health

Or use Minikube's service command to open in browser:

```bash
minikube service todo-chatbot-frontend -n todo-chatbot
```

## Manual Deployment

If you prefer to deploy step by step:

### Start Minikube

```bash
minikube start --driver=docker --cpus=2 --memory=4g
```

### Build Docker Images

```bash
# Enable Minikube Docker
eval $(minikube docker-env)

# Build backend
docker build -t todo-backend:latest -f Dockerfile.backend .

# Build frontend
cd frontend
docker build -t todo-frontend:latest -f Dockerfile.frontend . \
  --build-arg NEXT_PUBLIC_API_URL=http://todo-backend:8000
cd ..
```

### Deploy with Helm

```bash
helm upgrade --install todo-chatbot k8s/helm \
  --namespace todo-chatbot \
  --create-namespace \
  -f k8s/helm/values.yaml \
  -f k8s/helm/values-secrets.yaml \
  --wait
```

## Managing the Deployment

### View Pods

```bash
kubectl get pods -n todo-chatbot
```

### View Logs

```bash
# Frontend logs
kubectl logs -f deployment/todo-chatbot-frontend -n todo-chatbot

# Backend logs
kubectl logs -f deployment/todo-chatbot-backend -n todo-chatbot
```

### Scale Deployments

```bash
# Scale backend to 3 replicas
kubectl scale deployment/todo-chatbot-backend --replicas=3 -n todo-chatbot

# Scale frontend to 3 replicas
kubectl scale deployment/todo-chatbot-frontend --replicas=3 -n todo-chatbot
```

### Restart Pods

```bash
# Restart all pods
kubectl rollout restart deployment/todo-chatbot-backend -n todo-chatbot
kubectl rollout restart deployment/todo-chatbot-frontend -n todo-chatbot
```

### Check Health

```bash
# Check all resources
kubectl get all -n todo-chatbot

# Check service endpoints
kubectl get endpoints -n todo-chatbot
```

## Uninstall

To remove the deployment:

```bash
chmod +x k8s/undeploy-minikube.sh
./k8s/undeploy-minikube.sh
```

Or manually:

```bash
helm uninstall todo-chatbot -n todo-chatbot
kubectl delete namespace todo-chatbot
```

## kubectl-ai Integration

This project includes configuration for kubectl-ai, an AI-powered kubectl plugin.

### Install kubectl-ai

```bash
# Using Krew (recommended)
kubectl krew install ai

# Or install directly
curl -Lo kubectl-ai https://github.com/sozercan/kubectl-ai/releases/latest/download/kubectl-ai
chmod +x kubectl-ai
sudo mv kubectl-ai /usr/local/bin/
```

### Set OpenAI API Key

```bash
export OPENAI_API_KEY="your-openai-api-key"
```

### Example Commands

With kubectl-ai, you can use natural language:

```bash
# "Show me all pods in the todo-chatbot namespace"
kubectl ai "Show me all pods in the todo-chatbot namespace"

# "Scale the backend to 3 replicas"
kubectl ai "Scale the backend deployment to 3 replicas"

# "Show me the logs from the frontend"
kubectl ai "Show me the logs from the frontend pod"

# "What's wrong with my deployment?"
kubectl ai "Why are the backend pods not ready?"
```

See `k8s/kubectl-ai-config.yaml` for more examples.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Minikube                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              todo-chatbot namespace                  │   │
│  │  ┌─────────────┐    ┌─────────────┐                 │   │
│  │  │   Frontend  │    │   Backend   │                 │   │
│  │  │  (Next.js)  │───▶│  (FastAPI)  │                 │   │
│  │  │   :3000     │    │   :8000     │                 │   │
│  │  └─────────────┘    └─────────────┘                 │   │
│  │         │                   │                        │   │
│  │         ▼                   ▼                        │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │              NodePort Service               │    │   │
│  │  │              (port 30080)                   │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│            ┌────────────┴────────────┐                      │
│            ▼                         ▼                      │
│    localhost:30080           External Services              │
│    (Browser)                 (Neon PostgreSQL,             │
│                             OpenAI API)                     │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### Helm Values

The main configuration is in `k8s/helm/values.yaml`. Key settings:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend pods | 2 |
| `frontend.replicaCount` | Number of frontend pods | 2 |
| `backend.env.DATABASE_URL` | PostgreSQL connection | (from secrets) |
| `backend.env.BETTER_AUTH_SECRET` | JWT secret | (from secrets) |
| `backend.env.OPENAI_API_KEY` | OpenAI API key | (from secrets) |
| `frontend.env.NEXT_PUBLIC_API_URL` | Backend API URL | http://todo-backend:8000 |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | JWT signing secret |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n todo-chatbot

# Check pod logs
kubectl logs <pod-name> -n todo-chatbot
```

### Database connection failed

Ensure your `DATABASE_URL` is correct and the database is accessible from Minikube.

### Images not found

Make sure you built the images in Minikube's Docker environment:

```bash
eval $(minikube docker-env)
docker build -t todo-backend:latest .
```

### Frontend can't reach Backend

Check the service DNS: `http://todo-chatbot-backend:8000` from within the cluster.

## Production Considerations

This configuration is optimized for local development. For production:

1. Use a proper ingress controller (nginx-ingress, traefik)
2. Enable TLS/SSL
3. Use a managed PostgreSQL (Neon, RDS, etc.)
4. Set up proper secrets management (Vault, sealed secrets)
5. Configure resource limits and requests
6. Set up monitoring (Prometheus, Grafana)
7. Configure log aggregation (Loki, ELK)
8. Use image scanning for vulnerabilities
