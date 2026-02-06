# =============================================================================
# Chaos Edge DevOps - Terraform Makefile
# =============================================================================

.PHONY: help init plan apply destroy validate fmt clean kubectl dashboard chaos-demo

# Default target
help:
	@echo "Chaos Edge DevOps - Terraform Commands"
	@echo "======================================"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make init       - Initialize Terraform and backend"
	@echo "  make validate   - Validate Terraform configuration"
	@echo "  make fmt        - Format Terraform files"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make plan       - Show execution plan"
	@echo "  make apply      - Deploy infrastructure"
	@echo "  make destroy    - Destroy infrastructure"
	@echo ""
	@echo "Operations Commands:"
	@echo "  make kubectl    - Configure kubectl for EKS cluster"
	@echo "  make dashboard  - Open Chaos Edge Dashboard"
	@echo "  make grafana    - Port-forward Grafana"
	@echo "  make chaos-demo - Run chaos engineering demo"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean      - Remove Terraform cache files"
	@echo "  make outputs    - Show Terraform outputs"

# Initialize Terraform
init:
	@echo "🔧 Initializing Terraform..."
	terraform init

# Validate configuration
validate: init
	@echo "✅ Validating Terraform configuration..."
	terraform validate

# Format Terraform files
fmt:
	@echo "📝 Formatting Terraform files..."
	terraform fmt -recursive

# Show execution plan
plan: validate
	@echo "📋 Generating execution plan..."
	terraform plan -out=tfplan

# Deploy infrastructure
apply: plan
	@echo "🚀 Deploying infrastructure..."
	terraform apply tfplan
	@echo ""
	@echo "✅ Deployment complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  make kubectl    - Configure kubectl"
	@echo "  make dashboard  - Open the dashboard"

# Quick apply without plan file
apply-auto:
	@echo "🚀 Deploying infrastructure (auto-approve)..."
	terraform apply -auto-approve

# Destroy infrastructure
destroy:
	@echo "⚠️  Destroying infrastructure..."
	@read -p "Are you sure? [y/N] " confirm && [ $$confirm = "y" ] && terraform destroy -auto-approve || echo "Cancelled"

# Force destroy
destroy-force:
	@echo "💥 Destroying infrastructure..."
	terraform destroy -auto-approve

# Show outputs
outputs:
	@echo "📤 Terraform Outputs:"
	terraform output

# Configure kubectl
kubectl:
	@echo "🔑 Configuring kubectl..."
	@aws eks update-kubeconfig --region $$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1") --name $$(terraform output -raw cluster_name 2>/dev/null || echo "chaos-edge-dev")
	@echo "✅ kubectl configured!"
	@echo ""
	@echo "Useful commands:"
	@echo "  kubectl get nodes"
	@echo "  kubectl get pods -n chaos-edge"
	@echo "  kubectl get pods -n monitoring"

# Open dashboard
dashboard:
	@echo "🌐 Opening Chaos Edge Dashboard..."
	@open http://$$(kubectl get svc -n chaos-edge chaos-edge-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "localhost:8080") || echo "Dashboard not yet available"

# Port-forward Grafana
grafana:
	@echo "📊 Port-forwarding Grafana..."
	@echo "Access at: http://localhost:3000"
	@echo "Username: admin"
	@echo "Password: chaosedge2026"
	kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Port-forward Prometheus
prometheus:
	@echo "📈 Port-forwarding Prometheus..."
	@echo "Access at: http://localhost:9090"
	kubectl port-forward -n monitoring svc/prometheus-kube-p-prometheus 9090:9090

# Run chaos demo
chaos-demo:
	@echo "🧪 Running Chaos Engineering Demo..."
	@echo ""
	@echo "Available experiments:"
	@echo "  1. Pod Failure"
	@echo "  2. Network Latency"
	@echo "  3. CPU Stress"
	@echo "  4. Memory Stress"
	@echo ""
	@echo "Access Chaos Mesh Dashboard:"
	@echo "  kubectl port-forward -n chaos-mesh svc/chaos-mesh-dashboard 2333:2333"
	@echo "  http://localhost:2333"

# Get cluster info
info:
	@echo "📊 Cluster Information:"
	@echo "========================"
	@echo ""
	@echo "Cluster Name: $$(terraform output -raw cluster_name 2>/dev/null || echo 'N/A')"
	@echo "Cluster Endpoint: $$(terraform output -raw cluster_endpoint 2>/dev/null || echo 'N/A')"
	@echo "ECR Repository: $$(terraform output -raw ecr_repository_url 2>/dev/null || echo 'N/A')"
	@echo "ALB DNS: $$(terraform output -raw alb_dns_name 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "Namespaces:"
	@kubectl get namespaces 2>/dev/null || echo "kubectl not configured. Run: make kubectl"

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf .terraform
	rm -f tfplan
	rm -f terraform.tfstate.backup
	@echo "✅ Clean complete!"

# Full deployment with all steps
all: init plan apply kubectl info
	@echo ""
	@echo "🎉 Full deployment complete!"

# Development quick start
dev: init apply-auto kubectl
	@echo ""
	@echo "🚀 Development environment ready!"
