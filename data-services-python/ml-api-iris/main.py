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

# Constant definition for the OpenAI model name
GPT_MODEL_NAME = "gpt-4o-mini"

# ----------------------------------------------------------------
# Model Loading Classes - Responsible for loading models and performing prediction
# ----------------------------------------------------------------
class KerasIrisModel:
    def __init__(self, model_path: str) -> None:
        # Load the pre-trained Keras model from the specified path
        self.model = load_model(model_path)

    def predict(self, input_data: np.ndarray) -> np.ndarray:
        # Compute predictions using the loaded Keras model
        return self.model.predict(input_data)


class ONNXIrisModel:
    def __init__(self, model_path: str) -> None:
        # Load the ONNX model session from the specified path
        self.session = ort.InferenceSession(model_path)

    def predict(self, input_data: np.ndarray) -> np.ndarray:
        # Compute predictions using the loaded ONNX model session
        input_name = self.session.get_inputs()[0].name
        prediction_list = self.session.run(None, {input_name: input_data.astype(np.float32)})
        return np.array(prediction_list[0])


# ----------------------------------------------------------------
# Utility Functions - Provide input data and map predictions
# ----------------------------------------------------------------
def get_species_mapping() -> dict:
    # Return a mapping of iris species
    return {
        0: "setosa",
        1: "versicolor",
        2: "virginica"
    }


def get_fixed_input_data() -> np.ndarray:
    # Provide fixed input data for prediction: [sepal_length, sepal_width, petal_length, petal_width]
    return np.array([[5.1, 3.5, 1.4, 0.2]])


def map_prediction_to_species(prediction: np.ndarray, species_mapping: dict) -> dict:
    # Map the numeric prediction result to species name and probabilities
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
    # Orchestrate the prediction process using the given model instance
    input_data = get_fixed_input_data()
    prediction = model.predict(input_data)
    return map_prediction_to_species(prediction, get_species_mapping())


# ----------------------------------------------------------------
# Model Paths - Establish base directory and model file paths
# ----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.keras")
ONNX_MODEL_PATH = os.path.join(BASE_DIR, "..", "deep-learning", "model", "iris_deep_learning_model.onnx")

# Instantiate the Keras model once for performance
keras_iris_model = KerasIrisModel(MODEL_PATH)


# ----------------------------------------------------------------
# FastAPI Application Setup and Route Definitions
# ----------------------------------------------------------------
app = FastAPI()

@app.get("/predict")
def predict():
    # Endpoint using the Keras model for prediction
    return perform_prediction(keras_iris_model)

@app.get("/predict_onnx")
def predict_onnx():
    # Instantiate ONNX model per request to load a fresh session if necessary
    onnx_model = ONNXIrisModel(ONNX_MODEL_PATH)
    return perform_prediction(onnx_model)

# Define request model for the chat endpoint
class ChatRequest(BaseModel):
    message: str

def build_user_message(message_content: str):
    """
    Build the message payload for OpenAI ChatCompletion request.
    
    :param message_content: The user's message to send.
    :return: A list containing the message payload.
    """
    return [{"role": "user", "content": message_content}]

def fetch_chat_completion(message_content: str) -> str:
    """
    Fetch chat completion from OpenAI using the provided message.
    
    :param message_content: The input message from the user.
    :return: The AI's reply content.
    """
    try:
        messages = build_user_message(message_content)
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

@app.post("/chat")
def chat_endpoint(chat_request: ChatRequest):
    """
    FastAPI endpoint to handle chatbot conversation.
    
    :param chat_request: The request payload containing the user's message.
    :return: JSON response with the AI's reply.
    """
    try:
        ai_response = fetch_chat_completion(chat_request.message)
        return {"response": ai_response}
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

if __name__ == '__main__':
    import uvicorn
    # Run the FastAPI application
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)