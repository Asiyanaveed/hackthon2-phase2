# Makefile for Todo Chatbot Development and Deployment

.PHONY: help build build-backend build-frontend deploy deploy-minikube undeploy clean docker-build docker-run docker-stop

# Colors
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m

help: ## Show this help message
	@echo ""
	@echo -e "$(GREEN)Todo Chatbot - Available Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make \\033[36m<target>\\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \\033[36m%-20s\\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# Docker commands
docker-build: ## Build all Docker images
	@echo -e "$(YELLOW)Building backend image...$(NC)"
	docker build -t todo-backend:latest -f Dockerfile.backend .
	@echo -e "$(GREEN)Backend image built!$(NC)"
	@echo -e "$(YELLOW)Building frontend image...$(NC)"
	cd frontend && docker build -t todo-frontend:latest -f Dockerfile.frontend . \
		--build-arg NEXT_PUBLIC_API_URL=http://todo-backend:8000
	@echo -e "$(GREEN)Frontend image built!$(NC)"

docker-run: ## Run all services with Docker Compose
	@echo -e "$(YELLOW)Starting services with Docker Compose...$(NC)"
	docker-compose up -d
	@echo -e "$(GREEN)Services started!$(NC)"
	@echo -e "$(GREEN)Frontend: http://localhost:3000$(NC)"
	@echo -e "$(GREEN)Backend: http://localhost:8000$(NC)"
	@echo -e "$(GREEN)API Health: http://localhost:8000/health$(NC)"

docker-stop: ## Stop all Docker Compose services
	@echo -e "$(YELLOW)Stopping services...$(NC)"
	docker-compose down
	@echo -e "$(GREEN)Services stopped!$(NC)"

# Minikube commands
deploy-minikube: ## Deploy to Minikube
	@chmod +x k8s/deploy-minikube.sh
	./k8s/deploy-minikube.sh

undeploy-minikube: ## Undeploy from Minikube
	@chmod +x k8s/undeploy-minikube.sh
	./k8s/undeploy-minikube.sh

# Helm commands
deploy: ## Deploy using Helm
	@echo -e "$(YELLOW)Deploying with Helm...$(NC)"
	helm upgrade --install todo-chatbot k8s/helm \
		--namespace todo-chatbot \
		--create-namespace \
		-f k8s/helm/values.yaml \
		-f k8s/helm/values-secrets.yaml \
		--wait
	@echo -e "$(GREEN)Deployed successfully!$(NC)"

undeploy: ## Uninstall Helm release
	@echo -e "$(YELLOW)Uninstalling...$(NC)"
	helm uninstall todo-chatbot -n todo-chatbot 2>/dev/null || true
	kubectl delete namespace todo-chatbot 2>/dev/null || true
	@echo -e "$(GREEN)Uninstalled!$(NC)"

# Status commands
status: ## Show deployment status
	@echo -e "$(YELLOW)Pods in todo-chatbot namespace:$(NC)"
	@kubectl get pods -n todo-chatbot 2>/dev/null || echo "Namespace not found. Run 'make deploy' first."
	@echo ""
	@echo -e "$(YELLOW)Services in todo-chatbot namespace:$(NC)"
	@kubectl get svc -n todo-chatbot 2>/dev/null || true

logs: ## Show logs from all pods
	@echo -e "$(YELLOW)Frontend logs:$(NC)"
	-kubectl logs -l app=frontend -n todo-chatbot --tail=50
	@echo ""
	@echo -e "$(YELLOW)Backend logs:$(NC)"
	-kubectl logs -l app=backend -n todo-chatbot --tail=50

# Restart commands
restart: ## Restart all pods
	@echo -e "$(YELLOW)Restarting pods...$(NC)"
	kubectl rollout restart deployment/todo-chatbot-frontend -n todo-chatbot
	kubectl rollout restart deployment/todo-chatbot-backend -n todo-chatbot
	kubectl rollout status deployment/todo-chatbot-frontend -n todo-chatbot
	kubectl rollout status deployment/todo-chatbot-backend -n todo-chatbot
	@echo -e "$(GREEN)All pods restarted!$(NC)"

# Cleanup
clean: ## Clean up local Docker images
	@echo -e "$(YELLOW)Removing local Docker images...$(NC)"
	-docker rmi todo-backend:latest todo-frontend:latest 2>/dev/null || true
	@echo -e "$(GREEN)Local images cleaned!$(NC)"
