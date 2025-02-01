import sys
import json
from datetime import datetime
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.dynamicframe import DynamicFrame

def initialize_glue_job():
    args = getResolvedOptions(sys.argv, ['JOB_NAME'])
    sc = SparkContext()
    glueContext = GlueContext(sc)
    spark = glueContext.spark_session
    job = Job(glueContext)
    job.init(args['JOB_NAME'], args)
    return glueContext, job

def load_data(glueContext, input_path):
    return glueContext.create_dynamic_frame.from_options(
        connection_type="s3",
        connection_options={"paths": [input_path], "recurse": True},
        format="json"
    )

def parse_timestamp(timestamp_str):
    return datetime.strptime(timestamp_str.replace('Z', '+00:00'), "%Y-%m-%dT%H:%M:%S.%f%z")

def clean_log_string(log_str):
    return log_str.replace('\u001B[33m', '').replace('\u001b[33m', '').replace('\u001B[0m', '').replace('\u001b[0m', '')

def extract_product_data(parsed_json):
    return {
        "product_id": parsed_json.get('product_data', {}).get('product_id', ''),
        "product_name": parsed_json.get('product_data', {}).get('product_name', ''),
        "category_id": parsed_json.get('product_data', {}).get('category_id', ''),
        "category_name": parsed_json.get('product_data', {}).get('category_name', ''),
        "quantity": parsed_json.get('product_data', {}).get('quantity', ''),
        "product_price": parsed_json.get('product_data', {}).get('product_price', '')
    }

def extract_context_data(parsed_json):
    return {
        "page_url": parsed_json.get('context', {}).get('page_url', ''),
        "referrer": parsed_json.get('context', {}).get('referrer', ''),
        "session_id": parsed_json.get('context', {}).get('session_id', '')
    }

def transform_log_record(rec):
    if 'container_id' not in rec or 'log' not in rec:
        return None
        
    try:
        log_str = clean_log_string(rec['log'])
        parsed_json = json.loads(log_str)
        
        if 'timestamp' not in parsed_json:
            return None
            
        timestamp = parse_timestamp(parsed_json['timestamp'])
        product_data = extract_product_data(parsed_json)
        context_data = extract_context_data(parsed_json)
        
        return {
            "timestamp": parsed_json['timestamp'],
            "year": timestamp.year,
            "month": timestamp.month,
            "day": timestamp.day,
            "request_id": parsed_json.get('request_id', ''),
            "action": parsed_json.get('action', ''),
            "source": parsed_json.get('source', ''),
            "device_type": parsed_json.get('device_type', ''),
            "log_type": parsed_json.get('log_type', ''),
            "environment": parsed_json.get('environment', ''),
            "client_ip": parsed_json.get('client_ip', ''),
            "user_id": parsed_json.get('user_id', ''),
            "user_agent": parsed_json.get('user_agent', ''),
            "country_code": parsed_json.get('country_code', ''),
            **product_data,
            **context_data
        }
    except Exception as e:
        print(f"Error processing record: {e}")
        return None

def deduplicate_data(mapped_dyf, glueContext):
    df = mapped_dyf.toDF()
    df = df.dropDuplicates(["timestamp", "request_id", "product_id"])
    return DynamicFrame.fromDF(df, glueContext, "deduplicated_dyf")

def write_output(glueContext, deduplicated_dyf, output_path):
    glueContext.write_dynamic_frame.from_options(
        frame=deduplicated_dyf,
        connection_type="s3",
        connection_options={"path": output_path, "partitionKeys": ["year", "month", "day"]},
        format="json"
    )

def main():
    input_path = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/"
    output_path = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/after/"
    
    glueContext, job = initialize_glue_job()
    source_dyf = load_data(glueContext, input_path)
    mapped_dyf = Map.apply(frame=source_dyf, f=transform_log_record)
    deduplicated_dyf = deduplicate_data(mapped_dyf, glueContext)
    write_output(glueContext, deduplicated_dyf, output_path)
    job.commit()

if __name__ == "__main__":
    main() 