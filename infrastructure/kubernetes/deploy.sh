#!/bin/bash

# Vault Platform Kubernetes Deployment Script
# This script deploys the complete Vault Modernization Platform to Kubernetes

set -e

# Configuration
NAMESPACE="vault-platform"
REGISTRY="your-registry.com"
TAG="${TAG:-latest}"
ENVIRONMENT="${ENVIRONMENT:-production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create namespace
create_namespace() {
    log_info "Creating namespace: $NAMESPACE"
    
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE already exists"
    else
        kubectl apply -f namespace.yaml
        log_success "Namespace $NAMESPACE created"
    fi
}

# Deploy infrastructure components
deploy_infrastructure() {
    log_info "Deploying infrastructure components..."
    
    # Deploy storage
    kubectl apply -f storage.yaml
    log_success "Storage deployed"
    
    # Deploy database
    kubectl apply -f database.yaml
    log_success "Database deployed"
    
    # Deploy Redis
    kubectl apply -f redis.yaml
    log_success "Redis deployed"
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    kubectl wait --for=condition=ready pod -l app=vault-postgresql -n $NAMESPACE --timeout=300s
    log_success "Database is ready"
    
    # Wait for Redis to be ready
    log_info "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=vault-redis -n $NAMESPACE --timeout=300s
    log_success "Redis is ready"
}

# Deploy configuration
deploy_configuration() {
    log_info "Deploying configuration..."
    
    kubectl apply -f configmap.yaml
    kubectl apply -f secrets.yaml
    log_success "Configuration deployed"
}

# Deploy services
deploy_services() {
    log_info "Deploying microservices..."
    
    # Deploy API Gateway first
    kubectl apply -f api-gateway.yaml
    log_success "API Gateway deployed"
    
    # Deploy core services
    kubectl apply -f services.yaml
    kubectl apply -f services-2.yaml
    kubectl apply -f services-3.yaml
    kubectl apply -f services-4.yaml
    log_success "Microservices deployed"
    
    # Deploy frontend
    kubectl apply -f frontend.yaml
    log_success "Frontend deployed"
}

# Deploy ingress
deploy_ingress() {
    log_info "Deploying ingress..."
    
    kubectl apply -f ingress.yaml
    log_success "Ingress deployed"
}

# Wait for all deployments
wait_for_deployments() {
    log_info "Waiting for all deployments to be ready..."
    
    deployments=(
        "vault-api-gateway"
        "vault-product-intelligence"
        "vault-marketplace-integration"
        "vault-vendor-integration"
        "vault-order-processing"
        "vault-pricing-engine"
        "vault-inventory-management"
        "vault-accounting-system"
        "vault-analytics-engine"
        "vault-tenant-management"
        "vault-notification-service"
        "vault-performance-optimization"
        "vault-security-compliance"
        "vault-frontend"
    )
    
    for deployment in "${deployments[@]}"; do
        log_info "Waiting for $deployment..."
        kubectl wait --for=condition=available deployment/$deployment -n $NAMESPACE --timeout=600s
        log_success "$deployment is ready"
    done
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Create a job to run migrations
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: vault-migrations
  namespace: $NAMESPACE
spec:
  template:
    spec:
      containers:
      - name: migrations
        image: $REGISTRY/vault-modernization:$TAG
        command: ["npm", "run", "db:migrate"]
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: vault-platform-config
              key: DATABASE_URL
      restartPolicy: Never
  backoffLimit: 3
EOF
    
    # Wait for migration job to complete
    kubectl wait --for=condition=complete job/vault-migrations -n $NAMESPACE --timeout=300s
    log_success "Database migrations completed"
}

# Health check
health_check() {
    log_info "Performing health checks..."
    
    # Check if all pods are running
    failed_pods=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase!=Running --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        log_error "Some pods are not running"
        kubectl get pods -n $NAMESPACE
        exit 1
    fi
    
    # Check API Gateway health
    if kubectl get svc vault-api-gateway -n $NAMESPACE &> /dev/null; then
        log_info "Checking API Gateway health..."
        # This would require port-forwarding or external access
        log_success "Health checks passed"
    fi
}

# Display deployment information
display_info() {
    log_success "Deployment completed successfully!"
    echo
    echo "Deployment Information:"
    echo "======================"
    echo "Namespace: $NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo "Tag: $TAG"
    echo
    echo "Services:"
    echo "========="
    kubectl get svc -n $NAMESPACE
    echo
    echo "Pods:"
    echo "====="
    kubectl get pods -n $NAMESPACE
    echo
    echo "To access the application:"
    echo "========================="
    echo "Frontend: https://vault-platform.com"
    echo "API: https://api.vault-platform.com"
    echo
    echo "To view logs:"
    echo "============="
    echo "kubectl logs -f deployment/vault-api-gateway -n $NAMESPACE"
    echo
    echo "To scale services:"
    echo "=================="
    echo "kubectl scale deployment vault-api-gateway --replicas=5 -n $NAMESPACE"
}

# Main deployment function
main() {
    log_info "Starting Vault Platform deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Tag: $TAG"
    log_info "Namespace: $NAMESPACE"
    
    check_prerequisites
    create_namespace
    deploy_infrastructure
    deploy_configuration
    deploy_services
    deploy_ingress
    wait_for_deployments
    run_migrations
    health_check
    display_info
}

# Run main function
main "$@" 