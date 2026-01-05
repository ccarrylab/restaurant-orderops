.PHONY: demo build deploy test clean
demo: deploy-infra deploy-app load-test chaos-test
	@echo "✅ Demo complete!"
build:
	docker build -t ccarrylab/restaurant-api:latest .
deploy-app:
	kubectl apply -f k8s/ && kubectl wait --for=condition=ready pod -l app=restaurant-api --timeout=300s
load-test:
	@ALB=$$(kubectl get ingress restaurant-api-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'); ./demo/load-test.sh http://$$ALB
test:
	cd src/restaurant-api && go test -v ./...
clean:
	kubectl delete -f k8s/ || true
