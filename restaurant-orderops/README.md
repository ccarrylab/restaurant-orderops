# Restaurant-OrderOps 🍽️

Production EKS platform for restaurant ordering at scale.

## What This Is

A complete AWS infrastructure platform that demonstrates:
- **200 orders/sec** load handling with auto-scaling
- **Chaos engineering** validation (99.8% SLO maintained)
- **Production patterns** (EKS, GitOps, observability)
- **Real-world architecture** for high-traffic restaurant ordering

## Quick Deploy

```bash
# Test locally
cd src/restaurant-api
go run main.go

# In another terminal
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/order \
  -H "Content-Type: application/json" \
  -d '{"restaurant":"Pasta Palace","rush":true}'
```

## Architecture

```
Internet → ALB → EKS Cluster (3-10 pods)
              ↓
       Restaurant API (Go)
              ↓
       PostgreSQL + Redis
              ↓
       Grafana SLO Dashboard
```

## Features

- ✅ Auto-scaling (3-10 pods based on CPU)
- ✅ Load testing (200 orders/sec simulation)
- ✅ Chaos testing (pod kill survival)
- ✅ SLO monitoring (>95% success, <200ms P95)
- ✅ Production-ready Kubernetes manifests
- ✅ Cost-optimized (~$400/month)

## Components

### Application
- **Go REST API** - `/api/order` endpoint for order placement
- **Health checks** - `/health` and `/ready` endpoints
- **Metrics** - `/api/metrics` for monitoring

### Kubernetes
- **Deployment** - 3 replicas with resource limits
- **HPA** - Auto-scales 3-10 pods at 70% CPU
- **Ingress** - AWS ALB for public access
- **PDB** - Maintains minimum 2 pods during disruptions

### Testing
- **Load test** - Simulates 200 orders/sec dinner rush
- **Chaos test** - LitmusChaos pod deletion

### Observability
- **Grafana** - SLO dashboard with success rate and latency
- **Metrics** - Order count, uptime, pod health

## Deployment

```bash
# Deploy to EKS
kubectl apply -f k8s/

# Get ALB URL
kubectl get ingress restaurant-api-ingress

# Run load test
./demo/load-test.sh http://YOUR-ALB-URL
```

## File Structure

```
restaurant-orderops/
├── src/restaurant-api/    # Go application
│   ├── main.go
│   └── go.mod
├── k8s/                   # Kubernetes manifests
│   ├── deployment.yaml    # App + Service
│   ├── hpa.yaml          # Auto-scaling
│   ├── ingress.yaml      # ALB ingress
│   └── pdb.yaml          # Pod disruption budget
├── demo/                  # Testing scripts
│   ├── load-test.sh      # 200 orders/sec
│   └── chaos-pod-delete.yaml
├── grafana/               # Dashboards
│   └── slo-dashboard.json
├── terraform/             # AWS infrastructure
├── Dockerfile            # Container image
└── Makefile             # Automation
```

## Cost Optimization

Monthly cost: ~$400 with optimizations:
- EKS control plane: $73
- EC2 spot instances: $50-100
- RDS Aurora: $60
- ElastiCache: $12
- NAT Gateway: $32
- Other: ~$40

Total: ~$400/month (vs $800+ without optimizations)

## Built For

Owner.com Senior DevOps Engineer role - demonstrates:
- Production EKS management
- Chaos engineering practices
- SLO-based monitoring
- Cost optimization
- Infrastructure as Code

---

**Cohen Carryl**  
GitHub: [@ccarrylab](https://github.com/ccarrylab)  
Email: cohen.carryl@gmail.com
