# =============================================================================
# AWS Fault Injection Simulator (FIS) - Chaos Engineering
# =============================================================================

# IAM Role for FIS
resource "aws_iam_role" "fis" {
  name = "${var.project_name}-${var.environment}-fis-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "fis.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "fis" {
  name = "${var.project_name}-${var.environment}-fis-policy"
  role = aws_iam_role.fis.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:RebootInstances",
          "ec2:StopInstances",
          "ec2:StartInstances",
          "ec2:TerminateInstances",
          "ec2:DescribeInstances",
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:SetInstanceHealth",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetHealth",
          "elasticloadbalancing:DeregisterTargets",
          "elasticloadbalancing:RegisterTargets",
          "cloudwatch:PutMetricData",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "ssm:SendCommand",
          "ssm:ListCommands",
          "ssm:ListCommandInvocations",
          "ssm:GetCommandInvocation",
          "ssm:DescribeInstanceInformation"
        ]
        Resource = "*"
      }
    ]
  })
}

# =============================================================================
# FIS Experiment Templates
# =============================================================================

# Experiment: EC2 Instance Stop (Simulate origin failure)
resource "aws_fis_experiment_template" "ec2_stop" {
  description = "Stop EC2 instances to test HAProxy failover"
  role_arn    = aws_iam_role.fis.arn

  stop_condition {
    source = "none"
  }

  action {
    name      = "StopInstances"
    action_id = "aws:ec2:stop-instances"

    target {
      key   = "Instances"
      value = "HAProxyInstances"
    }

    parameter {
      key   = "startInstancesAfterDuration"
      value = "PT5M"
    }
  }

  target {
    name           = "HAProxyInstances"
    resource_type  = "aws:ec2:instance"
    selection_mode = "PERCENT(50)"

    resource_tag {
      key   = "Name"
      value = "${var.project_name}-${var.environment}-haproxy"
    }
  }

  log_configuration {
    log_schema_version = "2"
    cloudwatch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-ec2-stop"
    Type = "chaos-experiment"
  }
}

# Experiment: Network Latency Injection
resource "aws_fis_experiment_template" "network_latency" {
  description = "Inject network latency to HAProxy instances using SSM"
  role_arn    = aws_iam_role.fis.arn

  stop_condition {
    source = "none"
  }

  action {
    name      = "NetworkLatency"
    action_id = "aws:ssm:send-command"

    target {
      key   = "Instances"
      value = "HAProxyInstances"
    }

    parameter {
      key   = "duration"
      value = "PT5M"
    }

    parameter {
      key   = "documentArn"
      value = "arn:aws:ssm:${var.aws_region}::document/AWSFIS-Run-Network-Latency"
    }

    parameter {
      key   = "documentParameters"
      value = jsonencode({
        DurationSeconds = "300"
        DelayMilliseconds = "200"
        Interface = "eth0"
      })
    }
  }

  target {
    name           = "HAProxyInstances"
    resource_type  = "aws:ec2:instance"
    selection_mode = "ALL"

    resource_tag {
      key   = "Name"
      value = "${var.project_name}-${var.environment}-haproxy"
    }
  }

  log_configuration {
    log_schema_version = "2"
    cloudwatch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-network-latency"
    Type = "chaos-experiment"
  }
}

# Experiment: CPU Stress
resource "aws_fis_experiment_template" "cpu_stress" {
  description = "Stress CPU on HAProxy instances using SSM"
  role_arn    = aws_iam_role.fis.arn

  stop_condition {
    source = "none"
  }

  action {
    name      = "CPUStress"
    action_id = "aws:ssm:send-command"

    target {
      key   = "Instances"
      value = "HAProxyInstances"
    }

    parameter {
      key   = "duration"
      value = "PT5M"
    }

    parameter {
      key   = "documentArn"
      value = "arn:aws:ssm:${var.aws_region}::document/AWSFIS-Run-CPU-Stress"
    }

    parameter {
      key   = "documentParameters"
      value = jsonencode({
        DurationSeconds = "300"
        CPU = "0"  # 0 means use all CPUs
        LoadPercent = "80"
      })
    }
  }

  target {
    name           = "HAProxyInstances"
    resource_type  = "aws:ec2:instance"
    selection_mode = "COUNT(1)"

    resource_tag {
      key   = "Name"
      value = "${var.project_name}-${var.environment}-haproxy"
    }
  }

  log_configuration {
    log_schema_version = "2"
    cloudwatch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-cpu-stress"
    Type = "chaos-experiment"
  }
}

# Experiment: ALB Target Deregistration (Simulate origin blackout)
resource "aws_fis_experiment_template" "alb_blackout" {
  description = "Stop HAProxy instances to simulate complete origin blackout"
  role_arn    = aws_iam_role.fis.arn

  stop_condition {
    source = "none"
  }

  action {
    name      = "StopInstances"
    action_id = "aws:ec2:stop-instances"

    target {
      key   = "Instances"
      value = "HAProxyInstances"
    }

    parameter {
      key   = "startInstancesAfterDuration"
      value = "PT3M"
    }
  }

  target {
    name           = "HAProxyInstances"
    resource_type  = "aws:ec2:instance"
    selection_mode = "ALL"

    resource_tag {
      key   = "Name"
      value = "${var.project_name}-${var.environment}-haproxy"
    }
  }

  log_configuration {
    log_schema_version = "2"
    cloudwatch_logs_configuration {
      log_group_arn = "${aws_cloudwatch_log_group.fis.arn}:*"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-alb-blackout"
    Type = "chaos-experiment"
  }
}

# =============================================================================
# CloudWatch Log Group for FIS
# =============================================================================

resource "aws_cloudwatch_log_group" "fis" {
  name              = "/aws/fis/${var.project_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 90 : 30

  tags = {
    Name = "${var.project_name}-${var.environment}-fis-logs"
  }
}

# =============================================================================
# CloudWatch Dashboard for Chaos Experiments
# =============================================================================

resource "aws_cloudwatch_dashboard" "chaos" {
  dashboard_name = "${var.project_name}-${var.environment}-chaos-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ALB Request Count"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Sum" }]
          ]
          period = 60
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          title  = "ALB Target Response Time"
          region = var.aws_region
          metrics = [
            ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.main.arn_suffix, { stat = "Average" }]
          ]
          period = 60
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "HAProxy Auto Scaling Group Size"
          region = var.aws_region
          metrics = [
            ["AWS/AutoScaling", "GroupInServiceInstances", "AutoScalingGroupName", aws_autoscaling_group.haproxy.name]
          ]
          period = 60
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 6
        width  = 12
        height = 6
        properties = {
          title  = "WAF Blocked Requests"
          region = var.aws_region
          metrics = [
            ["AWS/WAFV2", "BlockedRequests", "WebACL", aws_wafv2_web_acl.main.name, "Region", var.aws_region, "Rule", "ALL"]
          ]
          period = 60
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6
        properties = {
          title  = "FIS Experiment Logs"
          region = var.aws_region
          query  = "SOURCE '/aws/fis/${var.project_name}-${var.environment}' | fields @timestamp, @message | sort @timestamp desc | limit 100"
        }
      }
    ]
  })
}

# =============================================================================
# SNS Topic for Chaos Experiment Alerts
# =============================================================================

resource "aws_sns_topic" "chaos_alerts" {
  name = "${var.project_name}-${var.environment}-chaos-alerts"

  tags = {
    Name = "${var.project_name}-${var.environment}-chaos-alerts"
  }
}

resource "aws_sns_topic_subscription" "chaos_email" {
  count     = length(var.alert_emails)
  topic_arn = aws_sns_topic.chaos_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_emails[count.index]
}
