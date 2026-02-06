#!/bin/bash

# CloudFront + ALB Diagnostic Script
# Run this to identify why CloudFront shows AccessDenied

set -e

ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:089719647189:loadbalancer/app/superbowl-edge-dev-alb/4de49584541c5284"
ALB_DNS="superbowl-edge-dev-alb-1521149394.us-east-1.elb.amazonaws.com"
CF_DOMAIN="dshw5tdn1ga3d.cloudfront.net"
CF_ID="E3CZBHL0NN1M9U"
S3_BUCKET="superbowl-edge-dev-content-089719647189"

echo "=========================================="
echo "CloudFront + ALB Diagnostic Report"
echo "=========================================="
echo ""

# Test 1: ALB Direct Access
echo "TEST 1: ALB Direct Access (Health Endpoint)"
echo "--------------------"
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$ALB_DNS/health 2>/dev/null | grep -q "200\|301\|302"; then
    echo "✅ ALB is accessible directly"
    curl -I http://$ALB_DNS/health 2>&1 | head -5
else
    echo "❌ ALB is NOT accessible"
    echo "   This is the PRIMARY issue - CloudFront can't reach ALB"
    echo "   Possible causes:"
    echo "   - ALB is internal (not internet-facing)"
    echo "   - ALB security group blocking traffic"
    echo "   - No healthy targets in target group"
fi
echo ""

# Test 2: ALB Root Access
echo "TEST 2: ALB Root Path"
echo "--------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$ALB_DNS/ 2>/dev/null || echo "000")
echo "HTTP Status: $HTTP_CODE"
if [ "$HTTP_CODE" = "000" ]; then
    echo "❌ Connection failed - cannot reach ALB"
elif [ "$HTTP_CODE" = "502" ] || [ "$HTTP_CODE" = "503" ] || [ "$HTTP_CODE" = "504" ]; then
    echo "⚠️  ALB is up but backend is down (targets unhealthy)"
else
    echo "✅ ALB responding with status $HTTP_CODE"
fi
echo ""

# Test 3: CloudFront Access
echo "TEST 3: CloudFront Distribution"
echo "--------------------"
CF_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 https://$CF_DOMAIN/ 2>/dev/null || echo "000")
echo "HTTP Status: $CF_CODE"
if [ "$CF_CODE" = "403" ]; then
    echo "❌ CloudFront returning 403 AccessDenied"
    echo "   Root cause: CloudFront cannot reach origin (ALB)"
else
    echo "Status: $CF_CODE"
fi
echo ""

# Test 4: ALB Configuration
echo "TEST 4: ALB Configuration"
echo "--------------------"
ALB_INFO=$(aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN 2>/dev/null)

SCHEME=$(echo "$ALB_INFO" | jq -r '.LoadBalancers[0].Scheme')
STATE=$(echo "$ALB_INFO" | jq -r '.LoadBalancers[0].State.Code')
SG_IDS=$(echo "$ALB_INFO" | jq -r '.LoadBalancers[0].SecurityGroups[]')

echo "Scheme: $SCHEME"
echo "State: $STATE"
echo "Security Groups: $SG_IDS"

if [ "$SCHEME" = "internal" ]; then
    echo "❌ CRITICAL: ALB is INTERNAL"
    echo "   CloudFront requires internet-facing ALB"
    echo "   You need to:"
    echo "   1. Create a new internet-facing ALB, OR"
    echo "   2. Change architecture to use S3 origin for frontend"
else
    echo "✅ ALB is internet-facing"
fi
echo ""

# Test 5: Security Group Rules
echo "TEST 5: ALB Security Group Rules"
echo "--------------------"
for SG_ID in $SG_IDS; do
    echo "Security Group: $SG_ID"
    
    INGRESS=$(aws ec2 describe-security-groups --group-ids $SG_ID --query 'SecurityGroups[0].IpPermissions' 2>/dev/null)
    
    HTTP_OPEN=$(echo "$INGRESS" | jq -r '.[] | select(.FromPort==80) | .IpRanges[] | select(.CidrIp=="0.0.0.0/0") | .CidrIp' 2>/dev/null)
    HTTPS_OPEN=$(echo "$INGRESS" | jq -r '.[] | select(.FromPort==443) | .IpRanges[] | select(.CidrIp=="0.0.0.0/0") | .CidrIp' 2>/dev/null)
    
    if [ -n "$HTTP_OPEN" ]; then
        echo "  ✅ Port 80 open to 0.0.0.0/0"
    else
        echo "  ❌ Port 80 NOT open to internet"
        echo "     Add rule: aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0"
    fi
    
    if [ -n "$HTTPS_OPEN" ]; then
        echo "  ✅ Port 443 open to 0.0.0.0/0"
    else
        echo "  ⚠️  Port 443 NOT open to internet"
        echo "     Add rule: aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0"
    fi
done
echo ""

# Test 6: Target Group Health
echo "TEST 6: Target Group Health"
echo "--------------------"
TG_ARNS=$(aws elbv2 describe-target-groups --load-balancer-arn $ALB_ARN --query 'TargetGroups[*].TargetGroupArn' --output text 2>/dev/null)

for TG_ARN in $TG_ARNS; do
    TG_NAME=$(aws elbv2 describe-target-groups --target-group-arns $TG_ARN --query 'TargetGroups[0].TargetGroupName' --output text)
    echo "Target Group: $TG_NAME"
    
    HEALTH=$(aws elbv2 describe-target-health --target-group-arn $TG_ARN 2>/dev/null)
    HEALTHY_COUNT=$(echo "$HEALTH" | jq -r '[.TargetHealthDescriptions[] | select(.TargetHealth.State=="healthy")] | length')
    TOTAL_COUNT=$(echo "$HEALTH" | jq -r '.TargetHealthDescriptions | length')
    
    echo "  Targets: $HEALTHY_COUNT healthy / $TOTAL_COUNT total"
    
    if [ "$HEALTHY_COUNT" = "0" ]; then
        echo "  ❌ NO HEALTHY TARGETS"
        echo "  Target Details:"
        echo "$HEALTH" | jq -r '.TargetHealthDescriptions[] | "    Instance: \(.Target.Id) - State: \(.TargetHealth.State) - Reason: \(.TargetHealth.Reason // "N/A")"'
    else
        echo "  ✅ Has healthy targets"
    fi
done
echo ""

# Test 7: CloudFront Origin Configuration
echo "TEST 7: CloudFront Origin Configuration"
echo "--------------------"
CF_CONFIG=$(aws cloudfront get-distribution-config --id $CF_ID 2>/dev/null)
ORIGINS=$(echo "$CF_CONFIG" | jq -r '.DistributionConfig.Origins.Items[] | "Origin ID: \(.Id)\nDomain: \(.DomainName)\nProtocol: \(.CustomOriginConfig.OriginProtocolPolicy // "N/A")\n"')

echo "$ORIGINS"

ORIGIN_DOMAIN=$(echo "$CF_CONFIG" | jq -r '.DistributionConfig.Origins.Items[0].DomainName')
if [ "$ORIGIN_DOMAIN" = "$ALB_DNS" ]; then
    echo "✅ CloudFront origin correctly points to ALB"
else
    echo "⚠️  CloudFront origin is: $ORIGIN_DOMAIN"
    echo "   Expected: $ALB_DNS"
fi
echo ""

# Test 8: S3 Bucket Check
echo "TEST 8: S3 Content Bucket"
echo "--------------------"
S3_FILES=$(aws s3 ls s3://$S3_BUCKET/ 2>/dev/null | wc -l)
if [ "$S3_FILES" -gt "0" ]; then
    echo "✅ S3 bucket has $S3_FILES items"
    echo "Top files:"
    aws s3 ls s3://$S3_BUCKET/ 2>/dev/null | head -5
else
    echo "⚠️  S3 bucket is empty or not accessible"
    echo "   Upload frontend: aws s3 sync dist/ s3://$S3_BUCKET/"
fi
echo ""

# Summary
echo "=========================================="
echo "SUMMARY & RECOMMENDED ACTIONS"
echo "=========================================="
echo ""

# Determine primary issue
if [ "$SCHEME" = "internal" ]; then
    echo "🔴 CRITICAL ISSUE: ALB is internal, not internet-facing"
    echo ""
    echo "SOLUTION OPTIONS:"
    echo "1. Create new internet-facing ALB (recommended)"
    echo "2. Use S3 as CloudFront origin for frontend"
    echo "3. Use API Gateway as public endpoint to internal ALB"
elif curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 http://$ALB_DNS/health 2>/dev/null | grep -q "000"; then
    echo "🔴 PRIMARY ISSUE: ALB not accessible from internet"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Check ALB security group rules (must allow 0.0.0.0/0 on port 80/443)"
    echo "2. Verify ALB is in public subnets"
    echo "3. Check target group has healthy instances"
elif [ "$HEALTHY_COUNT" = "0" ]; then
    echo "🟡 PRIMARY ISSUE: No healthy targets in target group"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Check HAProxy instances are running"
    echo "2. Verify HAProxy is listening on correct port"
    echo "3. Check HAProxy security group allows ALB traffic"
else
    echo "🟢 ALB appears accessible"
    echo ""
    echo "NEXT STEPS:"
    echo "1. Upload frontend to S3: aws s3 sync dist/ s3://$S3_BUCKET/"
    echo "2. Configure CloudFront with S3 origin for static content"
    echo "3. Invalidate CloudFront: aws cloudfront create-invalidation --distribution-id $CF_ID --paths '/*'"
fi

echo ""
echo "=========================================="
