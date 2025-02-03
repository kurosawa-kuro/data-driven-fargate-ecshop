import numpy as np
from fastapi import FastAPI
from tensorflow.keras.models import load_model

# Load the pre-trained Iris model from the specified path
MODEL_PATH = "/home/wsl/app/data-services-python/deep-learning/model/iris_deep_learning_model.keras"
iris_model = load_model(MODEL_PATH)

app = FastAPI()

# Species mapping dictionary for human-readable class names
species_mapping = {
    0: "setosa",
    1: "versicolor",
    2: "virginica"
}

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/predict")
def predict():
    # Set fixed input values: [sepal_length, sepal_width, petal_length, petal_width]
    input_data = np.array([[5.1, 3.5, 1.4, 0.2]])
    
    # Perform prediction using the pre-loaded Keras model
    prediction = iris_model.predict(input_data)
    
    # Determine the predicted class using argmax (assuming model outputs softmax probabilities)
    predicted_class = int(np.argmax(prediction, axis=1)[0])
    
    # Map the numeric prediction to a species name
    predicted_species = species_mapping.get(predicted_class, "unknown")
    
    # Create a dictionary that maps each iris species to its respective probability
    species_probabilities = {species_mapping[i]: float(prob) for i, prob in enumerate(prediction[0])}
    
    # Return the prediction including class index, species name, and individual probabilities per species
    return {
        "predicted_class_id": predicted_class,
        "predicted_species": predicted_species,
        "species_probabilities": species_probabilities,
        "raw_probabilities": prediction.tolist()
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

# サーバー起動コマンド
# uvicorn app.main:app --reload

#  ML API のテストコマンド
# curl -X GET "http://localhost:8000/predict" -H "Content-Type: application/json"

# データセットの読み込み


# DL モデルの読み込み




