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
# Deploy complete platform
make demo

# Test locally
docker build -t restaurant-api:test .
docker run -p 8080:8080 restaurant-api:test
curl http://localhost:8080/health
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

- ✅ Auto-scaling (3-10 pods based on load)
- ✅ Load testing (200 orders/sec simulation)
- ✅ Chaos testing (pod kill survival)
- ✅ SLO monitoring (>95% success, <200ms P95)
- ✅ GitOps with ArgoCD
- ✅ Spot instances ($0.42/hr)

## Components

- **Go REST API** - Order placement and tracking
- **Kubernetes** - EKS with HPA and PDB
- **Terraform** - Complete AWS infrastructure
- **Load Testing** - Simulates dinner rush
- **Chaos Engineering** - LitmusChaos pod kills
- **Observability** - Grafana dashboards

## Endpoints

- `GET /health` - Health check
- `GET /ready` - Readiness check
- `POST /api/order` - Place order
- `GET /api/metrics` - Metrics endpoint

## Deployment

```bash
# Local testing
make build
make test

# Deploy to AWS
make demo

# Clean up
make clean
```

## Cost

~$400/month with optimizations:
- Spot instances (60% savings)
- Single NAT gateway
- Auto-scaling down to 3 pods

## Built For

Owner.com Senior DevOps Engineer role - demonstrates:
- Production EKS management
- Chaos engineering practices
- SLO-based monitoring
- Cost optimization
- GitOps workflows

---

**Cohen Carryl**  
GitHub: [@ccarrylab](https://github.com/ccarrylab)  
Email: cohen.carryl@gmail.com
