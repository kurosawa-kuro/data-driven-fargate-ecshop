# coding: utf-8
"""
このファイルは、リファクタリング後の状態です。
メンテナンス性と単一責任原則を重視し、各機能を明確に分離しています。
以下のセクションに分かれています：
1. インポートと環境設定
2. モデルローディングクラス (KerasIrisModel, ONNXIrisModel)
3. ユーティリティ関数 (予測データの準備および変換)
4. チャットサービスクラス (ChatService)
5. FastAPI エンドポイントの設定
"""

import os
import numpy as np
from fastapi import FastAPI, HTTPException
from tensorflow.keras.models import load_model
import onnxruntime as ort
from pydantic import BaseModel
import openai
from openai import ChatCompletion
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set OpenAI API key from environment variable
openai.api_key = os.getenv("OPENAI_API_KEY")

# Constants
GPT_MODEL_NAME = "gpt-4o-mini"  # Constant definition for the OpenAI model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.keras")
ONNX_MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.onnx")


# ================================================================
# Model Loading Classes
# ================================================================
class KerasIrisModel:
    """
    Responsible for loading and predicting with a Keras model.
    """
    def __init__(self, model_path: str) -> None:
        # Load the pre-trained Keras model from the specified path
        self.model = load_model(model_path)

    def predict(self, input_data: np.ndarray) -> np.ndarray:
        # Compute predictions using the loaded Keras model
        return self.model.predict(input_data)


class ONNXIrisModel:
    """
    Responsible for loading and predicting with an ONNX model.
    """
    def __init__(self, model_path: str) -> None:
        # Load the ONNX model session from the specified path
        self.session = ort.InferenceSession(model_path)

    def predict(self, input_data: np.ndarray) -> np.ndarray:
        # Compute predictions using the loaded ONNX model session
        input_name = self.session.get_inputs()[0].name
        prediction_list = self.session.run(None, {input_name: input_data.astype(np.float32)})
        return np.array(prediction_list[0])


# ================================================================
# Utility Functions for Prediction
# ================================================================
def get_species_mapping() -> dict:
    """
    Return a mapping of iris species.
    """
    return {
        0: "setosa",
        1: "versicolor",
        2: "virginica"
    }


def get_fixed_input_data() -> np.ndarray:
    """
    Provide fixed input data for prediction: [sepal_length, sepal_width, petal_length, petal_width]
    """
    return np.array([[5.1, 3.5, 1.4, 0.2]])


def map_prediction_to_species(prediction: np.ndarray, species_mapping: dict) -> dict:
    """
    Map the numeric prediction result to species name and probabilities.
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


def perform_prediction(model) -> dict:
    """
    Orchestrate the prediction process using the given model instance.
    """
    input_data = get_fixed_input_data()
    prediction = model.predict(input_data)
    return map_prediction_to_species(prediction, get_species_mapping())


# ================================================================
# Chat Service for OpenAI Completion
# ================================================================
class ChatService:
    """
    Responsible for handling OpenAI chat completions.
    """
    @staticmethod
    def build_user_message(message_content: str) -> list:
        """
        Build the message payload for OpenAI ChatCompletion request.
        
        :param message_content: The user's message to send.
        :return: A list containing the message payload.
        """
        return [{"role": "user", "content": message_content}]

    @staticmethod
    def fetch_chat_completion(message_content: str) -> str:
        """
        Fetch chat completion from OpenAI using the provided message.
        
        :param message_content: The input message from the user.
        :return: The AI's reply content.
        """
        try:
            messages = ChatService.build_user_message(message_content)
            response = ChatCompletion.create(
                model=GPT_MODEL_NAME,
                messages=messages
            )
            # Return the first message content from the response, if available.
            if response.choices and response.choices[0].message:
                return response.choices[0].message.content
            else:
                return "No response content."
        except Exception as error:
            print("Error fetching chat completion:", error)
            raise error


# ================================================================
# FastAPI Application and Endpoint Definitions
# ================================================================
app = FastAPI()

# Initialize the Keras model at startup for performance optimization
keras_iris_model = KerasIrisModel(MODEL_PATH)

@app.get("/predict")
def predict():
    """
    Endpoint for performing prediction using the pre-loaded Keras model.
    """
    return perform_prediction(keras_iris_model)

@app.get("/predict_onnx")
def predict_onnx():
    """
    Endpoint for performing prediction using an ONNX model.
    A new ONNX session is initialized per request.
    """
    onnx_model = ONNXIrisModel(ONNX_MODEL_PATH)
    return perform_prediction(onnx_model)

# Define request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_endpoint(chat_request: ChatRequest):
    """
    FastAPI endpoint to handle chatbot conversation.
    Delegates the chat functionality to ChatService.
    """
    try:
        ai_response = ChatService.fetch_chat_completion(chat_request.message)
        return {"response": ai_response}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/health")
def health_check():
    """
    Endpoint for health check.
    
    Returns:
        A JSON object indicating the health status.
    """
    return {"status": "healthy"}

# ================================================================
# Application Entry Point
# ================================================================
if __name__ == '__main__':
    import uvicorn
    # Run the FastAPI application
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)