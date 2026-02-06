# 🚀 Deployment Guide - SuperBowlEdge Chaos Infrastructure

## 📦 Step 1: Unpack and Verify

```bash
# Unzip the package
unzip OKComputer_SuperBowlEdge_FIXED.zip

# Verify structure
cd OKComputer_SuperBowlEdge_FIXED
ls -la
# You should see:
# - chaos-edge-terraform/
# - superbowl-edge-terraform/
# - app/
# - deploy-all.sh
# - README.md
# - FIXES_AND_REVIEW.md
# - AWS_DEPLOYMENT_FIXES.md
```

---

## 🔧 Step 2: Prerequisites Check

### Install Required Tools

```bash
# Check AWS CLI (required)
aws --version
# If not installed: https://aws.amazon.com/cli/

# Check Terraform (required >= 1.5.0)
terraform version
# If not installed: https://www.terraform.io/downloads

# Check kubectl (required for EKS)
kubectl version --client
# If not installed: https://kubernetes.io/docs/tasks/tools/

# Check Make (required)
make --version
# Usually pre-installed on Mac/Linux

# Check Node.js (optional, only if building dashboard)
node --version
# If not installed: https://nodejs.org/
```

---

## 🔐 Step 3: Configure AWS Credentials

### Option A: AWS CLI Configure (Recommended)
```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

### Option B: Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

### Verify Credentials
```bash
aws sts get-caller-identity
# Should return your AWS account info
```

---

## ⚙️ Step 4: Configure Variables

### For SuperBowlEdge Chaos (CloudFront/ALB)

```bash
cd superbowl-edge-terraform

# Create terraform.tfvars file
cat > terraform.tfvars << 'EOF'
# Basic Configuration
aws_region    = "us-east-1"
environment   = "dev"
project_name  = "superbowl-edge"

# Network Configuration
vpc_cidr = "10.0.0.0/16"

# HAProxy Auto Scaling
haproxy_instance_type    = "t3.medium"
haproxy_min_size         = 2
haproxy_max_size         = 4
haproxy_desired_capacity = 2

# WAF Configuration
waf_rate_limit = 2000

# CloudFront Configuration
cloudfront_price_class = "PriceClass_100"  # US, Canada, Europe

# Alerting
alert_emails = ["your-email@example.com"]
EOF

# Review and edit as needed
nano terraform.tfvars
```

### For Chaos Edge DevOps (EKS)

```bash
cd ../chaos-edge-terraform

# Create terraform.tfvars file
cat > terraform.tfvars << 'EOF'
# Basic Configuration
aws_region    = "us-east-1"
environment   = "dev"
project_name  = "chaos-edge"

# Network Configuration
vpc_cidr = "10.0.0.0/16"

# Kubernetes Configuration
kubernetes_version = "1.30"

# Node Group Configuration
node_instance_types  = ["t3.medium"]
node_min_size        = 2
node_max_size        = 5
node_desired_size    = 2

# Alerting
alert_emails = ["your-email@example.com"]
EOF

# Review and edit as needed
nano terraform.tfvars
```

---

## 🚀 Step 5: Deploy Infrastructure

### Option A: Deploy Everything (Automated)

```bash
cd ..  # Back to root directory

# Make deploy script executable
chmod +x deploy-all.sh

# Deploy both projects
./deploy-all.sh --env dev --region us-east-1

# Or deploy only one:
./deploy-all.sh --superbowl-only --env dev
./deploy-all.sh --chaos-only --env dev
```

### Option B: Deploy Individually (Recommended for First Time)

#### Deploy SuperBowlEdge Chaos First

```bash
cd superbowl-edge-terraform

# Initialize Terraform
make init
# Or: terraform init

# Validate configuration
terraform validate

# Review the plan (IMPORTANT - review before applying!)
make plan
# Or: terraform plan -out=tfplan

# Apply the infrastructure (takes ~10-15 minutes)
make apply
# Or: terraform apply tfplan

# View outputs
terraform output
```

#### Then Deploy Chaos Edge DevOps (Optional)

```bash
cd ../chaos-edge-terraform

# Initialize Terraform
make init

# Validate configuration
terraform validate

# Review the plan
make plan

# Apply the infrastructure (takes ~15-20 minutes)
make apply

# Configure kubectl
make kubectl

# View outputs
terraform output
```

---

## 🔍 Step 6: Verify Deployment

### SuperBowlEdge Chaos Verification

```bash
cd superbowl-edge-terraform

# Check infrastructure status
make info

# View CloudFront distribution
aws cloudfront list-distributions --query 'DistributionList.Items[?Comment==`superbowl-edge-dev-cdn`]'

# Check ALB health
ALB_DNS=$(terraform output -raw alb_dns_name)
curl -I http://$ALB_DNS/health

# View CloudWatch Dashboard
make dashboard
```

### Chaos Edge DevOps Verification

```bash
cd chaos-edge-terraform

# Verify EKS cluster
kubectl get nodes

# Check all pods
kubectl get pods --all-namespaces

# Access Grafana (optional)
make grafana
# Open http://localhost:3000
# Default credentials: admin/prom-operator

# View Chaos Mesh Dashboard
make dashboard
```

---

## 📊 Step 7: Build and Deploy Dashboard (Optional)

```bash
cd app

# Install dependencies
npm install

# Build production version
npm run build

# Deploy to S3 (if you set up S3 bucket)
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name,'superbowl-edge-dev-content')].Name" --output text)
aws s3 sync dist/ s3://$BUCKET_NAME/dashboard/ --delete

# Or run locally for testing
npm run dev
# Open http://localhost:5173
```

---

## 🧪 Step 8: Test Chaos Experiments

### SuperBowlEdge Chaos Tests

```bash
cd superbowl-edge-terraform

# List all experiments
make chaos-test

# Run EC2 stop experiment (stops 50% of instances for 5 min)
make chaos-ec2-stop

# Run network latency experiment (adds 200ms latency for 5 min)
make chaos-latency

# Run CPU stress experiment (80% CPU load on 1 instance)
make chaos-cpu-stress

# Monitor during experiments
watch -n 2 'aws elbv2 describe-target-health --target-group-arn $(terraform output -raw target_group_arn)'

# View CloudWatch metrics
make dashboard
```

### Load Testing (Optional)

```bash
# Simple load test with curl
ALB_DNS=$(terraform output -raw alb_dns_name)
for i in {1..100}; do curl -s -o /dev/null -w "%{http_code}\n" http://$ALB_DNS/; done

# Or use Apache Bench (if installed)
ab -n 1000 -c 10 http://$ALB_DNS/

# Or use wrk (if installed)
wrk -t4 -c100 -d30s http://$ALB_DNS/
```

---

## 📈 Step 9: Monitor and Observe

### CloudWatch Dashboards

```bash
# SuperBowlEdge Dashboard
aws cloudwatch get-dashboard --dashboard-name superbowl-edge-dev-dashboard

# Or via AWS Console
# Navigate to: CloudWatch > Dashboards > superbowl-edge-dev-dashboard
```

### View Logs

```bash
# ALB access logs (in S3)
aws s3 ls s3://superbowl-edge-dev-logs-$(aws sts get-caller-identity --query Account --output text)/alb-logs/

# WAF logs (in S3 via Firehose)
aws s3 ls s3://superbowl-edge-dev-logs-$(aws sts get-caller-identity --query Account --output text)/waf-logs/

# CloudWatch Logs
aws logs tail /aws/fis/superbowl-edge-dev --follow
```

### Check Costs

```bash
# View current month costs by service
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Or use AWS Cost Explorer in Console
```

---

## 🛠️ Step 10: Common Commands

### SuperBowlEdge Operations

```bash
cd superbowl-edge-terraform

# View all outputs
make info

# Run demo commands
make demo

# View WAF logs
make waf-logs

# SSH to HAProxy instance (if needed)
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=superbowl-edge-dev-haproxy" "Name=instance-state-name,Values=running" --query 'Reservations[0].Instances[0].InstanceId' --output text)
aws ssm start-session --target $INSTANCE_ID
```

### Chaos Edge Operations

```bash
cd chaos-edge-terraform

# Port-forward Grafana
make grafana

# Port-forward Prometheus
make prometheus

# Deploy application to EKS
kubectl apply -f your-app.yaml

# Scale deployment
kubectl scale deployment your-app --replicas=5

# Run chaos experiment
make chaos-demo
```

---

## 🔄 Step 11: Making Changes

### Update Infrastructure

```bash
# Make changes to .tf files
nano main.tf

# Plan changes
terraform plan

# Apply changes
terraform apply

# Or use Make commands
make plan
make apply
```

### Update Variables

```bash
# Edit terraform.tfvars
nano terraform.tfvars

# Re-run plan and apply
terraform plan -out=tfplan
terraform apply tfplan
```

---

## 🗑️ Step 12: Cleanup (When Done)

### Destroy Individual Project

```bash
# Destroy SuperBowlEdge
cd superbowl-edge-terraform
make destroy
# Or: terraform destroy

# Destroy Chaos Edge
cd chaos-edge-terraform
make destroy
```

### Complete Cleanup

```bash
# Remove state files and locks
cd superbowl-edge-terraform
aws s3 rb s3://superbowl-edge-terraform-state --force
aws dynamodb delete-table --table-name superbowl-edge-terraform-locks

cd ../chaos-edge-terraform
aws s3 rb s3://chaos-edge-terraform-state --force
aws dynamodb delete-table --table-name chaos-edge-terraform-locks
```

---

## ⚠️ Troubleshooting

### Common Issues

**Issue: "Error creating S3 bucket"**
```bash
# Bucket names must be globally unique
# Edit terraform.tfvars and add a unique suffix:
project_name = "superbowl-edge-yourname"
```

**Issue: "Insufficient capacity"**
```bash
# Try different instance types or AZs
# Edit terraform.tfvars:
haproxy_instance_type = "t3.small"  # or t2.medium
```

**Issue: "Rate exceeded"**
```bash
# AWS API throttling - wait a minute and retry
terraform apply
```

**Issue: "Resource already exists"**
```bash
# Import existing resource or use different names
terraform import aws_s3_bucket.logs bucket-name
```

**Issue: Terraform state locked**
```bash
# Force unlock (use carefully)
terraform force-unlock LOCK_ID
```

### Getting Help

```bash
# Check Terraform logs
export TF_LOG=DEBUG
terraform plan

# Validate configuration
terraform validate

# Format code
terraform fmt -recursive

# Show current state
terraform show
```

---

## 📚 Additional Resources

- [AWS FIS Documentation](https://docs.aws.amazon.com/fis/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)

---

## 🎯 Quick Start TL;DR

```bash
# 1. Unzip
unzip OKComputer_SuperBowlEdge_FIXED.zip && cd OKComputer_SuperBowlEdge_FIXED

# 2. Configure AWS
aws configure

# 3. Deploy SuperBowlEdge
cd superbowl-edge-terraform
cp terraform.tfvars.example terraform.tfvars  # Edit with your values
terraform init
terraform plan
terraform apply

# 4. Verify
make info
make demo

# 5. Test chaos
make chaos-test
make chaos-ec2-stop

# 6. Monitor
make dashboard

# 7. Cleanup when done
make destroy
```

---

## 💰 Estimated Costs

### Development Environment (Running 24/7)
- **SuperBowlEdge**: ~$200-250/month
  - ALB: $16/month
  - HAProxy instances (2x t3.medium): $60/month
  - CloudFront: $50-100/month (varies with traffic)
  - NAT Gateway: $32/month
  - S3, CloudWatch, WAF: $20-40/month

- **Chaos Edge**: ~$150-200/month
  - EKS Control Plane: $72/month
  - Worker nodes (2x t3.medium): $60/month
  - ALB: $16/month
  - NAT Gateway: $32/month

### Cost Optimization Tips
- Stop instances when not in use
- Use Spot instances for non-prod
- Delete after testing: `make destroy`
- Set up billing alerts
- Use `t3.small` instead of `t3.medium` for testing

---

**You're all set! Happy chaos engineering! 🚀**
