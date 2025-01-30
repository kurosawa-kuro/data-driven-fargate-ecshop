**Infrastructure Layer**（環境固有のインフラ基盤）:

1. ネットワーク関連:
- VPC, サブネット(Private/Public)
- NAT Gateway, Internet Gateway
- ルートテーブル
- Transit Gateway
- VPC Endpoint
- Network ACLs
- VPC Flow Logs

2. コンピューティング:
- EC2
- ECS/Fargate
- Auto Scaling
- ALB/NLB
- Lambda (環境固有の場合)
- EKS
- Elastic Beanstalk

3. モニタリング:
- CloudWatch
   - Logs
   - Metrics
   - Alarms
   - Dashboard
- AWS X-Ray
- Systems Manager
- EventBridge

4. セキュリティ:
- Security Groups
- WAF
- Shield
- GuardDuty
- IAM Role/Policy
- KMS (環境固有の場合)

**Shared Services Layer**（共有リソース）:

1. データストア:
- RDS
- DynamoDB
- ElastiCache
- Amazon OpenSearch
- Redshift

2. ストレージ:
- S3
- EFS
- FSx

3. CDN/DNS:
- CloudFront
- Route 53
- Global Accelerator

4. 認証/認可:
- Cognito
- Directory Service
- IAM Identity Center

5. DevOpsツール:
- CodeBuild
- CodePipeline
- CodeDeploy
- ECR
- Artifact

6. 共有セキュリティ:
- ACM (証明書管理)
- Secrets Manager
- Parameter Store
- 共有KMS

この分類の特徴:
1. インフラ層は環境ごとに独立
2. 共有サービス層は複数環境で共有
3. コスト最適化が容易
4. セキュリティ境界が明確


# Shared Services Layer
1. データストア:
- RDS
- Lightsail DB

2. アプリケーションサービス:
- S3
- CloudFront
- Route 53
- Cognito
- Lambda (Slack通知)

3. 共有セキュリティ:
- ACM (証明書管理)
- Secrets Manager
- Parameter Store
- KMS

4. DevOpsツール:
- ECR