import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from awsglue.dynamicframe import DynamicFrame
from pyspark.sql.types import StructType, StructField, StringType, IntegerType
import boto3

# JOB_NAME のみを取得
args = getResolvedOptions(sys.argv, ['JOB_NAME'])

# 固定値の設定
DATABASE_NAME = "anshin-db"
TABLE_NAME = "anshin_sales"
SOURCE_PATH = "s3://anshin-bucket-mini-01/formatted-data/sales"

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

# Glueクライアントの初期化
glue_client = boto3.client('glue')

# テーブル作成関数
def create_table():
    try:
        response = glue_client.create_table(
            DatabaseName=DATABASE_NAME,
            TableInput={
                'Name': TABLE_NAME,
                'StorageDescriptor': {
                    'Columns': [
                        {'Name': 'order_date', 'Type': 'string'},
                        {'Name': 'category', 'Type': 'string'},
                        {'Name': 'name', 'Type': 'string'},
                        {'Name': 'unit_price', 'Type': 'int'},
                        {'Name': 'amount', 'Type': 'int'}
                    ],
                    'Location': SOURCE_PATH,
                    'InputFormat': 'org.apache.hadoop.mapred.TextInputFormat',
                    'OutputFormat': 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat',
                    'SerdeInfo': {
                        'SerializationLibrary': 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe',
                        'Parameters': {
                            'field.delim': ',',
                            'serialization.format': ','
                        }
                    }
                },
                'TableType': 'EXTERNAL_TABLE',
                'Parameters': {
                    'classification': 'csv',
                    'delimiter': ','
                }
            }
        )
        print(f"テーブル {DATABASE_NAME}.{TABLE_NAME} を作成しました")
        return response
    except glue_client.exceptions.AlreadyExistsException:
        print(f"テーブル {DATABASE_NAME}.{TABLE_NAME} は既に存在します")
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        raise e

# テーブルが存在しない場合は作成
create_table()

# データの読み込み
dynamic_frame = glueContext.create_dynamic_frame.from_options(
    connection_type="s3",
    connection_options={"paths": [SOURCE_PATH]},
    format="csv",
    format_options={
        "withHeader": True,
        "separator": ","
    }
)

# テーブル更新
glueContext.write_dynamic_frame.from_catalog(
    frame=dynamic_frame,
    database=DATABASE_NAME,
    table_name=TABLE_NAME,
    transformation_ctx="write_catalog",
    additional_options={
        "enableUpdateCatalog": True,
        "updateBehavior": "UPDATE_IN_DATABASE"
    }
)

job.commit()