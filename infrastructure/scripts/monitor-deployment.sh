#!/bin/bash

# Deployment Monitoring Script
# Week 16: CI/CD & Integration Testing

set -e

# Configuration
ENVIRONMENT=${1:-production}
DURATION=${2:-3600}  # Monitor for 1 hour by default
INTERVAL=${3:-30}    # Check every 30 seconds
BASE_URL=""
KUBECONFIG=""

# Set environment-specific configuration
case $ENVIRONMENT in
  "staging")
    BASE_URL="https://staging.vault-modernization.com"
    KUBECONFIG="$HOME/.kube/config-staging"
    ;;
  "production")
    BASE_URL="https://vault-modernization.com"
    KUBECONFIG="$HOME/.kube/config-production"
    ;;
  "local")
    BASE_URL="http://localhost:3000"
    KUBECONFIG=""
    ;;
  *)
    echo "Usage: $0 [staging|production|local] [duration_seconds] [interval_seconds]"
    exit 1
    ;;
esac

echo "🔍 Starting deployment monitoring for $ENVIRONMENT"
echo "📍 Base URL: $BASE_URL"
echo "⏱️  Duration: $DURATION seconds"
echo "🔄 Interval: $INTERVAL seconds"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Monitoring data
declare -A metrics
declare -A errors
declare -A response_times
start_time=$(date +%s)
check_count=0

# Helper function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Helper function to check HTTP endpoint
check_endpoint() {
    local endpoint="$1"
    local name="$2"
    local start=$(date +%s%3N)
    
    local response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}" "$endpoint" 2>/dev/null || echo "000|0")
    local end=$(date +%s%3N)
    
    local status_code=$(echo "$response" | cut -d'|' -f1)
    local response_time=$(echo "$response" | cut -d'|' -f2)
    local total_time=$((end - start))
    
    # Store metrics
    metrics["$name"]=$status_code
    response_times["$name"]=$response_time
    
    if [ "$status_code" != "200" ]; then
        errors["$name"]=$status_code
        echo -e "${RED}❌ $name: HTTP $status_code (${response_time}s)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $name: HTTP $status_code (${response_time}s)${NC}"
        return 0
    fi
}

# Helper function to check Kubernetes resources
check_k8s() {
    if ! command -v kubectl &> /dev/null || [ -z "$KUBECONFIG" ]; then
        return 0
    fi
    
    export KUBECONFIG="$KUBECONFIG"
    local namespace="vault-$ENVIRONMENT"
    
    # Check pod status
    local pods=$(kubectl get pods -n "$namespace" --no-headers 2>/dev/null || echo "")
    local total_pods=0
    local running_pods=0
    
    while IFS= read -r pod; do
        if [ -n "$pod" ]; then
            ((total_pods++))
            if echo "$pod" | grep -q "Running\|Completed"; then
                ((running_pods++))
            fi
        fi
    done <<< "$pods"
    
    if [ $total_pods -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No pods found in namespace $namespace${NC}"
        return 1
    elif [ $running_pods -eq $total_pods ]; then
        echo -e "${GREEN}✅ Kubernetes: $running_pods/$total_pods pods running${NC}"
        return 0
    else
        echo -e "${RED}❌ Kubernetes: $running_pods/$total_pods pods running${NC}"
        return 1
    fi
}

# Helper function to check system resources
check_resources() {
    if ! command -v kubectl &> /dev/null || [ -z "$KUBECONFIG" ]; then
        return 0
    fi
    
    export KUBECONFIG="$KUBECONFIG"
    local namespace="vault-$ENVIRONMENT"
    
    # Check CPU and memory usage
    local resources=$(kubectl top pods -n "$namespace" --no-headers 2>/dev/null || echo "")
    
    if [ -n "$resources" ]; then
        echo -e "${BLUE}📊 Resource Usage:${NC}"
        echo "$resources" | while IFS= read -r line; do
            if [ -n "$line" ]; then
                echo "   $line"
            fi
        done
    fi
}

# Helper function to check logs for errors
check_logs() {
    if ! command -v kubectl &> /dev/null || [ -z "$KUBECONFIG" ]; then
        return 0
    fi
    
    export KUBECONFIG="$KUBECONFIG"
    local namespace="vault-$ENVIRONMENT"
    
    # Check for recent errors in logs
    local error_count=$(kubectl logs -n "$namespace" --since=5m --all-containers 2>/dev/null | grep -i "error\|exception\|fatal" | wc -l)
    
    if [ $error_count -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $error_count errors in recent logs${NC}"
    else
        echo -e "${GREEN}✅ No recent errors in logs${NC}"
    fi
}

# Helper function to generate summary
generate_summary() {
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo "📊 Monitoring Summary"
    echo "===================="
    echo "Environment: $ENVIRONMENT"
    echo "Duration: $duration seconds"
    echo "Checks performed: $check_count"
    echo ""
    
    # Calculate success rates
    local total_checks=0
    local successful_checks=0
    
    for endpoint in "${!metrics[@]}"; do
        ((total_checks++))
        if [ "${metrics[$endpoint]}" = "200" ]; then
            ((successful_checks++))
        fi
    done
    
    if [ $total_checks -gt 0 ]; then
        local success_rate=$((successful_checks * 100 / total_checks))
        echo "Success Rate: $success_rate% ($successful_checks/$total_checks)"
    fi
    
    # Average response times
    local total_time=0
    local time_count=0
    
    for endpoint in "${!response_times[@]}"; do
        total_time=$(echo "$total_time + ${response_times[$endpoint]}" | bc -l 2>/dev/null || echo "$total_time")
        ((time_count++))
    done
    
    if [ $time_count -gt 0 ]; then
        local avg_time=$(echo "scale=3; $total_time / $time_count" | bc -l 2>/dev/null || echo "0")
        echo "Average Response Time: ${avg_time}s"
    fi
    
    # Error summary
    if [ ${#errors[@]} -gt 0 ]; then
        echo ""
        echo "❌ Errors Found:"
        for endpoint in "${!errors[@]}"; do
            echo "  - $endpoint: HTTP ${errors[$endpoint]}"
        done
    fi
}

# Main monitoring loop
log "Starting monitoring loop..."
trap 'generate_summary; exit 0' INT TERM

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    if [ $elapsed -ge $DURATION ]; then
        log "Monitoring duration completed"
        break
    fi
    
    ((check_count++))
    log "Check #$check_count (${elapsed}s elapsed)"
    
    # Health checks
    check_endpoint "$BASE_URL/health" "Health Check"
    check_endpoint "$BASE_URL/api/status" "API Gateway"
    check_endpoint "$BASE_URL/api/health/db" "Database"
    check_endpoint "$BASE_URL/api/health/redis" "Redis"
    
    # Service checks
    check_endpoint "$BASE_URL/api/auth/status" "Auth Service"
    check_endpoint "$BASE_URL/api/products/status" "Product Service"
    check_endpoint "$BASE_URL/api/orders/status" "Order Service"
    check_endpoint "$BASE_URL/api/pricing/status" "Pricing Service"
    check_endpoint "$BASE_URL/api/inventory/status" "Inventory Service"
    check_endpoint "$BASE_URL/api/analytics/status" "Analytics Service"
    check_endpoint "$BASE_URL/api/notifications/status" "Notification Service"
    check_endpoint "$BASE_URL/api/performance/status" "Performance Service"
    check_endpoint "$BASE_URL/api/security/status" "Security Service"
    
    # Frontend checks
    check_endpoint "$BASE_URL" "Frontend"
    check_endpoint "$BASE_URL/login" "Login Page"
    
    # Kubernetes checks
    check_k8s
    
    # Resource monitoring (every 5 minutes)
    if [ $((check_count % 10)) -eq 0 ]; then
        check_resources
        check_logs
    fi
    
    echo ""
    
    # Wait for next check
    sleep $INTERVAL
done

# Generate final summary
generate_summary 