# Terraform (Infrastructure as Code)

## Overview

**Terraform** provisions the AWS infrastructure: ECR container repositories, S3 static asset storage, and CloudFront CDN distribution.

## Configuration

**File:** `infra/terraform/main.tf`

### Provider & Backend

```hcl
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "platform-terraform-state"
    key    = "infra/terraform.tfstate"
    region = "us-east-1"
  }
}
```

State is stored in S3 for team collaboration and state locking.

### ECR Repositories

```hcl
resource "aws_ecr_repository" "mfe" {
  for_each = toset(["host-shell", "mfe-products", "mfe-cart", "mfe-user"])
  name     = "${var.project}/${each.key}"

  image_scanning_configuration {
    scan_on_push = true    # Vulnerability scanning on every push
  }
  image_tag_mutability = "MUTABLE"
}
```

Creates 4 ECR repositories — one per MFE application. `scan_on_push` enables automatic vulnerability detection.

### S3 Static Assets

```hcl
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.project}-static-assets"
}

resource "aws_s3_bucket_public_access_block" "static_assets" {
  bucket                  = aws_s3_bucket.static_assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

S3 is **fully private** — CloudFront serves as the only public access point.

### CloudFront CDN

```hcl
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"    # Cheapest (US, Canada, Europe)

  default_cache_behavior {
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    default_ttl            = 86400          # 24 hours
    max_ttl                = 31536000       # 1 year
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### Outputs

```hcl
output "ecr_repositories" {
  value = { for k, v in aws_ecr_repository.mfe : k => v.repository_url }
}

output "cdn_domain" {
  value = aws_cloudfront_distribution.cdn.domain_name
}
```

## Infrastructure Diagram

```
┌─────────────────────────────────────────────┐
│                  AWS                         │
│                                              │
│  ┌─────────────┐     ┌──────────────────┐   │
│  │ ECR          │     │ S3               │   │
│  │ ┌─────────┐ │     │ static-assets    │   │
│  │ │host-shell│ │     │ (private)        │   │
│  │ │products  │ │     └────────┬─────────┘   │
│  │ │cart      │ │              │              │
│  │ │user      │ │     ┌────────▼─────────┐   │
│  │ └─────────┘ │     │ CloudFront CDN    │   │
│  └──────┬──────┘     │ HTTPS enforced    │   │
│         │            │ 24h default TTL   │   │
│         ▼            └──────────────────┘   │
│  ┌─────────────┐                             │
│  │ Kubernetes  │                             │
│  │ Cluster     │ ← pulls images from ECR     │
│  └─────────────┘                             │
└─────────────────────────────────────────────┘
```

## Commands

```bash
cd infra/terraform

# Initialize providers and backend
terraform init

# Preview changes
terraform plan

# Apply infrastructure changes
terraform apply

# Destroy all resources
terraform destroy
```

## Communication with Other Technologies

| Technology     | How Terraform Interacts                                       |
| -------------- | ------------------------------------------------------------- |
| Docker         | ECR repos store Docker images built by CI                     |
| GitHub Actions | CI pushes to ECR repos provisioned by Terraform               |
| Kubernetes     | K8s deployments reference ECR image URLs from Terraform output |
| CloudFront     | CDN serves S3 static assets with HTTPS enforcement            |
| S3             | State backend for Terraform itself + static asset storage     |

## Key Files

| File                       | Purpose                              |
| -------------------------- | ------------------------------------ |
| `infra/terraform/main.tf`  | All infrastructure definitions       |
