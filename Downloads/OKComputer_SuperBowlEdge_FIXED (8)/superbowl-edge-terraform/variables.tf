# =============================================================================
# Variables - SuperBowlEdge Chaos
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "superbowl-edge"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# =============================================================================
# HAProxy Configuration
# =============================================================================

variable "haproxy_instance_type" {
  description = "EC2 instance type for HAProxy servers"
  type        = string
  default     = "t3.medium"
}

variable "haproxy_min_size" {
  description = "Minimum number of HAProxy instances"
  type        = number
  default     = 2
}

variable "haproxy_max_size" {
  description = "Maximum number of HAProxy instances"
  type        = number
  default     = 4
}

variable "haproxy_desired_capacity" {
  description = "Desired number of HAProxy instances"
  type        = number
  default     = 2
}

# =============================================================================
# WAF Configuration
# =============================================================================

variable "waf_rate_limit" {
  description = "Rate limit for WAF (requests per 5 minutes)"
  type        = number
  default     = 2000
}

variable "waf_blocked_countries" {
  description = "List of country codes to block"
  type        = list(string)
  default     = []
}

# =============================================================================
# CloudFront Configuration
# =============================================================================

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_All"

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.cloudfront_price_class)
    error_message = "Price class must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "cloudfront_rate_limit" {
  description = "Rate limit for CloudFront WAF"
  type        = number
  default     = 5000
}

# =============================================================================
# Monitoring Configuration
# =============================================================================

variable "alert_emails" {
  description = "List of email addresses for alerts"
  type        = list(string)
  default     = []
}

variable "enable_fis" {
  description = "Enable AWS Fault Injection Simulator"
  type        = bool
  default     = true
}

variable "enable_shield_advanced" {
  description = "Enable AWS Shield Advanced"
  type        = bool
  default     = false
}
