FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY src/restaurant-api/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o restaurant-api .
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/restaurant-api .
EXPOSE 8080
CMD ["./restaurant-api"]
