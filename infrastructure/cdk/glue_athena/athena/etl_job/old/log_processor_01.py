# ... existing code ...

def main():
    # Initialize
    glueContext, job = initialize_glue_job()
    
    # S3 paths
    source_bucket = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/"
    target_bucket = "s3://fargatestack-logbucketcc3b17e8-usk5fhtyu7ev/after/"
    
    try:
        # Load data
        datasource = load_data(glueContext, source_bucket)
        df = datasource.toDF()
        
        # Transformations
        print("処理前のレコード数:", df.count())
        df = parse_log_data(df)
        df = filter_and_select_columns(df)
        print("処理後の有効レコード数:", df.count())
        
        # Save results
        save_data(glueContext, df, target_bucket)
        
    except Exception as e:
        print(f"エラーが発生しました: {str(e)}")
        raise e
    finally:
        job.commit()

def parse_log_data(df):
    # 元のカラム名を確認
    print("利用可能なカラム:", df.columns)
    
    # logカラムが存在しない場合、適切なカラム名を使用する
    if 'log' not in df.columns:
        # 実際のログデータが含まれるカラム名を指定
        log_column = 'message'  # または適切なカラム名
        
        # カラム名を変更
        df = df.withColumnRenamed(log_column, 'log')
    
    # ログデータの解析処理
    parsed_df = df.select(
        # ... 既存の解析処理 ...
    )
    return parsed_df

# ... existing code ...