# =============================================================================
# Outputs - SuperBowlEdge Chaos
# =============================================================================

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.main.arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "public_subnets" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnets
}

output "haproxy_asg_name" {
  description = "HAProxy Auto Scaling Group name"
  value       = aws_autoscaling_group.haproxy.name
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

output "s3_bucket_logs" {
  description = "S3 bucket for logs"
  value       = aws_s3_bucket.logs.bucket
}

output "s3_bucket_content" {
  description = "S3 bucket for content"
  value       = aws_s3_bucket.content.bucket
}

output "cloudwatch_dashboard" {
  description = "CloudWatch Dashboard name"
  value       = aws_cloudwatch_dashboard.main.dashboard_name
}

output "fis_experiment_templates" {
  description = "FIS Experiment Template IDs"
  value = {
    ec2_stop       = try(aws_fis_experiment_template.ec2_stop.id, null)
    network_latency = try(aws_fis_experiment_template.network_latency.id, null)
    cpu_stress     = try(aws_fis_experiment_template.cpu_stress.id, null)
    alb_blackout   = try(aws_fis_experiment_template.alb_blackout.id, null)
  }
}

output "demo_commands" {
  description = "Useful commands for testing"
  value = {
    test_endpoint     = "curl http://${aws_lb.main.dns_name}/health"
    test_cloudfront   = "curl https://${aws_cloudfront_distribution.main.domain_name}"
    view_logs         = "aws logs tail /aws/alb/${var.project_name}-${var.environment} --follow"
    run_chaos_experiment = "aws fis start-experiment --experiment-template-id <template-id>"
  }
}
