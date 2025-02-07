import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame
from pyspark.sql.functions import col, year, month, dayofmonth, date_format

# Constants for S3 paths - for easier maintenance and control
IS_MINI = True  # Flag to control whether to use mini dataset. Set to True for mini mode.
RAW_DATA_PATH = "s3://custom-data-driven-app-01-bucket/raw-data/"
RAW_DATA_PATH_MINI = "s3://custom-data-driven-app-01-bucket/raw-data-mini/"
PROCESSED_DATA_PATH = "s3://custom-data-driven-app-01-bucket/processed-data/"
GLUE_ETL_JOB = "custom-data-driven-app-01-job"
GLUE_ETL_CRAWL = "custom-data-driven-app-01-crawl"
GLUE_DB = "custom-data-driven-app-01-db"
GLUE_TBL_PREFIX = "custom_order-complete-logs-"

def initialize_glue_context():
    """
    Initialize the Glue context, Spark context and job.
    Returns:
        glueContext: GlueContext object
        sc: SparkContext object
        spark: Spark session
        job: Job object
        args: Parsed job arguments
    """
    # Parse job arguments
    args = getResolvedOptions(sys.argv, ['JOB_NAME'])
    # Initialize Spark and Glue contexts
    sc = SparkContext()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    # Initialize the Glue job
    job = Job(glueContext)
    job.init(args['JOB_NAME'], args)
    return glueContext, sc, spark, job, args

def get_input_data_path():
    """
    Select and return the appropriate input data path based on IS_MINI flag.
    """
    return RAW_DATA_PATH_MINI if IS_MINI else RAW_DATA_PATH

def read_input_data(glueContext, input_path: str):
    """
    Read input JSON data from S3 as a DynamicFrame.
    Args:
        glueContext: The GlueContext object.
        input_path: S3 path for the input data.
    Returns:
        DynamicFrame containing the input data.
    """
    return glueContext.create_dynamic_frame.from_options(
        connection_type="s3",
        connection_options={"paths": [input_path]},
        format="json"
    )

def validate_dataframe(df, job):
    """
    Validate if the DataFrame schema is not empty.
    Args:
        df: Input DataFrame.
        job: The Glue Job object.
    Exits the job if schema is empty.
    """
    if not df.columns or len(df.columns) == 0:
        print("Error: Input data has an empty schema. No columns found.")
        job.commit()
        sys.exit(1)

def flatten_dataframe(df):
    """
    Flatten nested fields from the input DataFrame and add derived columns.
    Args:
        df: Input DataFrame.
    Returns:
        Transformed DataFrame with flattened structure and additional columns.
    """
    # Flatten nested fields from product_data and order_data
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
    
    # Add 'date' column formatted as yyyy/MM/dd derived from the timestamp field.
    flat_df = flat_df.withColumn("date", date_format(col("timestamp").cast("timestamp"), "yyyy/MM/dd"))
    
    # Add partition columns: year, month, day derived from the timestamp field.
    flat_df = flat_df.withColumn("year", year(col("timestamp").cast("timestamp"))) \
                     .withColumn("month", month(col("timestamp").cast("timestamp"))) \
                     .withColumn("day", dayofmonth(col("timestamp").cast("timestamp")))
    
    return flat_df

def write_data(glueContext, df, output_path: str):
    """
    Write the transformed DataFrame to S3 in Parquet format with partitioning.
    Args:
        glueContext: The GlueContext object.
        df: Transformed DataFrame.
        output_path: S3 path for the output data.
    """
    dynamic_frame = DynamicFrame.fromDF(df, glueContext, "flat_dynamic_frame")
    glueContext.write_dynamic_frame.from_options(
        frame=dynamic_frame,
        connection_type="s3",
        connection_options={
            "path": output_path,
            "partitionKeys": ["year", "month", "day"]
        },
        format="parquet"
    )

def main():
    """
    Main function to orchestrate the ETL job.
    """
    # Initialize Glue context and job components
    glueContext, sc, spark, job, args = initialize_glue_context()
    
    # Determine input data path based on IS_MINI flag
    input_data_path = get_input_data_path()
    
    # Read input data from S3 in JSON format
    dynamic_frame = read_input_data(glueContext, input_data_path)
    df = dynamic_frame.toDF()
    df.show()  # Debug: show initial DataFrame
    
    # Validate the schema of the DataFrame
    validate_dataframe(df, job)
    
    # Flatten the DataFrame and add derived columns
    flat_df = flatten_dataframe(df)
    flat_df.show()  # Debug: show transformed DataFrame
    
    # Write the transformed data to S3 in Parquet format with partitioning
    write_data(glueContext, flat_df, PROCESSED_DATA_PATH)
    
    # Commit the Glue job
    job.commit()

if __name__ == "__main__":
    main()