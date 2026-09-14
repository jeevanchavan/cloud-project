# VibeTrack — AWS EKS Deployment Guide

This directory (`k8s-eks/`) contains the complete, production-ready Kubernetes manifests tailored specifically for deploying VibeTrack to **Amazon EKS (Kubernetes 1.36)** with the **AWS Load Balancer Controller (ALB)**.

---

## 1. Differences from Local KIND Deployment

| Feature / Resource | Local KIND Deployment (`k8s/`) | AWS EKS Deployment (`k8s-eks/`) | Rationale |
| :--- | :--- | :--- | :--- |
| **Ingress Controller** | `ingressClassName: nginx` (NGINX Ingress) | `ingressClassName: alb` (AWS Load Balancer Controller) | Provisions an AWS Application Load Balancer (ALB) directly via AWS APIs. |
| **Target Routing** | NodePort / In-cluster proxy | `alb.ingress.kubernetes.io/target-type: ip` | Routes traffic from ALB directly to Pod IPs via AWS VPC CNI with minimal latency. |
| **ALB Health Checks** | None (default NGINX behavior) | Service annotations `alb.ingress.kubernetes.io/healthcheck-path` (`/health` for backend, `/` for frontend) | ALB checks each target group independently. Without `/health` on backend, ALB would test `/` and fail with HTTP 404. |
| **Container Images** | Local Docker images (`vibetrack-backend:latest`, `vibetrack-frontend:latest`) | AWS ECR repository images (`287167054132.dkr.ecr.ap-south-1.amazonaws.com/...`) | EKS nodes pull images securely from private AWS ECR. |
| **Image Pull Policy** | `IfNotPresent` | `Always` | Ensures worker nodes always pull the latest image builds on pod restart/rollout. |
| **Pod Health Probes** | Missing on backend and frontend | `livenessProbe` and `readinessProbe` added to both deployments | Required by Kubernetes and ALB to ensure traffic is only routed to ready pods. |
| **Redis Port Configuration** | Port mismatch bug: `containerPort: 19121`, `port: 19121`, but `redis-server` runs on `6379` | Standardized to `6379` across containerPort, commands, probes, service, and backend config | Prevents connection drops and aligns with standard Redis ports. |
| **Redis Connectivity** | Local secret pointed to external Redis Labs Cloud (`redis-19121...redislabs.com`) | In-cluster Redis service (`REDIS_HOST: redis-service`, `REDIS_PORT: "6379"`) | Runs Redis completely inside EKS as requested, keeping traffic private within VPC. |
| **Config vs Secret Separation** | Empty `configmap.yaml`; all configs mixed into `secret.yaml` | Dedicated `configmap.yaml` for non-sensitive settings (`REDIS_HOST`, `REDIS_PORT`, `NODE_ENV`, endpoints) and `secret.yaml` strictly for credentials | Clean configuration management adhering to Twelve-Factor app principles. |
| **Secret Protection** | Plaintext credentials committed in local file | Template `secret.yaml` with placeholders + instructions to use `kubectl create secret` | Prevents credential leaks in Git. |

---

## 2. List of EKS-Specific Files

All manifests are self-contained inside `k8s-eks/`:

```
k8s-eks/
├── namespace.yaml              # Creates the 'vibetrack' namespace
├── configmap.yaml              # Application configuration (Redis host/port, NODE_ENV, CDN URL)
├── secret.yaml                 # Sensitive credentials template (Mongo URI, JWT Secret, ImageKit keys, Redis password)
├── redis-deployment.yaml       # In-cluster Redis Deployment (port 6379, with password auth and health checks)
├── redis-service.yaml          # Redis ClusterIP Service (port 6379)
├── backend-deployment.yaml     # Node.js backend Deployment (ECR image, health probes, resource limits)
├── backend-service.yaml        # Backend ClusterIP Service with ALB health check annotation (/health)
├── frontend-deployment.yaml    # React/Vite frontend Deployment (ECR image, health probes, resource limits)
├── frontend-service.yaml       # Frontend ClusterIP Service with ALB health check annotation (/)
├── backend-hpa.yaml            # Horizontal Pod Autoscaler for Backend (autoscaling/v2, 2-5 pods @ 50% CPU)
├── frontend-hpa.yaml           # Horizontal Pod Autoscaler for Frontend (autoscaling/v2, 2-5 pods @ 50% CPU)
├── ingress.yaml                # AWS ALB Ingress with path routing (/api -> backend, / -> frontend)
└── README.md                   # This deployment documentation
```

---

## 3. Deployment Flow

```
                                    INTERNET
                                       │
                                       ▼
                       AWS Application Load Balancer (ALB)
                       (Provisioned by AWS LB Controller)
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                   Path: /api/*                    Path: /*
                         ▼                           ▼
                Backend Target Group        Frontend Target Group
                Health: /health (HTTP 200)   Health: / (HTTP 200)
                         │                           │
                         ▼                           ▼
                 Backend Service              Frontend Service
                (ClusterIP: 3000)             (ClusterIP: 80)
                         │                           │
                         ▼                           ▼
                 Backend Pods (x2)            Frontend Pods (x2)
                 (Node.js / Express)          (React / Vite Preview)
                   Port 3000                    Port 5173
                   │            │
                   │            ▼
                   │     Redis Service (ClusterIP: 6379)
                   │            │
                   │            ▼
                   │      Redis Pod (x1)
                   │      Token Blacklist Cache
                   ▼
             MongoDB Atlas
             (Managed Cloud DB)
```

---

## 4. Prerequisites

Before deploying the manifests to EKS:

1. **AWS CLI & EKS Context Configured**:
   ```bash
   aws eks update-kubeconfig --region ap-south-1 --name vibetrack-cluster
   kubectl get nodes
   ```
   *Verify 2 worker nodes are in `Ready` state.*

2. **AWS Load Balancer Controller Installed**:
   The cluster must have the AWS Load Balancer Controller installed and running in `kube-system`:
   ```bash
   kubectl get deployment -n kube-system aws-load-balancer-controller
   ```

3. **Public Subnet Tags for ALB**:
   Because the worker nodes are in private subnets, the VPC's **public subnets** (where the internet-facing ALB will be placed) must have the tag:
   - Key: `kubernetes.io/role/elb`
   - Value: `1`

   *(If subnets cannot be tagged, uncomment `alb.ingress.kubernetes.io/subnets` in `k8s-eks/ingress.yaml` and provide comma-separated public subnet IDs).*

4. **Metrics Server Installed (for HPA)**:
   Ensure Metrics Server is running in the cluster so HPA can collect CPU metrics:
   ```bash
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   kubectl get deployment -n kube-system metrics-server
   ```

5. **MongoDB Atlas Network Access**:
   Ensure MongoDB Atlas Network Access whitelist allows the NAT Gateway Elastic IP (EIP) of your EKS private subnets (or `0.0.0.0/0` during testing).

6. **ECR Images Pushed**:
   Ensure both images exist in your ECR registry:
   - `287167054132.dkr.ecr.ap-south-1.amazonaws.com/vibetrack-backend:latest`
   - `287167054132.dkr.ecr.ap-south-1.amazonaws.com/vibetrack-frontend:latest`

---

## 5. Deployment Order & Exact Kubectl Commands

Run the following commands in exact sequential order:

### Step 1: Create Namespace
```bash
kubectl apply -f k8s-eks/namespace.yaml
```

### Step 2: Apply ConfigMap & Secret
**Option A: Apply Secret using kubectl command (Recommended — avoids writing secrets to disk):**
```bash
kubectl apply -f k8s-eks/configmap.yaml

kubectl create secret generic vibetrack-secret \
  --namespace vibetrack \
  --from-literal=MONGO_URI="mongodb+srv://<USER>:<PASSWORD>@cluster0.kfmiccf.mongodb.net/VibeTrack?appName=Cluster0" \
  --from-literal=JWT_SECRET="<YOUR_JWT_SECRET>" \
  --from-literal=IMAGEKIT_PRIVATE_KEY="<YOUR_IMAGEKIT_PRIVATE_KEY>" \
  --from-literal=IMAGEKIT_PUBLIC_KEY="<YOUR_IMAGEKIT_PUBLIC_KEY>" \
  --from-literal=REDIS_PASSWORD="<YOUR_REDIS_PASSWORD>" \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Option B: Edit `k8s-eks/secret.yaml` and apply (ensure it is NOT committed to Git):**
```bash
kubectl apply -f k8s-eks/configmap.yaml
kubectl apply -f k8s-eks/secret.yaml
```

### Step 3: Deploy Redis
```bash
kubectl apply -f k8s-eks/redis-deployment.yaml
kubectl apply -f k8s-eks/redis-service.yaml
```

### Step 4: Deploy Backend
```bash
kubectl apply -f k8s-eks/backend-deployment.yaml
kubectl apply -f k8s-eks/backend-service.yaml
```

### Step 5: Deploy Frontend
```bash
kubectl apply -f k8s-eks/frontend-deployment.yaml
kubectl apply -f k8s-eks/frontend-service.yaml
```

### Step 6: Deploy Horizontal Pod Autoscalers
```bash
kubectl apply -f k8s-eks/backend-hpa.yaml
kubectl apply -f k8s-eks/frontend-hpa.yaml
```

### Step 7: Deploy Ingress (ALB)
```bash
kubectl apply -f k8s-eks/ingress.yaml
```

---

## 6. Verification Commands

Run these commands to verify every layer of your deployment:

### Check Pods, Deployments, and Services
```bash
kubectl get all -n vibetrack
```

### Verify Rollout Status
```bash
kubectl rollout status deployment/redis-deployment -n vibetrack
kubectl rollout status deployment/backend-deployment -n vibetrack
kubectl rollout status deployment/frontend-deployment -n vibetrack
```

### Verify Redis Internal Connectivity & Authentication
```bash
# Test Redis connection from inside cluster
kubectl run redis-test --rm -it --restart='Never' --namespace vibetrack \
  --image=redis:7-alpine -- sh -c 'redis-cli -h redis-service -p 6379 -a "$REDIS_PASSWORD" ping' \
  --env="REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>"
# Expected output: PONG
```

### Verify Backend Health Endpoint from Pod
```bash
kubectl run curl-test --rm -it --restart='Never' --namespace vibetrack \
  --image=curlimages/curl -- curl -s http://backend-service:3000/health
# Expected output: Welcome to VibeTrack API
```

### Check Backend Logs for Database & Redis Connection
```bash
kubectl logs -n vibetrack -l app=backend --tail=50
# Expected lines in log:
# - "Connected to DB"
# - "server is connected to redis"
# - "Server is running on port 3000"
```

### Verify HPA Status
```bash
kubectl get hpa -n vibetrack
# Verify TARGETS shows current CPU percentage / 50% (not <unknown>/50%)
```

### Inspect Ingress & Retrieve ALB DNS Name
```bash
kubectl get ingress -n vibetrack
# Wait 2-3 minutes for ADDRESS column to populate with:
# k8s-vibetrack-xxxxxxx.ap-south-1.elb.amazonaws.com
```

### Inspect AWS Load Balancer Controller Logs (if ALB does not appear)
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller --tail=100
```

---

## 7. Manual Steps & Outside Configurations

1. **HTTPS & MediaPipe Camera Permission (Critical)**:
   - Modern browsers (Chrome, Safari, Edge) block webcam access (`navigator.mediaDevices.getUserMedia`) over plain HTTP unless on `localhost`.
   - For production emotion detection via MediaPipe, create a public certificate in **AWS Certificate Manager (ACM)** in region `ap-south-1`.
   - Uncomment the SSL annotations in `k8s-eks/ingress.yaml`:
     ```yaml
     alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
     alb.ingress.kubernetes.io/ssl-redirect: '443'
     alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:ap-south-1:287167054132:certificate/<YOUR_CERT_ID>
     ```
   - In Amazon Route 53 (or your DNS provider), create a CNAME / Alias record pointing your custom domain to the ALB DNS name.

2. **MongoDB Atlas IP Whitelist**:
   - Because EKS worker nodes reside in private subnets, outgoing internet requests to Atlas pass through the VPC's NAT Gateway.
   - Whitelist the Elastic IP (EIP) of your NAT Gateway in MongoDB Atlas:
     *Atlas Console -> Security -> Network Access -> Add IP Address*.

---

## 8. Expected Status After Deployment

```
NAME                                      READY   STATUS    RESTARTS   AGE
pod/backend-deployment-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
pod/backend-deployment-xxxxxxxxxx-yyyyy   1/1     Running   0          2m
pod/frontend-deployment-xxxxxxxx-aaaaa    1/1     Running   0          2m
pod/frontend-deployment-xxxxxxxx-bbbbb    1/1     Running   0          2m
pod/redis-deployment-xxxxxxxxxx-zzzzz     1/1     Running   0          2m

NAME                       TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
service/backend-service    ClusterIP   10.100.xxx.xxx   <none>        3000/TCP   2m
service/frontend-service   ClusterIP   10.100.yyy.yyy   <none>        80/TCP     2m
service/redis-service      ClusterIP   10.100.zzz.zzz   <none>        6379/TCP   2m

NAME                                  REFERENCE                        TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling   Deployment/backend-deployment    1%/50%    2         5         2          2m
horizontalpodautoscaler.autoscaling   Deployment/frontend-deployment   1%/50%    2         5         2          2m

NAME                                  CLASS   HOSTS   ADDRESS                                                                   PORTS   AGE
ingress.networking.k8s.io/vibetrack   alb     *       k8s-vibetrack-vibetrack-xxxxxx.ap-south-1.elb.amazonaws.com               80      2m
```
