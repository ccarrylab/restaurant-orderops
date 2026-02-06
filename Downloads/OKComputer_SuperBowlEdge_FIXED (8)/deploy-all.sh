#!/bin/bash
# =============================================================================
# Unified Deployment Script for Chaos Edge Projects
# =============================================================================
# This script deploys both:
# 1. Chaos Edge DevOps (EKS infrastructure)
# 2. SuperBowlEdge Chaos (CloudFront/ALB/WAF)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-dev}"

# Print banner
print_banner() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           Chaos Edge Projects - Unified Deployment             ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Print section header
print_section() {
    echo ""
    echo -e "${YELLOW}▶ $1${NC}"
    echo -e "${YELLOW}$(printf '=%.0s' $(seq 1 $((${#1}+3))))${NC}"
}

# Print success message
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Print error message
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Print info message
print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Print warning message
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    print_success "AWS CLI installed"
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        exit 1
    fi
    print_success "Terraform installed"
    
    # Check kubectl (for EKS)
    if ! command -v kubectl &> /dev/null; then
        print_warning "kubectl is not installed (needed for EKS management)"
    else
        print_success "kubectl installed"
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    print_success "AWS credentials configured"
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    print_info "AWS Account: $ACCOUNT_ID"
    print_info "AWS Region: $AWS_REGION"
    print_info "Environment: $ENVIRONMENT"
}

# Setup S3 backend for Terraform
setup_backend() {
    print_section "Setting up Terraform Backend"
    
    # Chaos Edge backend
    BUCKET_NAME="chaos-edge-terraform-state"
    if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        print_info "Creating S3 bucket: $BUCKET_NAME"
        aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" || true
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
    fi
    
    DYNAMODB_TABLE="chaos-edge-terraform-locks"
    if ! aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" 2>/dev/null; then
        print_info "Creating DynamoDB table: $DYNAMODB_TABLE"
        aws dynamodb create-table \
            --table-name "$DYNAMODB_TABLE" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST 2>/dev/null || true
    fi
    
    # SuperBowlEdge backend
    BUCKET_NAME="superbowl-edge-terraform-state"
    if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
        print_info "Creating S3 bucket: $BUCKET_NAME"
        aws s3 mb "s3://$BUCKET_NAME" --region "$AWS_REGION" || true
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled
    fi
    
    DYNAMODB_TABLE="superbowl-edge-terraform-locks"
    if ! aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" 2>/dev/null; then
        print_info "Creating DynamoDB table: $DYNAMODB_TABLE"
        aws dynamodb create-table \
            --table-name "$DYNAMODB_TABLE" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST 2>/dev/null || true
    fi
    
    print_success "Backend setup complete"
}

# Deploy Chaos Edge DevOps
deploy_chaos_edge() {
    print_section "Deploying Chaos Edge DevOps (EKS)"
    
    cd chaos-edge-terraform
    
    print_info "Initializing Terraform..."
    terraform init
    
    print_info "Validating configuration..."
    terraform validate
    
    print_info "Planning deployment..."
    terraform plan -var="environment=$ENVIRONMENT" -var="aws_region=$AWS_REGION" -out=tfplan
    
    print_info "Applying deployment..."
    terraform apply tfplan
    
    print_success "Chaos Edge DevOps deployed successfully!"
    
    # Show outputs
    echo ""
    print_info "Infrastructure Outputs:"
    terraform output
    
    cd ..
}

# Deploy SuperBowlEdge Chaos
deploy_superbowl_edge() {
    print_section "Deploying SuperBowlEdge Chaos (CloudFront/ALB)"
    
    cd superbowl-edge-terraform
    
    print_info "Initializing Terraform..."
    terraform init
    
    print_info "Validating configuration..."
    terraform validate
    
    print_info "Planning deployment..."
    terraform plan -var="environment=$ENVIRONMENT" -var="aws_region=$AWS_REGION" -out=tfplan
    
    print_info "Applying deployment..."
    terraform apply tfplan
    
    print_success "SuperBowlEdge Chaos deployed successfully!"
    
    # Show outputs
    echo ""
    print_info "Infrastructure Outputs:"
    terraform output
    
    cd ..
}

# Deploy dashboards
deploy_dashboards() {
    print_section "Deploying Dashboards"
    
    # Build and deploy Chaos Edge Dashboard
    if [ -d "chaos-edge-dashboard" ]; then
        print_info "Building Chaos Edge Dashboard..."
        cd chaos-edge-dashboard
        npm install
        npm run build
        
        # Upload to S3 if bucket exists
        DASHBOARD_BUCKET=$(aws s3api list-buckets --query "Buckets[?starts_with(Name,'chaos-edge-${ENVIRONMENT}-content')].Name" --output text 2>/dev/null)
        if [ -n "$DASHBOARD_BUCKET" ]; then
            aws s3 sync dist/ "s3://$DASHBOARD_BUCKET/dashboard/" --delete
            print_success "Chaos Edge Dashboard deployed to S3"
        fi
        cd ..
    fi
    
    # Build and deploy SuperBowlEdge Dashboard
    if [ -d "superbowl-edge-dashboard" ]; then
        print_info "Building SuperBowlEdge Dashboard..."
        cd superbowl-edge-dashboard
        npm install
        npm run build
        
        # Upload to S3 if bucket exists
        DASHBOARD_BUCKET=$(aws s3api list-buckets --query "Buckets[?starts_with(Name,'superbowl-edge-${ENVIRONMENT}-content')].Name" --output text 2>/dev/null)
        if [ -n "$DASHBOARD_BUCKET" ]; then
            aws s3 sync dist/ "s3://$DASHBOARD_BUCKET/dashboard/" --delete
            print_success "SuperBowlEdge Dashboard deployed to S3"
        fi
        cd ..
    fi
}

# Print summary
print_summary() {
    echo ""
    print_section "Deployment Summary"
    echo ""
    
    echo -e "${GREEN}✅ Both projects deployed successfully!${NC}"
    echo ""
    
    # Chaos Edge info
    echo -e "${BLUE}Chaos Edge DevOps:${NC}"
    echo "  • EKS Cluster: chaos-edge-$ENVIRONMENT"
    echo "  • ECR Repository: chaos-edge-$ENVIRONMENT-app"
    echo "  • CloudWatch Dashboard: chaos-edge-$ENVIRONMENT-dashboard"
    echo ""
    
    # SuperBowlEdge info
    echo -e "${BLUE}SuperBowlEdge Chaos:${NC}"
    echo "  • CloudFront Distribution: Deployed"
    echo "  • ALB: Deployed"
    echo "  • WAF: Active"
    echo "  • FIS Experiments: Configured"
    echo ""
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. cd chaos-edge-terraform && make kubectl"
    echo "  2. cd chaos-edge-terraform && make dashboard"
    echo "  3. cd superbowl-edge-terraform && make demo"
    echo "  4. cd superbowl-edge-terraform && make chaos-test"
    echo ""
}

# Main function
main() {
    print_banner
    
    # Parse arguments
    DEPLOY_CHAOS=true
    DEPLOY_SUPERBOWL=true
    DEPLOY_DASHBOARDS=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --chaos-only)
                DEPLOY_SUPERBOWL=false
                shift
                ;;
            --superbowl-only)
                DEPLOY_CHAOS=false
                shift
                ;;
            --with-dashboards)
                DEPLOY_DASHBOARDS=true
                shift
                ;;
            --env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --region)
                AWS_REGION="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --chaos-only       Deploy only Chaos Edge DevOps"
                echo "  --superbowl-only   Deploy only SuperBowlEdge Chaos"
                echo "  --with-dashboards  Also deploy React dashboards"
                echo "  --env ENV          Set environment (dev/staging/prod)"
                echo "  --region REGION    Set AWS region"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment
    check_prerequisites
    setup_backend
    
    if [ "$DEPLOY_CHAOS" = true ]; then
        deploy_chaos_edge
    fi
    
    if [ "$DEPLOY_SUPERBOWL" = true ]; then
        deploy_superbowl_edge
    fi
    
    if [ "$DEPLOY_DASHBOARDS" = true ]; then
        deploy_dashboards
    fi
    
    print_summary
}

# Run main function
main "$@"
