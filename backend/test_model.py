import os
import sys
import joblib

def test_model_loading():
    print("Testing model loading...")
    
    # Check if model files exist
    model_files = [
        'models/sleep_model.pkl',
        'models/scaler.pkl', 
        'models/feature_names.pkl',
        'models/encoders.pkl'
    ]
    
    for file_path in model_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")
    
    # Try to load each file
    try:
        print("\nTrying to load model files...")
        model = joblib.load('models/sleep_model.pkl')
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
    
    try:
        scaler = joblib.load('models/scaler.pkl')
        print("✅ Scaler loaded successfully")
    except Exception as e:
        print(f"❌ Error loading scaler: {e}")
    
    try:
        feature_names = joblib.load('models/feature_names.pkl')
        print("✅ Feature names loaded successfully")
    except Exception as e:
        print(f"❌ Error loading feature names: {e}")
    
    try:
        encoders = joblib.load('models/encoders.pkl')
        print("✅ Encoders loaded successfully")
    except Exception as e:
        print(f"❌ Error loading encoders: {e}")

if __name__ == "__main__":
    test_model_loading() 