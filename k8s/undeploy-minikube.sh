#!/bin/bash
# Undeployment Script for Todo Chatbot from Minikube

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}====================================${NC}"
echo -e "${YELLOW}  Uninstalling Todo Chatbot${NC}"
echo -e "${YELLOW}====================================${NC}"

# Check if Helm release exists
if helm list -n todo-chatbot | grep -q todo-chatbot; then
    echo -e "\n${YELLOW}Uninstalling Helm release...${NC}"
    helm uninstall todo-chatbot -n todo-chatbot
    echo -e "${GREEN}Helm release uninstalled!${NC}"
else
    echo -e "\n${YELLOW}No Helm release found in todo-chatbot namespace${NC}"
fi

# Delete namespace
echo -e "\n${YELLOW}Deleting namespace...${NC}"
kubectl delete namespace todo-chatbot --ignore-not-found=true
echo -e "${GREEN}Namespace deleted!${NC}"

# Clean up local images (optional)
echo -e "\n${YELLOW}Cleaning up local Docker images...${NC}"
docker rmi todo-backend:latest todo-frontend:latest 2>/dev/null || echo "Images already removed"
echo -e "${GREEN}Local images cleaned up!${NC}"

echo -e "\n${GREEN}====================================${NC}"
echo -e "${GREEN}  Uninstallation Complete!${NC}"
echo -e "${GREEN}====================================${NC}"
echo -e "\n${YELLOW}Note: If you want to start fresh, you can also:${NC}"
echo -e "  minikube delete  # Deletes the entire cluster"
