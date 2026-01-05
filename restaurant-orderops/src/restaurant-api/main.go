package main
import ("encoding/json"; "fmt"; "log"; "math/rand"; "net/http"; "os"; "time")
type Order struct {OrderID string `json:"order_id"`; Restaurant string `json:"restaurant"`; ETA string `json:"eta"`; Status string `json:"status"`; Timestamp time.Time `json:"timestamp"`}
type OrderRequest struct {Restaurant string `json:"restaurant"`; Rush bool `json:"rush"`}
var orderCount int64
func main() {
    rand.Seed(time.Now().UnixNano()); http.HandleFunc("/health", healthHandler); http.HandleFunc("/ready", readyHandler)
    http.HandleFunc("/api/order", orderHandler); http.HandleFunc("/api/metrics", metricsHandler)
    port := os.Getenv("PORT"); if port == "" {port = "8080"}
    log.Printf("🍽️  Restaurant API starting on port %s", port); log.Fatal(http.ListenAndServe(":"+port, nil))
}
func healthHandler(w http.ResponseWriter, r *http.Request) {w.WriteHeader(http.StatusOK); fmt.Fprintf(w, "OK")}
func readyHandler(w http.ResponseWriter, r *http.Request) {w.WriteHeader(http.StatusOK); fmt.Fprintf(w, "READY")}
func orderHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return}
    var req OrderRequest; if err := json.NewDecoder(r.Body).Decode(&req); err != nil {http.Error(w, "Invalid request", http.StatusBadRequest); return}
    if req.Rush {time.Sleep(time.Duration(50+rand.Intn(100)) * time.Millisecond)} else {time.Sleep(time.Duration(100+rand.Intn(200)) * time.Millisecond)}
    orderCount++; order := Order{OrderID: fmt.Sprintf("ORD-%d-%d", time.Now().Unix(), orderCount), Restaurant: req.Restaurant, ETA: time.Now().Add(30 * time.Minute).Format("15:04"), Status: "confirmed", Timestamp: time.Now()}
    w.Header().Set("Content-Type", "application/json"); json.NewEncoder(w).Encode(order); log.Printf("📦 Order: %s at %s", order.OrderID, order.Restaurant)
}
func metricsHandler(w http.ResponseWriter, r *http.Request) {
    metrics := map[string]interface{}{"orders_total": orderCount, "uptime_seconds": time.Since(time.Now().Add(-time.Hour)).Seconds(), "status": "healthy"}
    w.Header().Set("Content-Type", "application/json"); json.NewEncoder(w).Encode(metrics)
}
