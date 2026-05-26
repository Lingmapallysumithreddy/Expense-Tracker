terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Network Infrastructure Module
module "vpc" {
  source               = "./modules/vpc"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  env_prefix           = var.env_prefix
  cluster_name         = var.cluster_name
}

# Jenkins CI/CD EC2 Host Module
module "jenkins" {
  source           = "./modules/jenkins"
  vpc_id           = module.vpc.vpc_id
  public_subnet_id = module.vpc.public_subnet_ids[0]
  instance_type    = var.jenkins_instance_type
  key_name         = var.jenkins_key_name
  env_prefix       = var.env_prefix
}

# EKS Cluster Control Plane & Node Group Module
module "eks" {
  source           = "./modules/eks"
  cluster_name     = var.cluster_name
  env_prefix       = var.env_prefix
  subnet_ids       = module.vpc.private_subnet_ids
  instance_types   = var.eks_instance_types
  desired_capacity = 2
  max_capacity     = 3
  min_capacity     = 1
}

# AWS ECR Repositories for Docker Images
resource "aws_ecr_repository" "backend" {
  name                 = "${var.env_prefix}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.env_prefix
  }
}

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.env_prefix}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Environment = var.env_prefix
  }
}
