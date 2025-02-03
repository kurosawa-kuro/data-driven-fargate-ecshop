#!/usr/bin/env python3
"""
This script trains a Deep Learning model using TensorFlow/Keras on the Iris dataset,
optionally converts the trained model to ONNX format, and performs inference.
It supports the following command-line flags:
  --train      Train the model and save it.
  --convert    Convert the model to ONNX format.
  --predict    Prediction input as a comma-separated list of 4 numeric values.
"""
import os  # Added to create directory if not exists
import numpy as np
import tensorflow as tf
from tensorflow import keras
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import argparse
import tf2onnx

#------------------------------------------------------------------------------
# Constants
#------------------------------------------------------------------------------
MODEL_FILE = 'model/iris_deep_learning_model.keras'  # Save Keras model inside 'model' directory
ONNX_MODEL_FILE = 'model/iris_deep_learning_model.onnx'  # Save ONNX model inside 'model' directory
TEST_SIZE = 0.2
RANDOM_STATE = 42
EPOCHS = 100
BATCH_SIZE = 32

def ensure_model_directory():
    """
    Ensure the 'model' directory exists before saving files.
    """
    if not os.path.exists('model'):
        os.makedirs('model')

#------------------------------------------------------------------------------
# Data loading and preparation
#------------------------------------------------------------------------------
def load_and_prepare_data():
    """
    Load the Iris dataset, scale the features, and return the prepared data.
    """
    iris = load_iris()
    X = iris.data
    y = iris.target
    
    # Scale the features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Convert labels to categorical
    y_categorical = keras.utils.to_categorical(y)
    
    return X_scaled, y_categorical, iris.target_names, scaler

#------------------------------------------------------------------------------
# Model creation
#------------------------------------------------------------------------------
def create_model():
    """
    Create and return a Keras Sequential model for Iris classification.
    """
    model = keras.Sequential([
        keras.layers.Dense(64, activation='relu', input_shape=(4,)),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(32, activation='relu'),
        keras.layers.Dropout(0.2),
        keras.layers.Dense(3, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

#------------------------------------------------------------------------------
# Model training and saving
#------------------------------------------------------------------------------
def train_and_save_model(X, y):
    """
    Train the deep learning model and save it.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    
    model = create_model()
    
    # Add early stopping
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    )
    
    # Train the model
    history = model.fit(
        X_train, y_train,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Evaluate the model
    test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test accuracy: {test_accuracy:.2f}")
    
    # Ensure the model directory exists before saving
    ensure_model_directory()
    
    # Save the model
    model.save(MODEL_FILE)
    print("Model trained and saved.")
    
    return model

#------------------------------------------------------------------------------
# ONNX model conversion and saving
#------------------------------------------------------------------------------
def convert_and_save_model():
    """
    Convert the saved Keras model to ONNX format.
    """
    model = keras.models.load_model(MODEL_FILE)
    print("Model loaded for conversion.")

    # Manually set the output_names attribute for Sequential model conversion
    if not hasattr(model, 'output_names'):
        model.output_names = [tensor.name.split(':')[0] for tensor in model.outputs]
    
    spec = (tf.TensorSpec((None, 4), tf.float32, name="input"),)
    
    # Convert to ONNX model
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec)
    
    # Ensure the model directory exists before saving
    ensure_model_directory()
    
    # Save the ONNX model
    with open(ONNX_MODEL_FILE, "wb") as f:
        f.write(model_proto.SerializeToString())
    print("ONNX model saved.")

#------------------------------------------------------------------------------
# Model loading and inference
#------------------------------------------------------------------------------
def load_and_predict_model(target_names, new_data, scaler):
    """
    Load the trained model and perform prediction on the provided data.
    """
    model = keras.models.load_model(MODEL_FILE)
    print("Model loaded.")
    
    # Scale the input data
    scaled_data = scaler.transform(new_data)
    
    # Make prediction
    predictions = model.predict(scaled_data)
    predicted_class = target_names[np.argmax(predictions[0])]
    print("Prediction:", predicted_class)
    print("Probability distribution:", predictions[0])

#------------------------------------------------------------------------------
# Main processing
#------------------------------------------------------------------------------
def main(train_model, convert_to_onnx, predict_input=None):
    """
    Main processing function handling training, conversion, and prediction.
    """
    X, y, target_names, scaler = load_and_prepare_data()
    
    if train_model:
        model = train_and_save_model(X, y)
        if convert_to_onnx:
            convert_and_save_model()
    elif convert_to_onnx:
        try:
            convert_and_save_model()
        except Exception as e:
            print("Error converting model to ONNX:", e)
    else:
        if predict_input is not None:
            try:
                features = list(map(float, predict_input.split(',')))
                if len(features) != 4:
                    raise ValueError("Exactly 4 numeric features are required for prediction.")
                new_data = [features]
            except Exception as e:
                print("Error parsing prediction input:", e)
                return
        else:
            new_data = [[5.1, 3.5, 1.4, 0.2]]
        load_and_predict_model(target_names, new_data, scaler)

#------------------------------------------------------------------------------
# Entry point
#------------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Iris Deep Learning model training, conversion to ONNX, and inference"
    )
    parser.add_argument(
        "--train",
        action="store_true",
        help="Set this flag to train the model"
    )
    parser.add_argument(
        "--convert",
        action="store_true",
        help="Set this flag to convert the model to ONNX format"
    )
    parser.add_argument(
        "--predict",
        type=str,
        help="Comma-separated numeric features for prediction, e.g., '5.1,3.5,1.4,0.2'"
    )
    
    args = parser.parse_args()
    main(args.train, args.convert, args.predict)