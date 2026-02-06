#!/bin/bash

# HAProxy Target Health Fix Script

set -e

echo "=========================================="
echo "HAProxy Target Health Diagnostic & Fix"
echo "=========================================="
echo ""

ASG_NAME="superbowl-edge-dev-haproxy-asg"
TG_ARN="arn:aws:elasticloadbalancing:us-east-1:089719647189:targetgroup/superbowl-edge-dev-tg/XXXXX"

# Step 1: Check ASG and instances
echo "STEP 1: Checking Auto Scaling Group"
echo "--------------------"

ASG_INFO=$(aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names $ASG_NAME 2>/dev/null)

DESIRED=$(echo "$ASG_INFO" | jq -r '.AutoScalingGroups[0].DesiredCapacity')
MIN=$(echo "$ASG_INFO" | jq -r '.AutoScalingGroups[0].MinSize')
MAX=$(echo "$ASG_INFO" | jq -r '.AutoScalingGroups[0].MaxSize')
INSTANCES=$(echo "$ASG_INFO" | jq -r '.AutoScalingGroups[0].Instances[] | .InstanceId')

echo "Desired Capacity: $DESIRED"
echo "Min/Max: $MIN/$MAX"
echo "Instances:"
echo "$INSTANCES"
echo ""

# Step 2: Check instance states
echo "STEP 2: Checking Instance States"
echo "--------------------"
for INSTANCE_ID in $INSTANCES; do
    STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].State.Name' --output text 2>/dev/null)
    echo "Instance $INSTANCE_ID: $STATE"
done
echo ""

# Step 3: Check security group
echo "STEP 3: Checking HAProxy Security Group"
echo "--------------------"
INSTANCE_ID=$(echo "$INSTANCES" | head -1)
if [ -n "$INSTANCE_ID" ]; then
    SG_ID=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' --output text)
    echo "Security Group: $SG_ID"
    
    # Check if ALB security group can reach HAProxy
    ALB_SG="sg-078adc51d71ee1e8a"
    
    echo ""
    echo "Checking if HAProxy SG allows traffic from ALB SG..."
    INGRESS=$(aws ec2 describe-security-groups --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions' 2>/dev/null)
    
    # Check for port 80 from ALB SG
    ALLOWS_80=$(echo "$INGRESS" | jq -r --arg alb_sg "$ALB_SG" '.[] | select(.FromPort==80) | .UserIdGroupPairs[] | select(.GroupId==$alb_sg) | .GroupId' 2>/dev/null)
    
    if [ -n "$ALLOWS_80" ]; then
        echo "✅ HAProxy allows port 80 from ALB"
    else
        echo "❌ HAProxy does NOT allow port 80 from ALB"
        echo "   FIX: aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --source-group $ALB_SG"
    fi
fi
echo ""

# Step 4: Check target group health check settings
echo "STEP 4: Target Group Health Check Configuration"
echo "--------------------"
TG_ARN=$(aws elbv2 describe-target-groups --names superbowl-edge-dev-tg --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null)
TG_INFO=$(aws elbv2 describe-target-groups --target-group-arns $TG_ARN 2>/dev/null)

HC_PROTOCOL=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthCheckProtocol')
HC_PORT=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthCheckPort')
HC_PATH=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthCheckPath')
HC_INTERVAL=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthCheckIntervalSeconds')
HC_TIMEOUT=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthCheckTimeoutSeconds')
HEALTHY_THRESHOLD=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].HealthyThresholdCount')
UNHEALTHY_THRESHOLD=$(echo "$TG_INFO" | jq -r '.TargetGroups[0].UnhealthyThresholdCount')

echo "Protocol: $HC_PROTOCOL"
echo "Port: $HC_PORT"
echo "Path: $HC_PATH"
echo "Interval: $HC_INTERVAL seconds"
echo "Timeout: $HC_TIMEOUT seconds"
echo "Healthy Threshold: $HEALTHY_THRESHOLD"
echo "Unhealthy Threshold: $UNHEALTHY_THRESHOLD"
echo ""

# Step 5: Try to connect to HAProxy instance directly
echo "STEP 5: Testing HAProxy Instance Directly"
echo "--------------------"
INSTANCE_ID=$(echo "$INSTANCES" | head -1)
if [ -n "$INSTANCE_ID" ]; then
    PRIVATE_IP=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].PrivateIpAddress' --output text)
    echo "Instance: $INSTANCE_ID"
    echo "Private IP: $PRIVATE_IP"
    echo ""
    echo "To test HAProxy from a bastion/EC2 in same VPC:"
    echo "  curl -v http://$PRIVATE_IP:$HC_PORT$HC_PATH"
    echo ""
    
    # Check if we can SSH
    echo "To check HAProxy logs via SSM:"
    echo "  aws ssm start-session --target $INSTANCE_ID"
    echo "  Then run: sudo systemctl status haproxy"
    echo "           sudo journalctl -u haproxy -n 50"
fi
echo ""

# Step 6: Check CloudWatch logs
echo "STEP 6: Recent HAProxy Logs (if available)"
echo "--------------------"
LOG_GROUP="/aws/ec2/haproxy"
echo "Checking log group: $LOG_GROUP"

if aws logs describe-log-groups --log-group-name-prefix "$LOG_GROUP" 2>/dev/null | grep -q "$LOG_GROUP"; then
    echo "✅ Log group exists"
    echo ""
    echo "Recent errors:"
    aws logs filter-log-events \
        --log-group-name "$LOG_GROUP" \
        --filter-pattern "error" \
        --max-items 5 \
        2>/dev/null || echo "No recent errors or no logs yet"
else
    echo "⚠️  Log group not found - logs may not be configured"
fi
echo ""

echo "=========================================="
echo "RECOMMENDED FIXES"
echo "=========================================="
echo ""

echo "🔴 ISSUE: All HAProxy targets are unhealthy"
echo ""
echo "Most likely causes:"
echo "1. HAProxy is not running on the instances"
echo "2. HAProxy is not listening on port $HC_PORT"
echo "3. Health check path $HC_PATH is not responding"
echo "4. Security group blocking ALB health checks"
echo ""

echo "IMMEDIATE ACTIONS:"
echo ""
echo "1. SSH into HAProxy instance and check service:"
echo "   aws ssm start-session --target $INSTANCE_ID"
echo "   sudo systemctl status haproxy"
echo "   sudo netstat -tulpn | grep :$HC_PORT"
echo "   curl http://localhost:$HC_PORT$HC_PATH"
echo ""

echo "2. Check HAProxy configuration:"
echo "   cat /etc/haproxy/haproxy.cfg"
echo ""

echo "3. View HAProxy logs:"
echo "   sudo journalctl -u haproxy -f"
echo ""

echo "4. If HAProxy is not installed/running:"
echo "   # Check user data script executed properly"
echo "   cat /var/log/cloud-init-output.log"
echo ""

echo "5. Fix security group if needed:"
if [ -n "$SG_ID" ] && [ -z "$ALLOWS_80" ]; then
    echo "   aws ec2 authorize-security-group-ingress \\"
    echo "     --group-id $SG_ID \\"
    echo "     --protocol tcp \\"
    echo "     --port 80 \\"
    echo "     --source-group sg-078adc51d71ee1e8a"
fi
echo ""

echo "6. If HAProxy is completely broken, recreate instances:"
echo "   # Terminate unhealthy instances (ASG will recreate)"
for INSTANCE_ID in $INSTANCES; do
    echo "   aws ec2 terminate-instances --instance-ids $INSTANCE_ID"
done
echo ""

echo "7. Check if user data script is correct:"
echo "   # Get launch template"
echo "   aws autoscaling describe-auto-scaling-groups \\"
echo "     --auto-scaling-group-names $ASG_NAME \\"
echo "     --query 'AutoScalingGroups[0].LaunchTemplate'"
echo ""

echo "=========================================="
