variable "cluster_name" {}
variable "vpc_id" {}
variable "private_subnets" {}

output "cluster_name" {
  value = var.cluster_name
}

output "cluster_endpoint" {
  value = "https://example.com"
}
