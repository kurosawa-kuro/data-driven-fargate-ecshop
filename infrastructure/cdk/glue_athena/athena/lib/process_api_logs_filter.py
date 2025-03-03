import sys
import json
from datetime import datetime
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame

# 初期化
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# S3パスの設定
input_path = "s3://fargatestack-logbucketcc3b17e8-0djriusfgxia/"
output_path = "s3://fargatestack-logbucketcc3b17e8-0djriusfgxia/processed/"

# データの読み込み
source_dyf = glueContext.create_dynamic_frame.from_options(
   connection_type="s3",
   connection_options={
       "paths": [input_path],
       "recurse": True
   },
   format="json"
)

# ログ処理とパーティション
def process_logs_with_partition(rec):
   if 'container_id' not in rec or 'log' not in rec:
       return None
       
   try:
       log_str = rec['log'].replace('\u001B[33m', '').replace('\u001b[33m', '').replace('\u001B[0m', '').replace('\u001b[0m', '')
       parsed_json = json.loads(log_str)
       
       # エラーチェックを追加
       if 'timestamp' not in parsed_json:
           return None
           
       # タイムスタンプのパース
       timestamp = datetime.strptime(parsed_json['timestamp'].replace('Z', '+00:00'), "%Y-%m-%dT%H:%M:%S.%f%z")
       parsed_json['year'] = timestamp.year
       parsed_json['month'] = timestamp.month
       parsed_json['day'] = timestamp.day
       
       return parsed_json
   except Exception as e:
       print(f"Error processing record: {e}")
       return None

# Map処理の適用
mapped_dyf = Map.apply(frame=source_dyf, f=process_logs_with_partition)

# パーティション設定付きで書き出し
glueContext.write_dynamic_frame.from_options(
   frame=mapped_dyf,
   connection_type="s3",
   connection_options={
       "path": output_path,
       "partitionKeys": ["year", "month", "day"]
   },
   format="json"
)

job.commit()