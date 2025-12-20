# ccarrylab

ccarrylab is a multi-cloud platform engineering lab that provisions AWS EKS and GCP GKE using Terraform, secures changes with DevSecOps GitHub Actions, and delivers workloads via Argo CD GitOps.[web:23][web:25]

Main components:
- Terraform modules for AWS, GCP, and Cast.AI-integrated EKS clusters.[web:18][web:28]
- GitHub Actions workflows for Terraform plan/apply and security scanning.[web:23][web:31]
- Argo CD GitOps structure for platform components and a demo app (MongoDB on AWS, Firestore on GCP).[web:26][web:32]
