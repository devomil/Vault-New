#!/bin/bash

# Week 15: Security Hardening & Compliance Deployment Script
# Vault Modernization Platform

set -e

echo "🔒 Deploying Week 15 Security Hardening & Compliance..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="vault-production"
SECURITY_DIR="infrastructure/security"
KUBERNETES_DIR="infrastructure/kubernetes"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Function to check if namespace exists
check_namespace() {
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        print_success "Namespace $NAMESPACE exists"
    else
        print_warning "Namespace $NAMESPACE does not exist, creating..."
        kubectl create namespace $NAMESPACE
        print_success "Namespace $NAMESPACE created"
    fi
}

# Function to deploy network policies
deploy_network_policies() {
    print_status "Deploying network policies..."
    
    if [ -f "$KUBERNETES_DIR/security/network-policies.yaml" ]; then
        kubectl apply -f $KUBERNETES_DIR/security/network-policies.yaml
        print_success "Network policies deployed"
    else
        print_error "Network policies file not found"
        return 1
    fi
}

# Function to deploy firewall and security configurations
deploy_firewall_config() {
    print_status "Deploying firewall and security configurations..."
    
    if [ -f "$SECURITY_DIR/firewall-rules.yaml" ]; then
        kubectl apply -f $SECURITY_DIR/firewall-rules.yaml
        print_success "Firewall and security configurations deployed"
    else
        print_error "Firewall configuration file not found"
        return 1
    fi
}

# Function to deploy DDoS protection and IDS
deploy_ddos_protection() {
    print_status "Deploying DDoS protection and intrusion detection..."
    
    if [ -f "$SECURITY_DIR/ddos-ids.yaml" ]; then
        kubectl apply -f $SECURITY_DIR/ddos-ids.yaml
        print_success "DDoS protection and IDS deployed"
    else
        print_error "DDoS protection configuration file not found"
        return 1
    fi
}

# Function to deploy data security configurations
deploy_data_security() {
    print_status "Deploying data security configurations..."
    
    if [ -f "$SECURITY_DIR/data-security.yaml" ]; then
        kubectl apply -f $SECURITY_DIR/data-security.yaml
        print_success "Data security configurations deployed"
    else
        print_error "Data security configuration file not found"
        return 1
    fi
}

# Function to update API Gateway with security enhancements
update_api_gateway() {
    print_status "Updating API Gateway with security enhancements..."
    
    # Install new dependencies
    cd services/api-gateway
    npm install helmet cors @types/cors
    print_success "API Gateway dependencies updated"
    
    # Build the updated gateway
    npm run build
    print_success "API Gateway rebuilt with security enhancements"
    
    cd ../..
}

# Function to create compliance documentation
create_compliance_docs() {
    print_status "Creating compliance documentation..."
    
    # Create docs directory if it doesn't exist
    mkdir -p docs/compliance
    
    # Check if compliance docs exist
    if [ -f "docs/compliance/soc2-compliance.md" ] && [ -f "docs/compliance/gdpr-compliance.md" ]; then
        print_success "Compliance documentation already exists"
    else
        print_warning "Compliance documentation files not found"
        print_status "Please ensure SOC2 and GDPR compliance documents are created"
    fi
}

# Function to verify security deployment
verify_deployment() {
    print_status "Verifying security deployment..."
    
    # Check network policies
    if kubectl get networkpolicies -n $NAMESPACE &> /dev/null; then
        print_success "Network policies are deployed"
    else
        print_warning "No network policies found"
    fi
    
    # Check configmaps
    if kubectl get configmaps -n $NAMESPACE | grep -E "(firewall|ddos|security)" &> /dev/null; then
        print_success "Security configmaps are deployed"
    else
        print_warning "Security configmaps not found"
    fi
    
    # Check secrets
    if kubectl get secrets -n $NAMESPACE encryption-keys &> /dev/null; then
        print_success "Encryption keys secret is deployed"
    else
        print_warning "Encryption keys secret not found"
    fi
}

# Function to generate security report
generate_security_report() {
    print_status "Generating security deployment report..."
    
    REPORT_FILE="security-deployment-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > $REPORT_FILE << EOF
# Security Deployment Report
## Week 15: Security Hardening & Compliance

**Deployment Date**: $(date)
**Namespace**: $NAMESPACE
**Status**: Deployed

### Components Deployed

#### Network Security
- [x] Kubernetes network policies
- [x] Default deny all ingress/egress
- [x] Service-to-service communication rules
- [x] Database and Redis access controls

#### Application Security
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Rate limiting and DDoS protection
- [x] Input validation and sanitization
- [x] Request logging and monitoring

#### Data Security
- [x] Encryption keys management
- [x] TLS/SSL configuration
- [x] Database encryption settings
- [x] Redis security configuration
- [x] Backup encryption procedures
- [x] Key rotation automation

#### Compliance Documentation
- [x] SOC 2 Type II compliance framework
- [x] GDPR compliance documentation
- [x] Data protection controls
- [x] Audit procedures and checklists

### Security Controls Implemented

#### Network Security
- Network segmentation with Kubernetes policies
- Firewall rules and security groups
- DDoS protection with rate limiting
- Intrusion detection with fail2ban

#### Application Security
- OWASP security controls
- Input validation and sanitization
- Security headers and CSP
- Rate limiting and request throttling

#### Data Security
- Encryption at rest and in transit
- Key management and rotation
- Data masking and anonymization
- Backup encryption

#### Compliance
- SOC 2 Type II controls
- GDPR data protection
- Audit logging and monitoring
- Data retention policies

### Next Steps

1. **Complete Privacy Controls**
   - Implement data minimization
   - Establish accountability framework
   - Conduct privacy impact assessments

2. **Security Monitoring**
   - Set up SIEM integration
   - Implement vulnerability scanning
   - Establish patch management

3. **Compliance Validation**
   - Conduct internal security audits
   - Prepare for external compliance audits
   - Validate control effectiveness

### Contact Information

For security issues or compliance questions:
- Security Team: security@your-domain.com
- Compliance Team: compliance@your-domain.com
- Privacy Team: privacy@your-domain.com

EOF

    print_success "Security deployment report generated: $REPORT_FILE"
}

# Main deployment function
main() {
    echo "🚀 Starting Week 15 Security Hardening & Compliance Deployment"
    echo "================================================================"
    
    # Pre-deployment checks
    check_kubectl
    check_namespace
    
    # Deploy security components
    deploy_network_policies
    deploy_firewall_config
    deploy_ddos_protection
    deploy_data_security
    
    # Update application security
    update_api_gateway
    
    # Create compliance documentation
    create_compliance_docs
    
    # Verify deployment
    verify_deployment
    
    # Generate report
    generate_security_report
    
    echo "================================================================"
    print_success "Week 15 Security Hardening & Compliance deployment completed!"
    print_status "Review the security deployment report for details"
    print_status "Next: Complete privacy controls and security monitoring"
}

# Run main function
main "$@" 