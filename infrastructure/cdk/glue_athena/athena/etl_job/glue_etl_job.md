# Constants for S3 paths - for easier maintenance
RAW_DATA_PATH = "s3://data-driven-app-01-bucket/raw-data/"
RAW_DATA_PATH_MINI = "s3://data-driven-app-01-bucket/raw-data-mini/"
PROCESSED_DATA_PATH = "s3://data-driven-app-01-bucket/processed-data/"
GLUE_ETL_JOB = "data-driven-app-01-job"
GLUE_ETL_CRAWL = "data-driven-app-01-crawl"
GLUE_DB = "data-driven-app-01-db"
GLUE_TBL_PREFIX = "order-complete-logs-"


Todo
・date処理
・mini flag

AWSのベストプラクティスに基づき、カスタムロール名を提案いたします：

# Role Name
`Custom_ETL_Service_Role`

## Attached Managed Policies
- AmazonS3FullAccess
- AWSGlueServiceRole
- CloudWatchFullAccess

## Trust Relationship
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "glue.amazonaws.com",
          "s3.amazonaws.com",
          "cloudwatch.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

## Naming Convention
プレフィックスとして`Custom_`を使用することで、以下を明確にします：
- 手動作成のカスタムロールであること
- AWS自動生成のロールと区別がつくこと
- チーム内での管理・追跡が容易になること

## Tags
```yaml
Name: Custom_ETL_Service_Role
Environment: dev/prod
CreatedBy: [your_name/team_name]
Project: ETL_Pipeline
ManagedBy: Custom
```