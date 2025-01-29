import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.sql.functions import (
    to_date, 
    date_format, 
    col, 
    when, 
    regexp_replace,
    trim
)
from awsglue.dynamicframe import DynamicFrame

## @params: [JOB_NAME]
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# S3 paths
source_bucket = "s3://anshin-bucket-mini-01/raw-data/sales/"
target_bucket = "s3://anshin-bucket-mini-01/formatted-data/sales/"

# データの読み込み処理
datasource = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [source_bucket]},
    format="csv",
    format_options={
        "withHeader": True,
        "separator": ",",
        "inferSchema": False,
        "treatEmptyValuesAsNulls": True
    }
)

# SparkDataFrameへの変換
df = datasource.toDF()

# 処理前のレコード数を出力
print("処理前のレコード数:", df.count())

# 日付の変換処理
df = df.withColumn(
    "OrderDate",
    when(
        col("OrderDate").isNotNull(),
        to_date(
            regexp_replace(col("OrderDate"), "/", "-"),
            "yyyy-M-d"
        )
    ).otherwise(None)
)

# 日付フォーマットの統一
df = df.withColumn(
    "OrderDate",
    date_format(col("OrderDate"), "yyyy-MM-dd")
)

# カテゴリと商品名の空白除去
df = df.withColumn(
    "Category", 
    regexp_replace(col("Category"), " ", "")
)
df = df.withColumn(
    "Name", 
    regexp_replace(col("Name"), " ", "")
)

# 金額（Amount）のクリーニング
df = df.withColumn("Amount", 
    when(col("Amount").isNull(), "0")
    .when(trim(col("Amount")) == "", "0")
    .when(col("Amount") == "undefined", "0")
    .otherwise(col("Amount"))
)

# 金額を整数型に変換
df = df.withColumn("Amount", col("Amount").cast("integer"))

# Null値の日付を持つレコードを除外
df = df.filter(col("OrderDate").isNotNull())

# カラム名の変更
df = df.select(
    col("OrderDate").alias("order_date"),
    col("Category").alias("category"),
    col("Name").alias("name"),
    col("UnitPrice").alias("unit_price"),
    col("Amount").alias("amount")
)

# 処理後のレコード数を出力
print("処理後の有効レコード数:", df.count())

# DynamicFrameに戻す
transformed_dynamic_frame = DynamicFrame.fromDF(df, glueContext, "transformed_dynamic_frame")

# S3への保存
glueContext.write_dynamic_frame.from_options(
    frame=transformed_dynamic_frame,
    connection_type="s3",
    connection_options={"path": target_bucket},
    format="csv",
    format_options={
        "writeHeader": True,
        "quoteChar": -1  # クォーテーションを無効化
    }
)

job.commit()