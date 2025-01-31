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

def initialize_glue_job():
    args = getResolvedOptions(sys.argv, ['JOB_NAME'])
    sc = SparkContext()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    job = Job(glueContext)
    job.init(args['JOB_NAME'], args)
    return glueContext, job

def load_data(glueContext, source_bucket):
    return glueContext.create_dynamic_frame.from_options(
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

def transform_dates(df):
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
    return df.withColumn("OrderDate", date_format(col("OrderDate"), "yyyy-MM-dd"))

def clean_text_columns(df):
    df = df.withColumn("Category", regexp_replace(col("Category"), " ", ""))
    return df.withColumn("Name", regexp_replace(col("Name"), " ", ""))

def process_amount_column(df):
    df = df.withColumn("Amount", 
        when(col("Amount").isNull(), "0")
        .when(trim(col("Amount")) == "", "0")
        .when(col("Amount") == "undefined", "0")
        .otherwise(col("Amount"))
    )
    return df.withColumn("Amount", col("Amount").cast("integer"))

def rename_columns(df):
    return df.select(
        col("OrderDate").alias("order_date"),
        col("Category").alias("category"),
        col("Name").alias("name"),
        col("UnitPrice").alias("unit_price"),
        col("Amount").alias("amount")
    )

def save_data(glueContext, df, target_bucket):
    # 必要なカラムのみを選択し、順序を保証
    df = df.select(
        "order_date",
        "category",
        "name",
        "unit_price",
        "amount"
    )
    
    transformed_dynamic_frame = DynamicFrame.fromDF(df, glueContext, "transformed_dynamic_frame")
    
    glueContext.write_dynamic_frame.from_options(
        frame=transformed_dynamic_frame,
        connection_type="s3",
        connection_options={"path": target_bucket},
        format="csv",
        format_options={
            "writeHeader": False,  # ヘッダーを書き込まない
            "quoteChar": -1
        }
    )

def main():
    # Initialize
    glueContext, job = initialize_glue_job()
    
    # S3 paths
    source_bucket = "s3://anshin-bucket-mini-01/raw-data/sales/"
    target_bucket = "s3://anshin-bucket-mini-01/formatted-data/sales/"
    
    # Load data
    datasource = load_data(glueContext, source_bucket)
    df = datasource.toDF()
    
    # Transformations
    print("処理前のレコード数:", df.count())
    df = transform_dates(df)
    df = clean_text_columns(df)
    df = process_amount_column(df)
    df = df.filter(col("OrderDate").isNotNull())
    df = rename_columns(df)
    print("処理後の有効レコード数:", df.count())
    
    # Save results
    save_data(glueContext, df, target_bucket)
    job.commit()

if __name__ == "__main__":
    main()