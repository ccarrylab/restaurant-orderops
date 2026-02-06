# =============================================================================
# SuperBowlEdge Chaos - Terraform Makefile
# =============================================================================

.PHONY: help init plan apply destroy validate fmt clean info demo chaos-test

# Default target
help:
	@echo "SuperBowlEdge Chaos - Terraform Commands"
	@echo "========================================"
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
	@echo "  make info       - Show infrastructure info"
	@echo "  make demo       - Run demo commands"
	@echo "  make chaos-test - Run chaos engineering tests"
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
	@echo "🚀 Deploying SuperBowlEdge infrastructure..."
	terraform apply tfplan
	@echo ""
	@echo "✅ Deployment complete!"
	@echo ""
	@$(MAKE) info

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

# Show infrastructure info
info:
	@echo ""
	@echo "📊 SuperBowlEdge Infrastructure"
	@echo "==============================="
	@echo ""
	@echo "🌐 CloudFront Distribution:"
	@echo "   Domain: $$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "⚖️  Application Load Balancer:"
	@echo "   DNS: $$(terraform output -raw alb_dns_name 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "🖥️  HAProxy Auto Scaling Group:"
	@echo "   Name: $$(terraform output -raw haproxy_asg_name 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "📦 S3 Buckets:"
	@echo "   Logs: $$(terraform output -raw s3_bucket_logs 2>/dev/null || echo 'N/A')"
	@echo "   Content: $$(terraform output -raw s3_bucket_content 2>/dev/null || echo 'N/A')"
	@echo ""
	@echo "📈 CloudWatch Dashboard:"
	@echo "   Name: $$(terraform output -raw cloudwatch_dashboard 2>/dev/null || echo 'N/A')"

# Run demo
demo:
	@echo ""
	@echo "🎮 SuperBowlEdge Demo Commands"
	@echo "=============================="
	@echo ""
	@echo "Test ALB Health Endpoint:"
	@echo "   curl http://$$(terraform output -raw alb_dns_name 2>/dev/null || echo 'localhost')/health"
	@echo ""
	@echo "Test CloudFront Distribution:"
	@echo "   curl https://$$(terraform output -raw cloudfront_domain_name 2>/dev/null || echo 'localhost')"
	@echo ""
	@echo "View ALB Logs:"
	@echo "   aws logs tail /aws/alb/superbowl-edge-$$(terraform workspace show) --follow"
	@echo ""
	@echo "View HAProxy Logs:"
	@echo "   aws logs tail /aws/ec2/superbowl-edge-haproxy --follow"

# Run chaos tests
chaos-test:
	@echo ""
	@echo "🧪 Chaos Engineering Tests"
	@echo "=========================="
	@echo ""
	@echo "Available FIS Experiments:"
	@echo "   1. EC2 Instance Stop (Origin Failure)"
	@echo "   2. Network Latency Injection"
	@echo "   3. CPU Stress"
	@echo "   4. ALB Target Deregistration (Blackout)"
	@echo ""
	@echo "List experiment templates:"
	@echo "   aws fis list-experiment-templates"
	@echo ""
	@echo "Start an experiment:"
	@echo "   aws fis start-experiment --experiment-template-id <TEMPLATE_ID>"
	@echo ""
	@echo "Monitor experiments:"
	@echo "   aws fis list-experiments"

# Run specific chaos experiments
chaos-ec2-stop:
	@echo "🛑 Running EC2 Stop Chaos Experiment..."
	@TEMPLATE_ID=$$(aws fis list-experiment-templates --query 'experimentTemplates[?description==`Stop EC2 instances to test HAProxy failover`].id' --output text) && \
	if [ -n "$$TEMPLATE_ID" ]; then \
		aws fis start-experiment --experiment-template-id $$TEMPLATE_ID; \
	else \
		echo "Experiment template not found. Run 'terraform apply' first."; \
	fi

chaos-latency:
	@echo "⏱️  Running Network Latency Chaos Experiment..."
	@TEMPLATE_ID=$$(aws fis list-experiment-templates --query 'experimentTemplates[?description==`Inject network latency between ALB and origin`].id' --output text) && \
	if [ -n "$$TEMPLATE_ID" ]; then \
		aws fis start-experiment --experiment-template-id $$TEMPLATE_ID; \
	else \
		echo "Experiment template not found. Run 'terraform apply' first."; \
	fi

chaos-blackout:
	@echo "🔌 Running ALB Blackout Chaos Experiment..."
	@TEMPLATE_ID=$$(aws fis list-experiment-templates --query 'experimentTemplates[?description==`Deregister all targets from ALB to simulate origin blackout`].id' --output text) && \
	if [ -n "$$TEMPLATE_ID" ]; then \
		aws fis start-experiment --experiment-template-id $$TEMPLATE_ID; \
	else \
		echo "Experiment template not found. Run 'terraform apply' first."; \
	fi

# View CloudWatch dashboard
dashboard:
	@echo "📊 Opening CloudWatch Dashboard..."
	@DASHBOARD_NAME=$$(terraform output -raw cloudwatch_dashboard 2>/dev/null) && \
	if [ -n "$$DASHBOARD_NAME" ]; then \
		open "https://$$(aws configure get region).console.aws.amazon.com/cloudwatch/home?region=$$(aws configure get region)#dashboards:name=$$DASHBOARD_NAME" || \
		echo "Dashboard URL: https://$$(aws configure get region).console.aws.amazon.com/cloudwatch/home?region=$$(aws configure get region)#dashboards:name=$$DASHBOARD_NAME"; \
	else \
		echo "Dashboard not found. Run 'terraform apply' first."; \
	fi

# View WAF logs
waf-logs:
	@echo "🛡️  Viewing WAF Logs..."
	@aws logs tail /aws/waf/superbowl-edge-$$(terraform workspace show) --follow 2>/dev/null || \
	echo "WAF log group not found. Check CloudWatch Logs in AWS Console."

# Load test with Apache Bench
load-test:
	@echo "⚡ Running Load Test..."
	@ALB_DNS=$$(terraform output -raw alb_dns_name 2>/dev/null) && \
	if [ -n "$$ALB_DNS" ]; then \
		echo "Testing ALB: $$ALB_DNS"; \
		ab -n 1000 -c 10 http://$$ALB_DNS/health; \
	else \
		echo "ALB not found. Run 'terraform apply' first."; \
	fi

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	rm -rf .terraform
	rm -f tfplan
	rm -f terraform.tfstate.backup
	@echo "✅ Clean complete!"

# Full deployment with all steps
all: init plan apply info
	@echo ""
	@echo "🎉 Full deployment complete!"
	@echo ""
	@echo "Next steps:"
	@echo "  make demo       - Run demo commands"
	@echo "  make chaos-test - Run chaos experiments"
	@echo "  make dashboard  - View CloudWatch dashboard"

# Development quick start
dev: init apply-auto info
	@echo ""
	@echo "🚀 Development environment ready!"
