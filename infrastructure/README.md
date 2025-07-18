# Vault Platform Infrastructure

This directory contains the production infrastructure configuration for the Vault Modernization Platform, including Kubernetes manifests, Docker configurations, and deployment scripts.

## 🏗️ Architecture Overview

The production infrastructure is designed for high availability, scalability, and security:

```
┌─────────────────────────────────────────────────────────────┐
│                    Production Environment                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Frontend  │  │ API Gateway │  │   Ingress   │        │
│  │   (Nginx)   │  │   (Load     │  │  Controller │        │
│  │             │  │  Balancer)  │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                    Microservices Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Product     │ │ Marketplace │ │ Vendor      │          │
│  │ Intelligence│ │ Integration │ │ Integration │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Order       │ │ Pricing     │ │ Inventory   │          │
│  │ Processing  │ │ Engine      │ │ Management  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Analytics   │ │ Tenant      │ │ Notification│          │
│  │ Engine      │ │ Management  │ │ Service     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Performance │ │ Security    │ │ Accounting  │          │
│  │ Optimization│ │ Compliance  │ │ System      │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ PostgreSQL  │  │    Redis    │  │   Storage   │        │
│  │  Database   │  │   Cache     │  │   (PVC)     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
infrastructure/
├── kubernetes/                 # Kubernetes manifests
│   ├── namespace.yaml         # Namespace and resource quotas
│   ├── configmap.yaml         # Environment configuration
│   ├── secrets.yaml           # Sensitive data
│   ├── storage.yaml           # Persistent volume claims
│   ├── database.yaml          # PostgreSQL deployment
│   ├── redis.yaml             # Redis deployment
│   ├── api-gateway.yaml       # API Gateway deployment
│   ├── services.yaml          # Core services (1-3)
│   ├── services-2.yaml        # Core services (4-6)
│   ├── services-3.yaml        # Advanced services (7-9)
│   ├── services-4.yaml        # Advanced services (10-12)
│   ├── frontend.yaml          # React frontend deployment
│   ├── ingress.yaml           # Ingress configuration
│   └── deploy.sh              # Deployment script
├── docker/                    # Docker configurations
│   ├── Dockerfile.production  # Production Dockerfile
│   ├── Dockerfile.frontend    # Frontend Dockerfile
│   ├── nginx.conf             # Nginx main configuration
│   └── default.conf           # Nginx server configuration
├── monitoring/                # Monitoring setup (Week 14)
├── scripts/                   # Utility scripts
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Kubernetes Cluster**: EKS, GKE, AKS, or local (minikube/kind)
2. **kubectl**: Configured to access your cluster
3. **Docker**: For building images
4. **Container Registry**: For storing images

### Deployment Steps

1. **Build and Push Images**:
   ```bash
   # Build backend image
   docker build -f infrastructure/docker/Dockerfile.production -t your-registry.com/vault-modernization:latest .
   docker push your-registry.com/vault-modernization:latest
   
   # Build frontend image
   docker build -f infrastructure/docker/Dockerfile.frontend -t your-registry.com/vault-frontend:latest .
   docker push your-registry.com/vault-frontend:latest
   ```

2. **Update Configuration**:
   ```bash
   # Update registry in deployment script
   sed -i 's/your-registry.com/your-actual-registry.com/g' infrastructure/kubernetes/deploy.sh
   
   # Update secrets with real values
   # Edit infrastructure/kubernetes/secrets.yaml
   ```

3. **Deploy to Kubernetes**:
   ```bash
   cd infrastructure/kubernetes
   chmod +x deploy.sh
   ./deploy.sh
   ```

## 🔧 Configuration

### Environment Variables

Key configuration is managed through Kubernetes ConfigMaps and Secrets:

- **Database**: PostgreSQL connection string
- **Redis**: Cache and message queue configuration
- **JWT**: Authentication secrets
- **API Keys**: Marketplace and vendor integrations
- **SMTP**: Email service configuration

### Resource Allocation

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|---------|-------------|-----------|----------------|--------------|----------|
| API Gateway | 250m | 500m | 512Mi | 1Gi | 3 |
| Core Services | 125m | 250m | 256Mi | 512Mi | 2 |
| Order Processing | 250m | 500m | 512Mi | 1Gi | 3 |
| Analytics Engine | 250m | 500m | 512Mi | 1Gi | 2 |
| Performance Optimization | 250m | 500m | 512Mi | 1Gi | 2 |
| Security & Compliance | 250m | 500m | 512Mi | 1Gi | 2 |
| Frontend | 125m | 250m | 256Mi | 512Mi | 3 |
| PostgreSQL | 500m | 1000m | 1Gi | 2Gi | 1 |
| Redis | 250m | 500m | 512Mi | 1Gi | 1 |

## 🔒 Security Features

### Network Security
- **Ingress Controller**: NGINX with SSL termination
- **Rate Limiting**: Per-service and global limits
- **CORS**: Properly configured for frontend-backend communication
- **Security Headers**: XSS protection, content type validation

### Application Security
- **Non-root Containers**: All services run as non-root users
- **Secrets Management**: Kubernetes secrets for sensitive data
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation

### Data Security
- **Encryption at Rest**: Database and storage encryption
- **Encryption in Transit**: TLS 1.3 for all communications
- **Row-Level Security**: Database-level tenant isolation
- **Audit Logging**: Comprehensive audit trails

## 📊 Monitoring & Observability

### Health Checks
- **Liveness Probes**: Detect and restart failed containers
- **Readiness Probes**: Ensure services are ready to receive traffic
- **Startup Probes**: Handle slow-starting containers

### Metrics
- **Prometheus Endpoints**: `/metrics` on all services
- **Custom Metrics**: Business and application metrics
- **Resource Monitoring**: CPU, memory, and network usage

### Logging
- **Structured Logging**: JSON format for easy parsing
- **Centralized Logging**: ELK stack integration ready
- **Log Retention**: Configurable retention policies

## 🔄 Auto-scaling

### Horizontal Pod Autoscalers
- **API Gateway**: 3-10 replicas based on CPU/memory
- **Frontend**: 3-10 replicas based on CPU/memory
- **Core Services**: 2-5 replicas based on demand

### Scaling Triggers
- **CPU Utilization**: 70% average triggers scaling
- **Memory Utilization**: 80% average triggers scaling
- **Custom Metrics**: Business metrics for intelligent scaling

## 🛠️ Operations

### Common Commands

```bash
# View all resources
kubectl get all -n vault-platform

# View logs
kubectl logs -f deployment/vault-api-gateway -n vault-platform

# Scale services
kubectl scale deployment vault-api-gateway --replicas=5 -n vault-platform

# Port forward for debugging
kubectl port-forward svc/vault-api-gateway 3000:80 -n vault-platform

# Execute commands in pods
kubectl exec -it deployment/vault-api-gateway -n vault-platform -- /bin/sh

# View events
kubectl get events -n vault-platform --sort-by='.lastTimestamp'
```

### Troubleshooting

1. **Pod Issues**:
   ```bash
   kubectl describe pod <pod-name> -n vault-platform
   kubectl logs <pod-name> -n vault-platform
   ```

2. **Service Issues**:
   ```bash
   kubectl describe svc <service-name> -n vault-platform
   kubectl get endpoints <service-name> -n vault-platform
   ```

3. **Ingress Issues**:
   ```bash
   kubectl describe ingress vault-platform-ingress -n vault-platform
   kubectl get ingress -n vault-platform
   ```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build and push images
      run: |
        docker build -t $REGISTRY/vault-modernization:$GITHUB_SHA .
        docker push $REGISTRY/vault-modernization:$GITHUB_SHA
    
    - name: Deploy to Kubernetes
      run: |
        cd infrastructure/kubernetes
        TAG=$GITHUB_SHA ./deploy.sh
```

## 📈 Performance Optimization

### Caching Strategy
- **Redis**: Session storage and API response caching
- **CDN**: Static asset delivery
- **Browser Caching**: Optimized cache headers

### Database Optimization
- **Connection Pooling**: Optimized connection management
- **Query Optimization**: Indexed queries and efficient schemas
- **Read Replicas**: Scalable read operations

### Network Optimization
- **Load Balancing**: Intelligent traffic distribution
- **Compression**: Gzip compression for all responses
- **Keep-alive**: Persistent connections

## 🔮 Future Enhancements

### Planned Features (Week 14-16)
- **Service Mesh**: Istio for advanced traffic management
- **Advanced Monitoring**: Prometheus + Grafana setup
- **Security Hardening**: WAF, intrusion detection
- **Disaster Recovery**: Backup and restore procedures
- **Blue-Green Deployments**: Zero-downtime deployments

### Scalability Improvements
- **Multi-region**: Geographic distribution
- **Database Sharding**: Horizontal scaling
- **Microservice Splitting**: Further service decomposition
- **Event Streaming**: Kafka for event-driven architecture

## 📞 Support

For infrastructure issues:
1. Check the troubleshooting section above
2. Review Kubernetes events and logs
3. Verify configuration and secrets
4. Contact the DevOps team

## 📄 License

This infrastructure configuration is part of the Vault Modernization Platform and is proprietary software. All rights reserved. 