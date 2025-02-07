import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame

# Initialize Glue context
args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Read input data
dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={
        "paths": ["s3://data-driven-app-bucket-01/raw-data/"]
    },
    format="json"
)

# Convert to DataFrame to see the data
df = dynamic_frame.toDF()
df.show()

# 入力データのスキーマが空の場合はエラーとして終了（書き込み時にエラーが発生するため）
if not df.columns or len(df.columns) == 0:
    print("Error: Input data has an empty schema. No columns found.")
    job.commit()
    sys.exit(1)

# DataFrameからDynamicFrameに再キャスト（念のため有効なスキーマを持つことを保証する）
dynamic_frame = DynamicFrame.fromDF(df, glueContext, "recast_dynamic_frame")

# Write output
glueContext.write_dynamic_frame.from_options(
    frame=dynamic_frame,
    connection_type="s3",
    connection_options={
        "path": "s3://data-driven-app-bucket-01/processed-data/order_logs/"
    },
    format="parquet"
)

job.commit()