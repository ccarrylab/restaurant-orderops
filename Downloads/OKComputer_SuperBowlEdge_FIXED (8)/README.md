# 🚀 Chaos Edge Projects - Terraform Infrastructure

This repository contains production-ready Terraform configurations to deploy both **Chaos Edge DevOps** and **SuperBowlEdge Chaos** projects on AWS.

## 📁 Project Structure

```
.
├── chaos-edge-terraform/          # EKS-based infrastructure
│   ├── main.tf                    # VPC, EKS, ALB, ECR
│   ├── kubernetes.tf              # K8s resources, Helm charts
│   ├── variables.tf               # Configuration variables
│   ├── outputs.tf                 # Output values
│   ├── Makefile                   # Deployment commands
│   └── README.md
│
├── superbowl-edge-terraform/      # CloudFront/ALB edge infrastructure
│   ├── main.tf                    # VPC, ALB, HAProxy ASG
│   ├── cloudfront.tf              # CloudFront distribution
│   ├── waf.tf                     # AWS WAF rules
│   ├── fis.tf                     # Fault Injection Simulator
│   ├── monitoring.tf              # CloudWatch dashboards
│   ├── variables.tf               # Configuration variables
│   ├── outputs.tf                 # Output values
│   ├── haproxy-userdata.sh        # HAProxy setup script
│   ├── Makefile                   # Deployment commands
│   └── README.md
│
├── deploy-all.sh                  # Unified deployment script
└── README.md                      # This file
```

## 🏗️ Infrastructure Overview

### Chaos Edge DevOps (EKS)

| Component | Description |
|-----------|-------------|
| **EKS Cluster** | Kubernetes 1.30 with managed node groups |
| **VPC** | Multi-AZ with public/private subnets |
| **ALB** | Application Load Balancer with health checks |
| **ECR** | Container registry with image scanning |
| **Monitoring** | Prometheus, Grafana, CloudWatch |
| **Chaos Mesh** | Kubernetes-native chaos engineering |

### SuperBowlEdge Chaos (Edge CDN)

| Component | Description |
|-----------|-------------|
| **CloudFront** | Global CDN with 450+ edge locations |
| **ALB** | Application Load Balancer |
| **HAProxy** | Origin servers with auto-scaling |
| **AWS WAF** | Web application firewall |
| **AWS FIS** | Fault Injection Simulator for chaos testing |
| **CloudWatch** | Monitoring, SLO tracking, dashboards |

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with appropriate credentials
- Terraform >= 1.5.0
- kubectl (for EKS management)
- Make

### Deploy Both Projects

```bash
# Deploy everything
./deploy-all.sh

# Deploy with specific environment
./deploy-all.sh --env prod --region us-west-2

# Deploy only Chaos Edge
./deploy-all.sh --chaos-only

# Deploy only SuperBowlEdge
./deploy-all.sh --superbowl-only

# Deploy with dashboards
./deploy-all.sh --with-dashboards
```

### Deploy Individually

#### Chaos Edge DevOps

```bash
cd chaos-edge-terraform

# Initialize and deploy
make init
make plan
make apply

# Configure kubectl
make kubectl

# View dashboard
make dashboard

# Access Grafana
make grafana
```

#### SuperBowlEdge Chaos

```bash
cd superbowl-edge-terraform

# Initialize and deploy
make init
make plan
make apply

# View infrastructure info
make info

# Run demo commands
make demo

# Run chaos experiments
make chaos-test
make chaos-ec2-stop
make chaos-latency
make chaos-blackout

# View CloudWatch dashboard
make dashboard
```

## 📊 Available Make Commands

### Chaos Edge DevOps

| Command | Description |
|---------|-------------|
| `make init` | Initialize Terraform |
| `make plan` | Show execution plan |
| `make apply` | Deploy infrastructure |
| `make destroy` | Destroy infrastructure |
| `make kubectl` | Configure kubectl |
| `make dashboard` | Open Chaos Edge Dashboard |
| `make grafana` | Port-forward Grafana |
| `make prometheus` | Port-forward Prometheus |
| `make chaos-demo` | Run chaos demo |

### SuperBowlEdge Chaos

| Command | Description |
|---------|-------------|
| `make init` | Initialize Terraform |
| `make plan` | Show execution plan |
| `make apply` | Deploy infrastructure |
| `make destroy` | Destroy infrastructure |
| `make info` | Show infrastructure info |
| `make demo` | Run demo commands |
| `make chaos-test` | List chaos experiments |
| `make chaos-ec2-stop` | Run EC2 stop experiment |
| `make chaos-latency` | Run latency experiment |
| `make chaos-blackout` | Run ALB blackout experiment |
| `make dashboard` | View CloudWatch dashboard |
| `make waf-logs` | View WAF logs |
| `make load-test` | Run load test |

## 🔧 Configuration

### Environment Variables

```bash
export AWS_REGION=us-east-1
export ENVIRONMENT=dev
```

### Terraform Variables

Create `terraform.tfvars` in each project directory:

**chaos-edge-terraform/terraform.tfvars:**
```hcl
aws_region            = "us-east-1"
environment           = "dev"
vpc_cidr              = "10.0.0.0/16"
node_instance_types   = ["t3.medium"]
node_min_size         = 2
node_max_size         = 5
node_desired_size     = 2
alert_emails          = ["admin@example.com"]
```

**superbowl-edge-terraform/terraform.tfvars:**
```hcl
aws_region              = "us-east-1"
environment             = "dev"
vpc_cidr                = "10.0.0.0/16"
haproxy_instance_type   = "t3.medium"
haproxy_min_size        = 2
haproxy_max_size        = 4
haproxy_desired_capacity = 2
waf_rate_limit          = 2000
cloudfront_price_class  = "PriceClass_All"
alert_emails            = ["admin@example.com"]
```

## 🧪 Chaos Engineering

### Available Experiments (SuperBowlEdge)

| Experiment | Description | Impact |
|------------|-------------|--------|
| **EC2 Stop** | Stop HAProxy instances | High |
| **Network Latency** | Inject latency between ALB and origin | Medium |
| **CPU Stress** | Overload HAProxy CPU | Medium |
| **ALB Blackout** | Deregister all ALB targets | High |

### Running Experiments

```bash
cd superbowl-edge-terraform

# List available experiments
make chaos-test

# Run specific experiments
make chaos-ec2-stop
make chaos-latency
make chaos-blackout
```

## 📈 Monitoring

### CloudWatch Dashboards

- **Chaos Edge**: EKS cluster metrics, ALB metrics, application logs
- **SuperBowlEdge**: CloudFront metrics, ALB metrics, WAF logs, HAProxy metrics

### Accessing Dashboards

```bash
# Chaos Edge (via kubectl port-forward)
cd chaos-edge-terraform
make grafana      # http://localhost:3000
make prometheus   # http://localhost:9090

# SuperBowlEdge (via AWS Console)
cd superbowl-edge-terraform
make dashboard    # Opens CloudWatch dashboard
```

## 💰 Cost Optimization

### Chaos Edge DevOps

- Uses **Spot instances** for chaos workloads
- **Single NAT Gateway** in dev environment
- **Auto-scaling** based on CPU/memory

### SuperBowlEdge Chaos

- **CloudFront caching** reduces origin load
- **Auto-scaling** HAProxy based on demand
- **WAF rate limiting** prevents abuse

### Estimated Monthly Costs (dev)

| Project | Estimated Cost |
|---------|---------------|
| Chaos Edge DevOps | ~$150-200/month |
| SuperBowlEdge Chaos | ~$200-300/month |

## 🔐 Security

- **VPC isolation** with private subnets
- **Security groups** with least privilege
- **AWS WAF** with managed rule sets
- **SSL/TLS** encryption
- **IAM roles** with service-linked policies
- **CloudTrail** logging enabled

## 🗑️ Cleanup

```bash
# Destroy SuperBowlEdge
cd superbowl-edge-terraform
make destroy

# Destroy Chaos Edge
cd chaos-edge-terraform
make destroy

# Or destroy both
./deploy-all.sh --chaos-only  # Just to show the command
# Then manually run destroy in each directory
```

## 📚 Documentation

- [Chaos Edge DevOps README](chaos-edge-terraform/README.md)
- [SuperBowlEdge Chaos README](superbowl-edge-terraform/README.md)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [AWS FIS Documentation](https://docs.aws.amazon.com/fis/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details
