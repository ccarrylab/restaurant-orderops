# =============================================================================
# Kubernetes Resources - Chaos Edge DevOps
# =============================================================================

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

# =============================================================================
# Namespace
# =============================================================================

resource "kubernetes_namespace" "chaos_edge" {
  metadata {
    name = "chaos-edge"
    labels = {
      name        = "chaos-edge"
      environment = var.environment
    }
  }

  depends_on = [module.eks]
}

resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      name        = "monitoring"
      environment = var.environment
    }
  }

  depends_on = [module.eks]
}

resource "kubernetes_namespace" "chaos_mesh" {
  count = var.enable_chaos_mesh ? 1 : 0
  
  metadata {
    name = "chaos-mesh"
    labels = {
      name        = "chaos-mesh"
      environment = var.environment
    }
  }

  depends_on = [module.eks]
}

# =============================================================================
# NGINX Ingress Controller
# =============================================================================

resource "helm_release" "nginx_ingress" {
  name       = "nginx-ingress"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = kubernetes_namespace.chaos_edge.metadata[0].name
  version    = "4.9.0"

  set {
    name  = "controller.replicaCount"
    value = "2"
  }

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.service.annotations.service\.beta\.kubernetes\.io/aws-load-balancer-type"
    value = "nlb"
  }

  set {
    name  = "controller.metrics.enabled"
    value = "true"
  }

  set {
    name  = "controller.podDisruptionBudget.enabled"
    value = "true"
  }

  set {
    name  = "controller.podDisruptionBudget.minAvailable"
    value = "1"
  }

  depends_on = [module.eks, kubernetes_namespace.chaos_edge]
}

# =============================================================================
# Prometheus & Grafana (Kube Prometheus Stack)
# =============================================================================

resource "helm_release" "prometheus" {
  count = var.enable_prometheus ? 1 : 0

  name       = "prometheus"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  version    = "56.0.0"

  set {
    name  = "grafana.enabled"
    value = "true"
  }

  set {
    name  = "grafana.adminPassword"
    value = "chaosedge2026"
  }

  set {
    name  = "prometheus.prometheusSpec.retention"
    value = "30d"
  }

  set {
    name  = "prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage"
    value = "50Gi"
  }

  values = [
    <<-EOT
    grafana:
      dashboardProviders:
        dashboardproviders.yaml:
          apiVersion: 1
          providers:
          - name: 'default'
            orgId: 1
            folder: ''
            type: file
            disableDeletion: false
            editable: true
            options:
              path: /var/lib/grafana/dashboards/default
      dashboards:
        default:
          chaos-edge:
            gnetId: 1860
            revision: 27
            datasource: prometheus
    EOT
  ]

  depends_on = [module.eks, kubernetes_namespace.monitoring]
}

# =============================================================================
# Chaos Mesh
# =============================================================================

resource "helm_release" "chaos_mesh" {
  count = var.enable_chaos_mesh ? 1 : 0

  name       = "chaos-mesh"
  repository = "https://charts.chaos-mesh.org"
  chart      = "chaos-mesh"
  namespace  = kubernetes_namespace.chaos_mesh[0].metadata[0].name
  version    = "2.6.3"

  set {
    name  = "dashboard.create"
    value = "true"
  }

  set {
    name  = "dashboard.securityMode"
    value = "false"
  }

  depends_on = [module.eks, kubernetes_namespace.chaos_mesh]
}

# =============================================================================
# Sample Application Deployment
# =============================================================================

resource "kubernetes_deployment" "app" {
  metadata {
    name      = "chaos-edge-app"
    namespace = kubernetes_namespace.chaos_edge.metadata[0].name
    labels = {
      app         = "chaos-edge-app"
      environment = var.environment
    }
  }

  spec {
    replicas = 3

    selector {
      match_labels = {
        app = "chaos-edge-app"
      }
    }

    template {
      metadata {
        labels = {
          app         = "chaos-edge-app"
          environment = var.environment
        }
      }

      spec {
        container {
          name  = "app"
          image = "nginx:alpine"

          port {
            container_port = 80
            name           = "http"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 80
            }
            initial_delay_seconds = 30
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 5
          }
        }
      }
    }
  }

  depends_on = [module.eks, kubernetes_namespace.chaos_edge]
}

resource "kubernetes_service" "app" {
  metadata {
    name      = "chaos-edge-app"
    namespace = kubernetes_namespace.chaos_edge.metadata[0].name
  }

  spec {
    selector = {
      app = "chaos-edge-app"
    }

    port {
      port        = 80
      target_port = 80
      name        = "http"
    }

    type = "ClusterIP"
  }

  depends_on = [kubernetes_deployment.app]
}

resource "kubernetes_ingress_v1" "app" {
  metadata {
    name      = "chaos-edge-app"
    namespace = kubernetes_namespace.chaos_edge.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"                = "nginx"
      "nginx.ingress.kubernetes.io/rewrite-target" = "/"
    }
  }

  spec {
    rule {
      http {
        path {
          path = "/"
          backend {
            service {
              name = kubernetes_service.app.metadata[0].name
              port {
                number = 80
              }
            }
          }
        }
      }
    }
  }

  depends_on = [helm_release.nginx_ingress, kubernetes_service.app]
}

# =============================================================================
# Horizontal Pod Autoscaler
# =============================================================================

resource "kubernetes_horizontal_pod_autoscaler_v2" "app" {
  metadata {
    name      = "chaos-edge-app-hpa"
    namespace = kubernetes_namespace.chaos_edge.metadata[0].name
  }

  spec {
    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment.app.metadata[0].name
    }

    min_replicas = 2
    max_replicas = 10

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 80
        }
      }
    }
  }

  depends_on = [kubernetes_deployment.app]
}

# =============================================================================
# Pod Disruption Budget
# =============================================================================

resource "kubernetes_pod_disruption_budget_v1" "app" {
  metadata {
    name      = "chaos-edge-app-pdb"
    namespace = kubernetes_namespace.chaos_edge.metadata[0].name
  }

  spec {
    min_available = 1
    selector {
      match_labels = {
        app = "chaos-edge-app"
      }
    }
  }

  depends_on = [kubernetes_deployment.app]
}
