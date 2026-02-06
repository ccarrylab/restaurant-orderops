# Chaos Edge DevOps - Terraform Infrastructure

Production-ready EKS infrastructure with chaos engineering capabilities.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    VPC (10.0.0.0/16)                    │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │   │
│  │  │  Public     │    │  Private    │    │   Private   │ │   │
│  │  │  Subnet 1   │    │  Subnet 1   │    │  Subnet 2   │ │   │
│  │  │  (ALB)      │    │  (EKS Pods) │    │  (EKS Pods) │ │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘ │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              EKS Cluster (1.30)                 │   │   │
│  │  │  ┌─────────────┐    ┌─────────────────────┐    │   │   │
│  │  │  │ General     │    │ Chaos               │    │   │   │
│  │  │  │ Node Group  │    │ Node Group (Spot)   │    │   │   │
│  │  │  │ (t3.medium) │    │ (t3.medium)         │    │   │   │
│  │  │  └─────────────┘    └─────────────────────┘    │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │     ALB     │    │     ECR     │    │ CloudWatch  │       │
│  │             │    │  (Images)   │    │  (Logs)     │       │
│  └─────────────┘    └─────────────┘    └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Initialize Terraform
make init

# Review the plan
make plan

# Deploy infrastructure
make apply

# Configure kubectl
make kubectl

# Verify deployment
kubectl get nodes
kubectl get pods -n chaos-edge
kubectl get pods -n monitoring
kubectl get pods -n chaos-mesh
```

## 📋 Components

| Component | Purpose | Namespace |
|-----------|---------|-----------|
| **NGINX Ingress** | Ingress controller | chaos-edge |
| **Prometheus** | Metrics collection | monitoring |
| **Grafana** | Visualization | monitoring |
| **Chaos Mesh** | Chaos engineering | chaos-mesh |
| **Sample App** | Demo application | chaos-edge |

## 🔑 Accessing Services

### Grafana

```bash
make grafana
# URL: http://localhost:3000
# Username: admin
# Password: chaosedge2026
```

### Prometheus

```bash
make prometheus
# URL: http://localhost:9090
```

### Chaos Mesh Dashboard

```bash
kubectl port-forward -n chaos-mesh svc/chaos-mesh-dashboard 2333:2333
# URL: http://localhost:2333
```

### Application

```bash
# Get ALB DNS
kubectl get ingress -n chaos-edge
# Or
terraform output alb_dns_name
```

## 🧪 Chaos Experiments

### Available Experiments

1. **Pod Failure** - Randomly delete pods
2. **Network Latency** - Inject network delays
3. **CPU Stress** - Overload CPU
4. **Memory Stress** - Consume memory
5. **IO Stress** - Disk I/O stress

### Running Experiments

```bash
# Access Chaos Mesh Dashboard
kubectl port-forward -n chaos-mesh svc/chaos-mesh-dashboard 2333:2333

# Or use kubectl
kubectl apply -f - <<EOF
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure-example
  namespace: chaos-edge
spec:
  action: pod-failure
  mode: one
  selector:
    labelSelectors:
      app: chaos-edge-app
  duration: "5m"
EOF
```

## 📊 Monitoring

### CloudWatch Dashboard

```bash
terraform output cloudwatch_dashboard
```

### Key Metrics

| Metric | Description |
|--------|-------------|
| `eks_cluster_failed_node_count` | Failed EKS nodes |
| `ALB RequestCount` | Total requests |
| `ALB TargetResponseTime` | Response latency |
| `container_cpu_utilization` | Pod CPU usage |
| `container_memory_utilization` | Pod memory usage |

## 🔧 Configuration

### terraform.tfvars Example

```hcl
aws_region          = "us-east-1"
environment         = "dev"
vpc_cidr            = "10.0.0.0/16"
kubernetes_version  = "1.30"

node_instance_types = ["t3.medium"]
node_min_size       = 2
node_max_size       = 5
node_desired_size   = 2

alert_emails        = ["admin@example.com"]
enable_chaos_mesh   = true
enable_prometheus   = true
```

## 💰 Cost Optimization

- **Spot instances** for chaos workloads
- **Single NAT Gateway** in dev
- **HPA** for auto-scaling
- **PDB** for availability

## 🔐 Security

- **Private subnets** for workloads
- **Security groups** with minimal rules
- **IRSA** for pod IAM roles
- **Network policies** (via Calico)

## 🗑️ Cleanup

```bash
make destroy
```

## 📚 References

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Chaos Mesh Documentation](https://chaos-mesh.org/)
- [Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator)
