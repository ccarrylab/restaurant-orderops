#!/bin/bash
# =============================================================================
# HAProxy User Data Script - Simple Version with Nginx Backend
# =============================================================================

set -e

echo "Starting HAProxy setup..."

# Update system
yum update -y

# Install HAProxy and nginx
yum install -y haproxy nginx

# Configure nginx as simple backend on port 8080
cat > /etc/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    server {
        listen 8080;
        server_name _;

        location /health {
            return 200 '{"status":"healthy","service":"haproxy-backend","timestamp":"$time_iso8601"}';
            add_header Content-Type application/json;
        }

        location / {
            return 200 '<!DOCTYPE html>
<html>
<head>
    <title>SuperBowl Edge - HAProxy Backend</title>
    <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .status { color: #28a745; font-weight: bold; font-size: 24px; }
        .info { background: #e7f3ff; padding: 20px; border-radius: 4px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏈 SuperBowl Edge - Chaos Engineering Demo</h1>
        <p class="status">✅ HAProxy Backend is Running</p>
        <div class="info">
            <h3>System Information</h3>
            <p><strong>Service:</strong> HAProxy + Nginx Backend</p>
            <p><strong>Status:</strong> Operational</p>
            <p><strong>Backend Port:</strong> 8080</p>
            <p><strong>Frontend Port:</strong> 80 (via HAProxy)</p>
        </div>
        <p>This backend server is running for the SuperBowl Edge chaos engineering dashboard.</p>
        <p><a href="/health">Health Check</a></p>
    </div>
</body>
</html>';
            add_header Content-Type text/html;
        }
    }
}
EOF

# Configure HAProxy
cat > /etc/haproxy/haproxy.cfg << 'EOF'
global
    log /dev/log local0
    log /dev/log local1 notice
    maxconn 4096
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

# Stats page
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if TRUE

# Frontend on port 80
frontend http_front
    bind *:80
    default_backend http_back

# Backend to nginx on port 8080
backend http_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server backend1 127.0.0.1:8080 check inter 2000 rise 2 fall 3
EOF

# Start nginx first
systemctl enable nginx
systemctl start nginx

# Wait for nginx to be ready
sleep 2

# Test nginx is responding
curl -f http://127.0.0.1:8080/health || {
    echo "ERROR: Nginx health check failed"
    systemctl status nginx
    exit 1
}

# Start HAProxy
systemctl enable haproxy
systemctl start haproxy

# Wait for HAProxy to be ready
sleep 2

# Test HAProxy is responding
curl -f http://127.0.0.1:80/health || {
    echo "ERROR: HAProxy health check failed"
    systemctl status haproxy
    exit 1
}

echo "✅ HAProxy setup complete!"
echo "   Nginx backend on port 8080"
echo "   HAProxy frontend on port 80"
echo "   Health check: http://localhost/health"

# Verify both services are running
systemctl is-active nginx
systemctl is-active haproxy

echo "All services are running successfully!"
