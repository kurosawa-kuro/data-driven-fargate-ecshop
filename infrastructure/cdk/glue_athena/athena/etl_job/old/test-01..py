import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import (
    from_json,
    col,
    regexp_replace,
    to_timestamp,
    from_unixtime,
    explode,
    split
)
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    TimestampType,
    DoubleType,
    IntegerType
)
from awsglue.dynamicframe import DynamicFrame

def initialize_glue_job():
    """Glue jobの初期化"""
    args = getResolvedOptions(sys.argv, ['JOB_NAME'])
    sc = SparkContext()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    job = Job(glueContext)
    job.init(args['JOB_NAME'], args)
    return glueContext, spark, job

def define_json_schema():
    """JSONデータのスキーマ定義"""
    return StructType([
        StructField("timestamp", StringType(), True),
        StructField("request_id", StringType(), True),
        StructField("log_type", StringType(), True),
        StructField("environment", StringType(), True),
        StructField("user_id", StringType(), True),
        StructField("user_agent", StringType(), True),
        StructField("client_ip", StringType(), True),
        StructField("country_code", StringType(), True),
        StructField("device_type", StringType(), True),
        StructField("action", StringType(), True),
        StructField("context", StructType([
            StructField("page_url", StringType(), True),
            StructField("referrer", StringType(), True),
            StructField("session_id", StringType(), True)
        ]), True),
        StructField("product_data", StructType([
            StructField("product_id", IntegerType(), True),
            StructField("product_name", StringType(), True),
            StructField("product_price", DoubleType(), True),
            StructField("quantity", IntegerType(), True),
            StructField("category_id", IntegerType(), True),
            StructField("category_name", StringType(), True)
        ]), True),
        StructField("source", StringType(), True)
    ])

def load_data(glueContext, source_bucket):
    """S3からデータを読み込む"""
    return glueContext.create_dynamic_frame.from_options(
        connection_type="s3",
        connection_options={"paths": [source_bucket]},
        format="json"
    )

def process_log_data(df, json_schema):
    """ログデータの処理"""
    # logフィールドからANSIエスケープシーケンスを削除
    df = df.withColumn("clean_log",
        regexp_replace(
            regexp_replace(col("log"), "\u001b\\[33m", ""),
            "\u001b\\[0m", ""
        )
    )
    
    # JSON文字列をパース
    df = df.withColumn("parsed_log",
        from_json(col("clean_log"), json_schema)
    )
    
    # フラット化
    df = df.select(
        col("parsed_log.timestamp").alias("timestamp"),
        col("parsed_log.request_id").alias("request_id"),
        col("parsed_log.log_type").alias("log_type"),
        col("parsed_log.environment").alias("environment"),
        col("parsed_log.user_id").alias("user_id"),
        col("parsed_log.device_type").alias("device_type"),
        col("parsed_log.action").alias("action"),
        col("parsed_log.product_data.product_id").alias("product_id"),
        col("parsed_log.product_data.product_name").alias("product_name"),
        col("parsed_log.product_data.product_price").alias("product_price"),
        col("parsed_log.product_data.quantity").alias("quantity"),
        col("parsed_log.source").alias("source")
    )
    
    # タイムスタンプの処理
    df = df.withColumn("timestamp",
        to_timestamp(col("timestamp"))
    )
    
    return df

def save_data(glueContext, df, target_bucket):
    """処理結果をS3に保存"""
    # パーティション用のカラムを追加
    df = df.withColumn("year", split(col("timestamp"), "-").getItem(0))
    df = df.withColumn("month", split(col("timestamp"), "-").getItem(1))
    df = df.withColumn("day", split(split(col("timestamp"), "-").getItem(2), " ").getItem(0))
    
    dynamic_frame = DynamicFrame.fromDF(df, glueContext, "dynamic_frame")
    
    glueContext.write_dynamic_frame.from_options(
        frame=dynamic_frame,
        connection_type="s3",
        connection_options={
            "path": target_bucket,
            "partitionKeys": ["year", "month", "day"]
        },
        format="parquet",
        format_options={"compression": "snappy"}
    )

def main():
    # Initialize
    glueContext, spark, job = initialize_glue_job()
    
    # S3 paths
    source_bucket = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/"
    target_bucket = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/after/"
    
    try:
        # JSONスキーマ定義
        json_schema = define_json_schema()
        
        # データ読み込み
        datasource = load_data(glueContext, source_bucket)
        df = datasource.toDF()
        print("読み込みレコード数:", df.count())
        
        # データ処理
        df = process_log_data(df, json_schema)
        print("処理後レコード数:", df.count())
        
        # 結果保存
        save_data(glueContext, df, target_bucket)
        
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        raise e
    finally:
        job.commit()

if __name__ == "__main__":
    main()