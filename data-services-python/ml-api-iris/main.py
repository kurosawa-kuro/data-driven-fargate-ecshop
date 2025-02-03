import os
import numpy as np
from fastapi import FastAPI
from tensorflow.keras.models import load_model
import onnxruntime as ort  # ONNX runtime for inference

def load_iris_model(model_path: str):
    """
    Load and return the pre-trained Keras model from the specified path.
    """
    return load_model(model_path)

def load_iris_model_onnx(model_path: str):
    """
    Load and return the ONNX model session from the specified path.
    """
    return ort.InferenceSession(model_path)

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
    # Fixed input: [sepal_length, sepal_width, petal_length, petal_width]
    return np.array([[5.1, 3.5, 1.4, 0.2]])

def compute_prediction(model, input_data: np.ndarray) -> np.ndarray:
    """
    Compute the prediction for the given input data using the provided Keras model.
    """
    return model.predict(input_data)

def compute_prediction_onnx(session, input_data: np.ndarray) -> np.ndarray:
    """
    Compute the prediction for the given input data using the provided ONNX model session.
    """
    # Get the name of the model's first input
    input_name = session.get_inputs()[0].name
    # Run inference using ONNX runtime
    prediction_list = session.run(None, {input_name: input_data.astype(np.float32)})
    return np.array(prediction_list[0])

def map_prediction_to_species(prediction: np.ndarray, species_mapping: dict) -> dict:
    """
    Map the numeric prediction to the species name and probabilities.

    Returns a dictionary that includes:
      - predicted_class_id: Numeric index of the predicted species.
      - predicted_species: Mapped species name.
      - species_probabilities: A dictionary mapping each species to its probability.
      - raw_probabilities: Raw output probabilities from the model.
    """
    predicted_class_id = int(np.argmax(prediction, axis=1)[0])
    predicted_species = species_mapping.get(predicted_class_id, "unknown")
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
    Orchestrate the iris prediction process using the Keras model.
    """
    input_data = get_fixed_input_data()
    prediction = compute_prediction(iris_model, input_data)
    species_map = get_species_mapping()
    return map_prediction_to_species(prediction, species_map)

def predict_iris_onnx() -> dict:
    """
    Orchestrate the iris prediction process using the ONNX model.
    """
    input_data = get_fixed_input_data()
    session = load_iris_model_onnx(ONNX_MODEL_PATH)
    prediction = compute_prediction_onnx(session, input_data)
    species_map = get_species_mapping()
    return map_prediction_to_species(prediction, species_map)

# ------ モデルパスの相対指定部分 ------

# __file__を利用して、main.pyのあるディレクトリを基準にモデルへのパスを組み立てる
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 例: モデルファイルが「../deep-learning/model/iris_deep_learning_model.keras」にある場合
MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.keras")
ONNX_MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.onnx")

iris_model = load_iris_model(MODEL_PATH)

# --------------------------------------

# FastAPI アプリケーションの作成
app = FastAPI()

@app.get("/predict")
def predict():
    return predict_iris()

@app.get("/predict_onnx")
def predict_onnx():
    return predict_iris_onnx()

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)