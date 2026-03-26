# Kubernetes (Container Orchestration)

## Overview

The platform is deployed to **Kubernetes** with 3-replica deployments, health probes, resource limits, TLS-enabled Ingress, and ClusterIP services.

## Deployment

**File:** `infra/k8s/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: host-shell
  labels:
    app: host-shell
    tier: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: host-shell
  template:
    spec:
      containers:
        - name: host-shell
          image: ${ECR_REGISTRY}/platform/host-shell:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          env:
            - name: NODE_ENV
              value: production
```

### Configuration Explained

| Setting           | Value      | Purpose                                        |
| ----------------- | ---------- | ---------------------------------------------- |
| `replicas: 3`     | 3 pods     | High availability + load distribution          |
| `requests.cpu`    | 100m       | Guaranteed CPU (0.1 core)                      |
| `limits.cpu`      | 500m       | Max CPU burst (0.5 core)                       |
| `requests.memory` | 128Mi      | Guaranteed memory                              |
| `limits.memory`   | 512Mi      | Max memory (OOM killed if exceeded)            |
| `livenessProbe`   | HTTP GET / | Restart container if unhealthy (30s interval)  |
| `readinessProbe`  | HTTP GET / | Don't route traffic until ready (10s interval) |

## Service

**File:** `infra/k8s/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: host-shell
spec:
  type: ClusterIP
  selector:
    app: host-shell
  ports:
    - port: 80
      targetPort: 3000
```

`ClusterIP` — only accessible within the cluster. External traffic enters via the Ingress.

## Ingress

**File:** `infra/k8s/ingress.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: platform-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - platform.example.com
      secretName: platform-tls
  rules:
    - host: platform.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: host-shell
                port:
                  number: 80
```

### Traffic Flow

```
Internet
    │
    ▼
NGINX Ingress Controller
    │ TLS termination (platform-tls secret)
    │ SSL redirect (HTTP → HTTPS)
    ▼
Service: host-shell (ClusterIP :80)
    │
    ▼ Round-robin to pods
┌─────────┐ ┌─────────┐ ┌─────────┐
│  Pod 1  │ │  Pod 2  │ │  Pod 3  │
│  :3000  │ │  :3000  │ │  :3000  │
└─────────┘ └─────────┘ └─────────┘
```

## Communication with Other Technologies

| Technology     | How K8s Interacts                                            |
| -------------- | ------------------------------------------------------------ |
| Docker         | K8s pulls container images built by Docker                   |
| AWS ECR        | Image registry: `${ECR_REGISTRY}/platform/host-shell:latest` |
| Terraform      | Provisions ECR repositories that K8s pulls from              |
| GitHub Actions | CI pushes images to ECR; K8s pulls latest on deploy          |
| Next.js        | Standalone output runs as `node server.js` in containers     |

## Key Files

| File                        | Purpose                          |
| --------------------------- | -------------------------------- |
| `infra/k8s/deployment.yaml` | Pod template + replicas + probes |
| `infra/k8s/service.yaml`    | ClusterIP service                |
| `infra/k8s/ingress.yaml`    | TLS Ingress rules                |
