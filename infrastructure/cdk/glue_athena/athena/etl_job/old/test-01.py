from pyspark.sql.functions import col, regexp_replace, from_json, to_timestamp

def process_log_data(df, json_schema):
    """ログデータの処理"""
    # JSONオブジェクトからlogフィールドを抽出
    df = df.withColumn("log", col("value.log"))
    
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