from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# サーバー起動コマンド
# uvicorn app.main:app --reload

#  ML API のテストコマンド
# curl -X GET "http://localhost:8000/predict" -H "Content-Type: application/json" -d '{"sepal_length": 5.1, "sepal_width": 3.5, "petal_length": 1.4, "petal_width": 0.2}'

# データセットの読み込み


# DL モデルの読み込み


# 予測


