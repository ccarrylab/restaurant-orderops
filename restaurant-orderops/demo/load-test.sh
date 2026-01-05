#!/bin/bash
API_URL="${1:-http://localhost:8080}"; DURATION="${2:-300}"; TARGET_RPS=200
echo "🍽️  DINNER RUSH: $TARGET_RPS orders/sec for ${DURATION}s at $API_URL"
if ! command -v hey &> /dev/null; then echo "Installing hey..."; go install github.com/rakyll/hey@latest; fi
restaurants=("Pasta Palace" "Burger Barn" "Sushi Station" "Taco Temple" "Pizza Plaza")
RANDOM_RESTAURANT=${restaurants[$RANDOM % ${#restaurants[@]}]}
hey -z ${DURATION}s -q $TARGET_RPS -m POST -H "Content-Type: application/json" -d "{\"restaurant\":\"$RANDOM_RESTAURANT\",\"rush\":true}" $API_URL/api/order
