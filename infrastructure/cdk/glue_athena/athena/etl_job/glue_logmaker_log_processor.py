import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame
from pyspark.sql.functions import col, year, month, dayofmonth

# Constants for S3 paths - for easier maintenance
RAW_DATA_PATH = "s3://custom_data-driven-app-01-bucket/raw-data/"
RAW_DATA_PATH_MINI = "s3://custom_data-driven-app-01-bucket/raw-data-mini/"
PROCESSED_DATA_PATH = "s3://custom_data-driven-app-01-bucket/processed-data/"
GLUE_ETL_JOB = "custom_data-driven-app-01-job"
GLUE_ETL_CRAWL = "custom_data-driven-app-01-crawl"
GLUE_DB = "custom_data-driven-app-01-db"
GLUE_TBL_PREFIX = "custom_order-complete-logs-"

# Initialize Glue context
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Read input JSON data from S3 as a DynamicFrame using the RAW_DATA_PATH constant
dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={
        "paths": [RAW_DATA_PATH]
    },
    format="json"
)

# Convert DynamicFrame to DataFrame to check schema
df = dynamic_frame.toDF()
df.show()

# If the input data has an empty schema, exit the job
if not df.columns or len(df.columns) == 0:
    print("Error: Input data has an empty schema. No columns found.")
    job.commit()
    sys.exit(1)

# Flatten nested fields from context, product_data and order_data
flat_df = df.select(
    col("timestamp"),
    col("request_id"),
    col("user_id"),
    col("country_code"),
    col("device_type"),
    col("product_data.product_id").alias("product_id"),
    col("product_data.product_name").alias("product_name"),
    col("product_data.product_price").alias("product_price"),
    col("product_data.quantity").alias("quantity"),
    col("product_data.category_id").alias("category_id"),
    col("product_data.category_name").alias("category_name"),
    col("order_data.order_id").alias("order_id")
)

# Add partition columns: year, month, day from the timestamp field.
flat_df = flat_df.withColumn("year", year(col("timestamp").cast("timestamp"))) \
                 .withColumn("month", month(col("timestamp").cast("timestamp"))) \
                 .withColumn("day", dayofmonth(col("timestamp").cast("timestamp")))

flat_df.show()

# Convert the flattened DataFrame back to DynamicFrame
flat_dynamic_frame = DynamicFrame.fromDF(flat_df, glueContext, "flat_dynamic_frame")

# Write the flattened data with partitioning (year, month, day) to S3 in Parquet format using the PROCESSED_DATA_PATH constant
glueContext.write_dynamic_frame.from_options(
    frame=flat_dynamic_frame,
    connection_type="s3",
    connection_options={
        "path": PROCESSED_DATA_PATH,
        "partitionKeys": ["year", "month", "day"]
    },
    format="parquet"
)

job.commit()