# FinFlow - Cloud-Native MERN Expense Tracker & DevOps Integration

FinFlow is a cloud-native MERN stack Expense Tracker and Budget Planner transformed with a complete production-grade DevOps workflow. The project features Infrastructure as Code (Terraform), continuous integration/deployment (Jenkins CI/CD), container orchestration (Amazon EKS), ingress routing (AWS ALB Load Balancer), and full cluster observability (Prometheus & Grafana).

---

## 🏗️ System Architecture

```text
                                  +-------------------------------------------------+
                                  |                 AWS CLOUD VPC                   |
                                  |                                                 |
                                  |   +-----------------------------------------+   |
                                  |   |           Public Subnets (AZ1/AZ2)      |   |
                                  |   |                                         |   |
  Developer ---> Push ---> GitHub |   |  +------------+       +-------------+   |   |
                                  |   |  | Jenkins VM |       | Application |   |   |
                                  |   |  | (EC2 Host) |       |   ALB LB    |   |   |
                                  |   |  +-----+------+       +------+------+   |   |
                                  |   +--------|---------------------|----------+   |
                                  |            | (CI/CD Deploy)      | (Ingress Route)
                                  |   +--------v---------------------v----------+   |
                                  |   |          Private Subnets (AZ1/AZ2)      |   |
                                  |   |                                         |   |
                                  |   |  +-----------------------------------+  |   |
                                  |   |  |           Amazon EKS Cluster      |  |   |
  AWS ECR <--- Build/Push --------+---|--+  +-----------------------------+  |  |   |
  Registry                        |   |  |  |      Namespace: finflow     |  |  |   |
  (Docker Frontend/Backend)       |   |  |  |                             |  |  |   |
                                  |   |  |  |  +----------+  +---------+  |  |  |   |
                                  |   |  |  |  | Frontend |  | Backend |  |  |  |   |
                                  |   |  |  |  |   Pods   |  |  Pods   |  |  |   |
                                  |   |  |  |  +----------+  +----+----+  |  |  |   |
                                  |   |  |  +---------------------|-------+  |  |   |
                                  |   +---------------------------|-------------+   |
                                  +-------------------------------|-----------------+
                                                                  |
                                                                  v
                                                           MongoDB Atlas
                                                           (Cloud Database)
```

---

## 📁 Repository Directory Structure

```text
├── terraform/
│   ├── modules/
│   │   ├── vpc/             # VPC, subnets, route tables, Internet/NAT Gateways
│   │   ├── eks/             # EKS Control Plane, Worker Nodes, IAM Roles
│   │   └── jenkins/         # Security groups and EC2 host instance
│   ├── main.tf              # root wrapper assembling infrastructure modules
│   ├── variables.tf         # Parameter inputs (node sizes, regions, keys)
│   └── outputs.tf           # Prints generated IP addresses and ECR registries
├── kubernetes/
│   ├── namespace.yaml       # Namespace definition ('finflow')
│   ├── configmap.yaml       # Public environment configurations (API URL)
│   ├── secrets.yaml         # Secures Atlas URI & JWT key in base64
│   ├── backend.yaml         # Backend Deployment (2 replicas) & ClusterIP Service
│   ├── frontend.yaml        # Frontend Deployment (2 replicas) & ClusterIP Service
│   ├── ingress.yaml         # Routing parameters for AWS Application Load Balancer
│   └── hpa.yaml             # Horizontal Pod Autoscaling limits
├── jenkins/
│   └── Jenkinsfile          # Multi-stage CI/CD pipeline automation
├── monitoring/
│   └── prometheus-grafana-values.yaml  # Helm values for EKS cluster observability
├── nginx/
│   └── default.conf         # Serving configuration for React inside containers
```

---

## 🚀 Setup & Deployment Guide

### Phase 1: Terraform Infrastructure Provisioning

1. Navigate to the Terraform directory:
   ```bash
   cd terraform
   ```
2. Initialize Terraform to download providers and modules:
   ```bash
   terraform init
   ```
3. Run a dry-run plan to verify resources:
   ```bash
   terraform plan
   ```
4. Deploy the infrastructure to AWS (requires AWS CLI access configured):
   ```bash
   terraform apply --auto-approve
   ```
   *Note: Creating EKS clusters and managed node groups takes about 10-15 minutes.*

---

### Phase 2: Jenkins CI/CD Setup

1. Copy the `jenkins_public_ip` outputted by Terraform and open the UI in your browser:
   ```text
   http://<JENKINS_PUBLIC_IP>:8080
   ```
2. Fetch the initial administrator password from the EC2 instance log:
   ```bash
   ssh -i your-ssh-key.pem ec2-user@<JENKINS_PUBLIC_IP>
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Set up EKS credentials inside Jenkins:
   - Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**.
   - Add new credentials of type **AWS Credentials** and enter your `AWS Access Key ID` and `AWS Secret Access Key`.
   - Set the ID of these credentials as `aws-credentials` (matching the ID in `Jenkinsfile`).
4. Configure a new Pipeline Job:
   - Select **New Item**, choose **Pipeline**, and name it `FinFlow-Deployment`.
   - Under **Pipeline Definition**, select **Pipeline script from SCM**.
   - Input your Github Repository URL and set the script path to `jenkins/Jenkinsfile`.
   - Click **Save** and trigger **Build Now**.

---

### Phase 3: Exposing the Application (Ingress ALB)

Once Jenkins triggers the EKS deployments, you must configure the AWS Load Balancer Controller to discover the ingress resource:

1. Connect your local terminal to the EKS cluster using the Terraform outputs command:
   ```bash
   aws eks update-kubeconfig --name finflow-eks-cluster --region us-east-1
   ```
2. Verify pods are running:
   ```bash
   kubectl get pods -n finflow
   ```
3. Install the AWS Load Balancer Controller using Helm to dynamically register your ingress paths to an Application Load Balancer:
   ```bash
   helm repo add eks https://aws.github.io/eks-charts
   helm repo update
   
   helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
     -n kube-system \
     --set clusterName=finflow-eks-cluster \
     --set serviceAccount.create=true
   ```
4. Retrieve the public address of your Load Balancer:
   ```bash
   kubectl get ingress -n finflow
   ```
   *Visit the returned ALB address in your browser to run the Expense Tracker.*

---

### Phase 4: Cluster Monitoring with Prometheus & Grafana

We deploy the Prometheus Operator stack to monitor EKS cluster components and pod resource usage:

1. Add the Helm repositories:
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm repo update
   ```
2. Install the monitoring stack using the optimized overrides file:
   ```bash
   helm install monitoring prometheus-community/kube-prometheus-stack \
     -f monitoring/prometheus-grafana-values.yaml \
     -n finflow
   ```
3. Retrieve the generated Grafana Load Balancer address:
   ```bash
   kubectl get svc -n finflow | grep monitoring-grafana
   ```
4. Access Grafana:
   - Open the returned Load Balancer URL in your web browser.
   - Enter Username: `admin` and Password: `admin` (matching config values).
   - Navigate to **Dashboards** and select default Kubernetes node/pod health dashboards.

---

## 🔒 Security Configurations

- **Network Segmentation**: Public subnets are reserved strictly for the Application Load Balancer and Jenkins. All EKS worker nodes run inside isolated Private Subnets with egress traffic routed via a NAT Gateway.
- **Credential Storage**: Secret keys (JWT Keys and database Atlas URIs) are stored as base64-encoded properties in EKS `Opaque` secrets, preventing plaintext exposure in config charts.
- **ECR Authorization**: Pod nodes use AmazonEC2ContainerRegistryReadOnly IAM roles to securely fetch container images without storing AWS keys on the workers.
