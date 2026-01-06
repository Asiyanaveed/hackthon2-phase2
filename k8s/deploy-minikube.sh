#!/bin/bash
# Minikube Deployment Script for Todo Chatbot
# This script builds Docker images and deploys to Minikube

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}  Todo Chatbot - Minikube Deployment${NC}"
echo -e "${GREEN}====================================${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

command -v minikube >/dev/null 2>&1 || { echo -e "${RED}minikube is not installed${NC}" >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is not installed${NC}" >&2; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}docker is not installed${NC}" >&2; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}helm is not installed${NC}" >&2; exit 1; }

echo -e "${GREEN}All prerequisites met!${NC}"

# Start Minikube if not running
echo -e "\n${YELLOW}Checking Minikube status...${NC}"
if ! minikube status >/dev/null 2>&1; then
    echo -e "${YELLOW}Starting Minikube...${NC}"
    minikube start --driver=docker --cpus=2 --memory=4g
else
    echo -e "${GREEN}Minikube is already running${NC}"
fi

# Enable Docker in Minikube
echo -e "\n${YELLOW}Configuring Docker environment...${NC}"
eval $(minikube docker-env)

# Build Docker images
echo -e "\n${YELLOW}Building backend Docker image...${NC}"
cd "$PROJECT_ROOT"
docker build -t todo-backend:latest -f Dockerfile.backend .
echo -e "${GREEN}Backend image built successfully!${NC}"

echo -e "\n${YELLOW}Building frontend Docker image...${NC}"
cd "$PROJECT_ROOT/frontend"
docker build -t todo-frontend:phase4 \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -f "$PROJECT_ROOT/Dockerfile.frontend" "$PROJECT_ROOT"
echo -e "${GREEN}Frontend image built successfully!${NC}"

cd "$PROJECT_ROOT"

# Create namespace if it doesn't exist
echo -e "\n${YELLOW}Creating namespace...${NC}"
kubectl create namespace todo-chatbot 2>/dev/null || echo "Namespace already exists"

# Update Helm values to enable deployments
echo -e "\n${YELLOW}Updating Helm configuration...${NC}"
cat > k8s/helm/values-minikube.yaml <<EOF
# Minikube-specific values
backend:
  enabled: true
  replicaCount: 1  # Reduce replicas for local testing

frontend:
  enabled: true
  replicaCount: 1

ingress:
  enabled: false  # Disable ingress for simple NodePort access

# Disable PostgreSQL chart (using external Neon DB)
postgresql:
  enabled: false
EOF

# Deploy using Helm
echo -e "\n${YELLOW}Deploying to Kubernetes with Helm...${NC}"
helm upgrade --install todo-chatbot k8s/helm \
  --namespace todo-chatbot \
  --create-namespace \
  -f k8s/helm/values.yaml \
  -f k8s/helm/values-minikube.yaml \

# Show deployment status
echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}====================================${NC}"

echo -e "\n${YELLOW}Pod status:${NC}"
kubectl get pods -n todo-chatbot

echo -e "\n${YELLOW}Service status:${NC}"
kubectl get svc -n todo-chatbot

echo -e "\n${GREEN}Access the application:${NC}"
echo -e "Frontend: ${GREEN}http://$(minikube ip):30080${NC}"
echo -e "Backend API: ${GREEN}http://$(minikube ip):30080/api${NC}"
echo -e "Backend Health: ${GREEN}http://$(minikube ip):30080/health${NC}"

echo -e "\n${YELLOW}To open in browser:${NC}"
echo -e "  minikube service todo-chatbot-frontend -n todo-chatbot"

echo -e "\n${YELLOW}To view logs:${NC}"
echo -e "  kubectl logs -f deployment/todo-chatbot-frontend -n todo-chatbot"
echo -e "  kubectl logs -f deployment/todo-chatbot-backend -n todo-chatbot"
