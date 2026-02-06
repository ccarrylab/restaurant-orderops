# SuperBowlEdge Chaos - Terraform Infrastructure

AWS Edge CDN infrastructure with chaos engineering capabilities using CloudFront, ALB, HAProxy, WAF, and FIS.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CloudFront Distribution                       │   │
│  │              (450+ Edge Locations, Global CDN)                   │   │
│  │                                                                  │   │
│  │   ┌──────────────┐         ┌──────────────┐                    │   │
│  │   │   S3 Origin  │         │   ALB Origin │                    │   │
│  │   │  (Static)    │         │  (Dynamic)   │                    │   │
│  │   └──────────────┘         └──────────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AWS WAF (Regional)                            │   │
│  │   • AWS Managed Rules (Common, SQLi, XSS)                       │   │
│  │   • Rate Limiting (2000 req/5min)                               │   │
│  │   • Geo-blocking (optional)                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Application Load Balancer (ALB)                     │   │
│  │              (Cross-AZ, Health Checks, Stickiness)               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                          │
│                              ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    VPC (10.0.0.0/16)                             │   │
│  │  ┌─────────────────────────────────────────────────────────┐   │   │
│  │  │              HAProxy Auto Scaling Group                  │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │   │
│  │  │  │  HAProxy 1  │  │  HAProxy 2  │  │  HAProxy 3  │     │   │   │
│  │  │  │ (t3.medium) │  │ (t3.medium) │  │ (t3.small)  │     │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │   │
│  │  │         Health Checks • Failover • Load Balancing       │   │   │
│  │  └─────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    AWS FIS (Chaos Engineering)                   │   │
│  │   • EC2 Instance Stop      • Network Latency Injection          │   │
│  │   • CPU Stress             • ALB Target Deregistration          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    CloudWatch Monitoring                         │   │
│  │   • SLO Tracking • Synthetics Canaries • Custom Dashboards      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Initialize Terraform
make init

# Review the plan
make plan

# Deploy infrastructure
make apply

# View infrastructure info
make info

# Run demo commands
make demo
```

## 📋 Components

| Component | Service | Purpose |
|-----------|---------|---------|
| **CloudFront** | CDN | Global content delivery |
| **ALB** | Load Balancer | Traffic distribution |
| **HAProxy** | EC2 ASG | Origin servers |
| **AWS WAF** | Security | Web application firewall |
| **AWS FIS** | Chaos | Fault injection testing |
| **CloudWatch** | Monitoring | Metrics and dashboards |

## 🔑 Accessing Services

### CloudFront Distribution

```bash
# Get CloudFront domain
terraform output cloudfront_domain_name

# Test the endpoint
curl https://$(terraform output -raw cloudfront_domain_name)
```

### ALB Health Check

```bash
# Get ALB DNS
terraform output alb_dns_name

# Test health endpoint
curl http://$(terraform output -raw alb_dns_name)/health
```

### CloudWatch Dashboard

```bash
# Open dashboard in browser
make dashboard

# Or get dashboard name
terraform output cloudwatch_dashboard
```

## 🧪 Chaos Engineering

### Available Experiments

| Experiment | Description | Duration | Impact |
|------------|-------------|----------|--------|
| **EC2 Stop** | Stop HAProxy instances | 5 min | High |
| **Network Latency** | Inject latency | 5 min | Medium |
| **CPU Stress** | Overload CPU | 5 min | Medium |
| **ALB Blackout** | Deregister all targets | 3 min | High |

### Running Experiments

```bash
# List available experiments
make chaos-test

# Run specific experiments
make chaos-ec2-stop      # Test origin failover
make chaos-latency       # Test latency handling
make chaos-blackout      # Test complete origin failure

# Or use AWS CLI
aws fis list-experiment-templates
aws fis start-experiment --experiment-template-id <TEMPLATE_ID>
aws fis list-experiments
```

### Viewing Experiment Results

```bash
# View FIS logs
aws logs tail /aws/fis/superbowl-edge-dev --follow

# View CloudWatch chaos dashboard
make dashboard
```

## 📊 Monitoring

### Key Metrics

| Metric | Namespace | Description |
|--------|-----------|-------------|
| `Requests` | AWS/CloudFront | Total CDN requests |
| `CacheHitRate` | AWS/CloudFront | CDN cache efficiency |
| `RequestCount` | AWS/ApplicationELB | ALB requests |
| `TargetResponseTime` | AWS/ApplicationELB | Origin latency |
| `BlockedRequests` | AWS/WAFV2 | WAF blocked requests |
| `CPUUtilization` | AWS/EC2 | HAProxy CPU usage |

### Synthetics Canaries

Health check canary runs every 5 minutes:
- Tests ALB health endpoint
- Measures response time
- Alerts on failures

### CloudWatch Alarms

| Alarm | Threshold | Action |
|-------|-----------|--------|
| ALB 5XX Errors | > 10 in 5 min | SNS Alert |
| ALB High Latency | > 1 sec | SNS Alert |
| Unhealthy Targets | > 0 | SNS Alert |
| WAF High Blocked | > 1000 in 5 min | SNS Alert |

## 🔧 Configuration

### terraform.tfvars Example

```hcl
aws_region              = "us-east-1"
environment             = "dev"
vpc_cidr                = "10.0.0.0/16"

# HAProxy Configuration
haproxy_instance_type   = "t3.medium"
haproxy_min_size        = 2
haproxy_max_size        = 4
haproxy_desired_capacity = 2

# WAF Configuration
waf_rate_limit          = 2000
waf_blocked_countries   = ["KP", "IR"]  # North Korea, Iran

# CloudFront Configuration
cloudfront_price_class  = "PriceClass_All"
cloudfront_rate_limit   = 5000

# Monitoring
alert_emails            = ["admin@example.com"]
enable_fis              = true
```

## 💰 Cost Optimization

- **CloudFront caching** reduces origin requests
- **Auto-scaling** adjusts capacity based on demand
- **Spot instances** for non-critical workloads
- **WAF rate limiting** prevents abuse

### Estimated Monthly Costs

| Component | Dev | Prod |
|-----------|-----|------|
| CloudFront | $50-100 | $500-2000 |
| ALB | $20-30 | $50-100 |
| HAProxy (EC2) | $50-100 | $200-500 |
| WAF | $10-20 | $50-100 |
| FIS | $5-10 | $20-50 |
| **Total** | **$135-260** | **$820-2750** |

## 🔐 Security

- **AWS WAF** with managed rule sets
- **CloudFront WAF** (global)
- **Security groups** with minimal rules
- **Private subnets** for HAProxy
- **SSL/TLS** encryption
- **Access logs** to S3

## 🗑️ Cleanup

```bash
make destroy
```

## 📚 References

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS FIS Documentation](https://docs.aws.amazon.com/fis/)
- [AWS WAF Documentation](https://docs.aws.amazon.com/waf/)
- [HAProxy Documentation](https://www.haproxy.org/documentation/)
