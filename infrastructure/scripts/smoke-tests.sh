#!/bin/bash

# Smoke Tests for Vault Modernization Platform
# Week 16: CI/CD & Integration Testing

set -e

# Configuration
ENVIRONMENT=${1:-staging}
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
    echo "Usage: $0 [staging|production|local]"
    exit 1
    ;;
esac

echo "🚀 Running smoke tests for $ENVIRONMENT environment"
echo "📍 Base URL: $BASE_URL"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "🧪 Running: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Helper function to check HTTP response
check_http() {
    local url="$1"
    local expected_status="${2:-200}"
    local method="${3:-GET}"
    local data="${4:-}"
    
    local curl_opts="-s -o /dev/null -w %{http_code}"
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        curl_opts="$curl_opts -X POST -H 'Content-Type: application/json' -d '$data'"
    fi
    
    local status=$(curl $curl_opts "$url")
    [ "$status" = "$expected_status" ]
}

# Helper function to check JSON response
check_json() {
    local url="$1"
    local jq_filter="$2"
    local expected_value="$3"
    
    local result=$(curl -s "$url" | jq -r "$jq_filter")
    [ "$result" = "$expected_value" ]
}

# 1. Health Check
run_test "Health Check" "check_http '$BASE_URL/health'"

# 2. API Gateway Status
run_test "API Gateway Status" "check_http '$BASE_URL/api/status'"

# 3. Database Connectivity
run_test "Database Connectivity" "check_http '$BASE_URL/api/health/db'"

# 4. Redis Connectivity
run_test "Redis Connectivity" "check_http '$BASE_URL/api/health/redis'"

# 5. Authentication Service
run_test "Authentication Service" "check_http '$BASE_URL/api/auth/status'"

# 6. Product Intelligence Service
run_test "Product Intelligence Service" "check_http '$BASE_URL/api/products/status'"

# 7. Marketplace Integration Service
run_test "Marketplace Integration Service" "check_http '$BASE_URL/api/marketplace/status'"

# 8. Vendor Integration Service
run_test "Vendor Integration Service" "check_http '$BASE_URL/api/vendor/status'"

# 9. Order Processing Service
run_test "Order Processing Service" "check_http '$BASE_URL/api/orders/status'"

# 10. Pricing Engine Service
run_test "Pricing Engine Service" "check_http '$BASE_URL/api/pricing/status'"

# 11. Inventory Management Service
run_test "Inventory Management Service" "check_http '$BASE_URL/api/inventory/status'"

# 12. Analytics Engine Service
run_test "Analytics Engine Service" "check_http '$BASE_URL/api/analytics/status'"

# 13. Notification Service
run_test "Notification Service" "check_http '$BASE_URL/api/notifications/status'"

# 14. Performance Optimization Service
run_test "Performance Optimization Service" "check_http '$BASE_URL/api/performance/status'"

# 15. Security Compliance Service
run_test "Security Compliance Service" "check_http '$BASE_URL/api/security/status'"

# 16. Frontend Accessibility
run_test "Frontend Accessibility" "check_http '$BASE_URL'"

# 17. Login Page Load
run_test "Login Page Load" "check_http '$BASE_URL/login'"

# 18. Dashboard Page Load (should redirect to login)
run_test "Dashboard Redirect" "check_http '$BASE_URL/dashboard' '302'"

# 19. API Documentation
run_test "API Documentation" "check_http '$BASE_URL/api/docs'"

# 20. Metrics Endpoint
run_test "Metrics Endpoint" "check_http '$BASE_URL/metrics'"

# 21. Kubernetes Pod Status (if kubectl available)
if command -v kubectl &> /dev/null && [ -n "$KUBECONFIG" ]; then
    export KUBECONFIG="$KUBECONFIG"
    run_test "Kubernetes Pod Status" "kubectl get pods -n vault-$ENVIRONMENT --no-headers | grep -v 'Running\|Completed' | wc -l | grep -q '^0$'"
fi

# 22. Service Discovery
run_test "Service Discovery" "check_http '$BASE_URL/api/services'"

# 23. Configuration Validation
run_test "Configuration Validation" "check_http '$BASE_URL/api/config/validate'"

# 24. Feature Flags
run_test "Feature Flags" "check_http '$BASE_URL/api/features'"

# 25. Rate Limiting (should return 429 after multiple requests)
run_test "Rate Limiting" "
    for i in {1..10}; do
        curl -s -o /dev/null -w %{http_code} '$BASE_URL/api/test' | grep -q '429' && break
    done
"

# 26. CORS Headers
run_test "CORS Headers" "
    curl -s -I '$BASE_URL/api/status' | grep -q 'Access-Control-Allow-Origin'
"

# 27. Security Headers
run_test "Security Headers" "
    curl -s -I '$BASE_URL' | grep -q 'X-Content-Type-Options: nosniff'
"

# 28. SSL/TLS (for production/staging)
if [ "$ENVIRONMENT" != "local" ]; then
    run_test "SSL/TLS Certificate" "
        echo | openssl s_client -servername $(echo $BASE_URL | sed 's|https://||') -connect $(echo $BASE_URL | sed 's|https://||'):443 2>/dev/null | openssl x509 -noout -dates | grep -q 'notAfter'
    "
fi

# 29. Database Migration Status
run_test "Database Migration Status" "check_http '$BASE_URL/api/health/migrations'"

# 30. Backup Status
run_test "Backup Status" "check_http '$BASE_URL/api/health/backup'"

echo ""
echo "📊 Smoke Test Results:"
echo "======================"
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"
echo ""

# Calculate success rate
TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))
    echo "📈 Success Rate: $SUCCESS_RATE%"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "${GREEN}🎉 Smoke tests passed! Deployment is healthy.${NC}"
        exit 0
    elif [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "${YELLOW}⚠️  Smoke tests mostly passed. Some issues detected.${NC}"
        exit 1
    else
        echo -e "${RED}🚨 Smoke tests failed! Deployment has issues.${NC}"
        exit 1
    fi
else
    echo -e "${RED}🚨 No tests were executed!${NC}"
    exit 1
fi 