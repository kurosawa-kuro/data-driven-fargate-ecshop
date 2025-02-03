import numpy as np
from fastapi import FastAPI
from tensorflow.keras.models import load_model

# 定数: ディープラーニングモデルのパス
MODEL_PATH = "/home/wsl/app/data-services-python/deep-learning/model/iris_deep_learning_model.keras"

def load_iris_model(model_path: str):
    """
    Load and return the pre-trained Keras model from the specified path.
    """
    return load_model(model_path)

def get_species_mapping() -> dict:
    """
    Return a mapping dictionary for iris species.
    """
    return {
        0: "setosa",
        1: "versicolor",
        2: "virginica"
    }

def get_fixed_input_data() -> np.ndarray:
    """
    Return fixed input data for prediction.
    """
    # 固定の入力値: [sepal_length, sepal_width, petal_length, petal_width]
    return np.array([[5.1, 3.5, 1.4, 0.2]])

def compute_prediction(model, input_data: np.ndarray) -> np.ndarray:
    """
    Compute the prediction for the given input data using the provided model.
    """
    return model.predict(input_data)

def map_prediction_to_species(prediction: np.ndarray, species_mapping: dict) -> dict:
    """
    Map the numeric prediction to the species name and probabilities.

    Returns a dictionary that includes:
      - predicted_class_id: Numeric index of the predicted species.
      - predicted_species: Mapped species name.
      - species_probabilities: A dictionary mapping each species to its probability.
      - raw_probabilities: Raw output probabilities from the model.
    """
    # 決定されたクラス（softmax結果と仮定）のインデックス取得
    predicted_class_id = int(np.argmax(prediction, axis=1)[0])
    predicted_species = species_mapping.get(predicted_class_id, "unknown")
    
    # 各種の確率を species_mapping を利用してマッピング
    species_probabilities = {
        species_mapping[i]: float(prob) for i, prob in enumerate(prediction[0])
    }
    
    return {
        "predicted_class_id": predicted_class_id,
        "predicted_species": predicted_species,
        "species_probabilities": species_probabilities,
        "raw_probabilities": prediction.tolist()
    }

def predict_iris() -> dict:
    """
    Orchestrate the iris prediction process.
    1. 固定入力データの生成
    2. モデルによる予測計算
    3. 予測結果の種別マッピング
    """
    input_data = get_fixed_input_data()
    prediction = compute_prediction(iris_model, input_data)
    species_map = get_species_mapping()
    return map_prediction_to_species(prediction, species_map)

# グローバルでモデルを読み込む（アプリケーション起動時に一度だけ実行）
iris_model = load_iris_model(MODEL_PATH)

# FastAPI アプリケーションの作成
app = FastAPI()

@app.get("/")
def read_root():
    # シンプルな挨拶を返す
    return {"Hello": "World"}

@app.get("/predict")
def predict():
    # Iris 予測結果を取得して返す
    return predict_iris()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# サーバー起動コマンド
# uvicorn main:app --reload

# ML API のテストコマンド
# curl -X GET "http://localhost:8000/predict" -H "Content-Type: application/json"

# データセットの読み込み


# DL モデルの読み込み




