import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
import boto3

class Config:
    """設定管理クラス"""
    def __init__(self):
        self.job_name = getResolvedOptions(sys.argv, ['JOB_NAME'])['JOB_NAME']
        self.database_name = "anshin-db"
        self.table_name = "anshin_sales"
        self.source_path = "s3://anshin-bucket-mini-01/formatted-data/sales"

class TableCreator:
    """テーブル作成処理クラス"""
    def __init__(self, config):
        self.config = config
        self.glue_client = boto3.client('glue')
        self.sc = SparkContext()
        self.glue_context = GlueContext(self.sc)
        self.job = Job(self.glue_context)
        self.job.init(self.config.job_name, {'JOB_NAME': self.config.job_name})

    def _get_table_input(self):
        """テーブル定義の作成"""
        return {
            'Name': self.config.table_name,
            'StorageDescriptor': {
                'Columns': [
                    {'Name': 'order_date', 'Type': 'string'},
                    {'Name': 'category', 'Type': 'string'},
                    {'Name': 'name', 'Type': 'string'},
                    {'Name': 'unit_price', 'Type': 'int'},
                    {'Name': 'amount', 'Type': 'int'}
                ],
                'Location': self.config.source_path,
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

    def create_table(self):
        """テーブル作成のメイン処理"""
        try:
            response = self.glue_client.create_table(
                DatabaseName=self.config.database_name,
                TableInput=self._get_table_input()
            )
            print(f"テーブル {self.config.database_name}.{self.config.table_name} を作成しました")
            return response
        except self.glue_client.exceptions.AlreadyExistsException:
            print(f"テーブル {self.config.database_name}.{self.config.table_name} は既に存在します")
        except Exception as e:
            print(f"エラーが発生しました: {str(e)}")
            raise e

    def commit_job(self):
        """ジョブのコミット"""
        self.job.commit()

# 実行処理
def main():
    config = Config()
    table_creator = TableCreator(config)
    table_creator.create_table()
    table_creator.commit_job()

if __name__ == "__main__":
    main()