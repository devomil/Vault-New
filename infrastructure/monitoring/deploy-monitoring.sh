#!/bin/bash

# Vault Platform Monitoring Stack Deployment Script
# This script deploys the complete monitoring and alerting infrastructure

set -e

# Configuration
NAMESPACE="vault-platform"
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
    log_info "Checking monitoring prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE does not exist. Deploy the main platform first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Deploy logging infrastructure
deploy_logging() {
    log_info "Deploying logging infrastructure..."
    
    # Deploy Elasticsearch
    kubectl apply -f elasticsearch.yaml
    log_success "Elasticsearch deployed"
    
    # Wait for Elasticsearch to be ready
    log_info "Waiting for Elasticsearch to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n $NAMESPACE --timeout=600s
    log_success "Elasticsearch is ready"
    
    # Deploy Kibana
    kubectl apply -f kibana.yaml
    log_success "Kibana deployed"
    
    # Wait for Kibana to be ready
    log_info "Waiting for Kibana to be ready..."
    kubectl wait --for=condition=ready pod -l app=kibana -n $NAMESPACE --timeout=300s
    log_success "Kibana is ready"
    
    # Deploy Fluentd
    kubectl apply -f fluentd.yaml
    log_success "Fluentd deployed"
    
    # Wait for Fluentd to be ready
    log_info "Waiting for Fluentd to be ready..."
    kubectl wait --for=condition=ready pod -l app=fluentd -n $NAMESPACE --timeout=300s
    log_success "Fluentd is ready"
}

# Deploy monitoring infrastructure
deploy_monitoring() {
    log_info "Deploying monitoring infrastructure..."
    
    # Deploy Prometheus
    kubectl apply -f prometheus-config.yaml
    kubectl apply -f prometheus-rules.yaml
    kubectl apply -f prometheus.yaml
    log_success "Prometheus deployed"
    
    # Wait for Prometheus to be ready
    log_info "Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n $NAMESPACE --timeout=300s
    log_success "Prometheus is ready"
    
    # Deploy AlertManager
    kubectl apply -f alertmanager.yaml
    log_success "AlertManager deployed"
    
    # Wait for AlertManager to be ready
    log_info "Waiting for AlertManager to be ready..."
    kubectl wait --for=condition=ready pod -l app=alertmanager -n $NAMESPACE --timeout=300s
    log_success "AlertManager is ready"
    
    # Deploy Grafana
    kubectl apply -f grafana.yaml
    log_success "Grafana deployed"
    
    # Wait for Grafana to be ready
    log_info "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=ready pod -l app=grafana -n $NAMESPACE --timeout=300s
    log_success "Grafana is ready"
}

# Deploy ingress
deploy_ingress() {
    log_info "Deploying monitoring ingress..."
    
    kubectl apply -f monitoring-ingress.yaml
    log_success "Monitoring ingress deployed"
}

# Configure monitoring
configure_monitoring() {
    log_info "Configuring monitoring..."
    
    # Update Prometheus configuration to include AlertManager
    kubectl patch configmap prometheus-config -n $NAMESPACE --patch '{
        "data": {
            "prometheus.yml": "'"$(cat prometheus-config.yaml | grep -A 50 'prometheus.yml: |' | sed '1d' | sed 's/^    //')"'\n  alerting:\n    alertmanagers:\n    - static_configs:\n      - targets:\n        - alertmanager:9093\n"
        }
    }'
    
    # Restart Prometheus to pick up new configuration
    kubectl rollout restart deployment prometheus -n $NAMESPACE
    log_success "Monitoring configuration updated"
}

# Health check
health_check() {
    log_info "Performing monitoring health checks..."
    
    # Check if all monitoring pods are running
    failed_pods=$(kubectl get pods -n $NAMESPACE -l component=monitoring --field-selector=status.phase!=Running --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        log_error "Some monitoring pods are not running"
        kubectl get pods -n $NAMESPACE -l component=monitoring
        exit 1
    fi
    
    # Check if all logging pods are running
    failed_pods=$(kubectl get pods -n $NAMESPACE -l component=logging --field-selector=status.phase!=Running --no-headers | wc -l)
    if [ "$failed_pods" -gt 0 ]; then
        log_error "Some logging pods are not running"
        kubectl get pods -n $NAMESPACE -l component=logging
        exit 1
    fi
    
    log_success "Health checks passed"
}

# Display monitoring information
display_info() {
    log_success "Monitoring stack deployment completed successfully!"
    echo
    echo "Monitoring Stack Information:"
    echo "============================="
    echo "Environment: $ENVIRONMENT"
    echo "Namespace: $NAMESPACE"
    echo
    echo "Monitoring Tools:"
    echo "================="
    echo "Grafana: https://grafana.vault-platform.com"
    echo "Kibana: https://kibana.vault-platform.com"
    echo "Prometheus: https://prometheus.vault-platform.com"
    echo "AlertManager: https://alertmanager.vault-platform.com"
    echo
    echo "Default Credentials:"
    echo "==================="
    echo "Grafana: admin / grafana-password"
    echo "Kibana: No authentication (configure as needed)"
    echo
    echo "Services:"
    echo "========="
    kubectl get svc -n $NAMESPACE -l component=monitoring
    kubectl get svc -n $NAMESPACE -l component=logging
    echo
    echo "Pods:"
    echo "====="
    kubectl get pods -n $NAMESPACE -l component=monitoring
    kubectl get pods -n $NAMESPACE -l component=logging
    echo
    echo "To view logs:"
    echo "============="
    echo "kubectl logs -f deployment/grafana -n $NAMESPACE"
    echo "kubectl logs -f deployment/prometheus -n $NAMESPACE"
    echo "kubectl logs -f deployment/alertmanager -n $NAMESPACE"
    echo
    echo "To access monitoring tools:"
    echo "==========================="
    echo "kubectl port-forward svc/grafana 3000:3000 -n $NAMESPACE"
    echo "kubectl port-forward svc/kibana 5601:5601 -n $NAMESPACE"
    echo "kubectl port-forward svc/prometheus 9090:9090 -n $NAMESPACE"
    echo "kubectl port-forward svc/alertmanager 9093:9093 -n $NAMESPACE"
    echo
    echo "Next Steps:"
    echo "==========="
    echo "1. Configure Slack/PagerDuty webhooks in AlertManager"
    echo "2. Set up custom dashboards in Grafana"
    echo "3. Configure log retention policies in Elasticsearch"
    echo "4. Set up monitoring alerts for your team"
}

# Main deployment function
main() {
    log_info "Starting Vault Platform monitoring stack deployment..."
    log_info "Environment: $ENVIRONMENT"
    log_info "Namespace: $NAMESPACE"
    
    check_prerequisites
    deploy_logging
    deploy_monitoring
    deploy_ingress
    configure_monitoring
    health_check
    display_info
}

# Run main function
main "$@" 