#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
TF_STATE_BUCKET="${TF_STATE_BUCKET:-ccarrylab-terraform-state-aws-dev}"

echo "==> Creating directories..."
mkdir -p doc
mkdir -p terraform/modules/aws-network
mkdir -p terraform/modules/aws-eks
mkdir -p terraform/modules/observability-stack
mkdir -p terraform/envs/aws-dev
mkdir -p gitops/argo-cd/base
mkdir -p gitops/argo-cd/overlays/dev
mkdir -p gitops/apps/platform/base
mkdir -p gitops/apps/platform/overlays/dev
mkdir -p gitops/apps/demo-app/base
mkdir -p gitops/apps/demo-app/overlays/dev
mkdir -p app/demo-microservice/src
mkdir -p .github/workflows

echo "==> Writing README.md..."
cat > README.md << 'EORMD'
# ccarrylab

AWS-focused platform engineering lab:

- Terraform-provisioned VPC and EKS cluster.
- GitHub Actions CI for Terraform plan/validate and security checks.
- Argo CD GitOps deploying a demo app onto EKS.
EORMD

echo "==> Writing Terraform env files for aws-dev..."
cat > terraform/envs/aws-dev/providers.tf << EOF2
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }

  backend "s3" {
    bucket = "${TF_STATE_BUCKET}"
    key    = "envs/aws-dev/terraform.tfstate"
    region = "${AWS_REGION}"
  }
}

provider "aws" {
  region = var.aws_region
}
EOF2

cat > terraform/envs/aws-dev/variables.tf << EOF3
variable "aws_region" {
  type        = string
  description = "AWS region for ccarrylab aws-dev"
  default     = "${AWS_REGION}"
}
EOF3

cat > terraform/envs/aws-dev/main.tf << 'EOF4'
module "aws_network" {
  source     = "../../modules/aws-network"
  aws_region = var.aws_region
}

module "aws_eks" {
  source          = "../../modules/aws-eks"
  cluster_name    = "ccarrylab-eks-dev"
  vpc_id          = module.aws_network.vpc_id
  private_subnets = module.aws_network.private_subnets
}

module "observability" {
  source           = "../../modules/observability-stack"
  cluster_name     = module.aws_eks.cluster_name
  cluster_endpoint = module.aws_eks.cluster_endpoint
}
EOF4

echo "==> Stubbing aws-network module..."
cat > terraform/modules/aws-network/main.tf << 'EOF5'
variable "aws_region" {
  type = string
}

output "vpc_id" {
  value = "vpc-PLACEHOLDER"
}

output "private_subnets" {
  value = []
}
EOF5

echo "==> Stubbing aws-eks module..."
cat > terraform/modules/aws-eks/main.tf << 'EOF6'
variable "cluster_name" {}
variable "vpc_id" {}
variable "private_subnets" {}

output "cluster_name" {
  value = var.cluster_name
}

output "cluster_endpoint" {
  value = "https://example.com"
}
EOF6

echo "==> Stubbing observability-stack module..."
cat > terraform/modules/observability-stack/main.tf << 'EOF7'
variable "cluster_name" {}
variable "cluster_endpoint" {}

output "observability_namespace" {
  value = "observability"
}
EOF7

echo "==> Creating minimal Argo CD Application and demo app manifests..."
cat > gitops/argo-cd/overlays/dev/application.yaml << 'EOF8'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ccarrylab-platform-dev
spec:
  project: default
  source:
    repoURL: https://github.com/<your-username>/ccarrylab.git
    path: gitops/apps
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: platform
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF8

cat > gitops/apps/demo-app/base/deployment.yaml << 'EOF9'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
    spec:
      containers:
        - name: demo-app
          image: public.ecr.aws/nginx/nginx:latest
          ports:
            - containerPort: 80
EOF9

cat > gitops/apps/demo-app/base/service.yaml << 'EOF10'
apiVersion: v1
kind: Service
metadata:
  name: demo-app
spec:
  type: ClusterIP
  selector:
    app: demo-app
  ports:
    - port: 80
      targetPort: 80
EOF10

echo "==> Writing GitHub Actions workflow for Terraform..."
cat > .github/workflows/terraform-checks.yml << 'EOF11'
name: Terraform AWS CI

on:
  pull_request:
    paths:
      - 'terraform/**'
  push:
    branches: [ main ]
    paths:
      - 'terraform/**'

jobs:
  terraform:
    runs-on: ubuntu-latest

    permissions:
      id-token: write
      contents: read

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_TERRAFORM_ROLE_ARN }}
          aws-region: us-east-1

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.6

      - name: Terraform fmt
        run: terraform fmt -check -recursive

      - name: Terraform validate & plan (aws-dev)
        working-directory: terraform/envs/aws-dev
        run: |
          terraform init -input=false
          terraform validate
          terraform plan -input=false
EOF11

echo "==> Done. Now run:"
echo "   git status"
echo "   git add ."
echo "   git commit -m \"Bootstrap AWS Terraform + GitOps via script\""
echo "   git push origin main"
