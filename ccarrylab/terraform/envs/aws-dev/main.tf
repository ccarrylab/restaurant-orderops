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
  source        = "../../modules/observability-stack"
  cluster_name  = module.aws_eks.cluster_name
  cluster_endpoint = module.aws_eks.cluster_endpoint
}

module "castai_integration" {
  source       = "../../modules/castai-eks-integration"
  cluster_name = module.aws_eks.cluster_name
}
