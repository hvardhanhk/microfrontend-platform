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

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "project" {
  default = "platform"
}

resource "aws_ecr_repository" "mfe" {
  for_each = toset(["host-shell", "mfe-products", "mfe-cart", "mfe-user"])
  name     = "${var.project}/${each.key}"

  image_scanning_configuration {
    scan_on_push = true
  }
  image_tag_mutability = "MUTABLE"
}

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

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "s3-static"
    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-static"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "ecr_repositories" {
  value = { for k, v in aws_ecr_repository.mfe : k => v.repository_url }
}

output "cdn_domain" {
  value = aws_cloudfront_distribution.cdn.domain_name
}
