from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

# サーバー起動コマンド
# uvicorn app.main:app --reload