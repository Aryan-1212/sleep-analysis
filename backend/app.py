from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import warnings
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json
from datetime import datetime

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.path.dirname(__file__), 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Mappings (from model training notebook) ---
# This ensures data is encoded exactly as the model expects, even if .pkl files are corrupt.

QUESTION_MAPPING = {
    "What is your age group?": "what is your age group?",
    "On average, how many hours do you sleep at night?": "on average, how many hours do you sleep at night?",
    "How often do you have trouble falling asleep?": "how often do you have trouble falling asleep?",
    "Do you wake up feeling well-rested?": "do you wake up feeling well-rested?",
    "How often do you feel tired or drowsy during the day?": "how often do you feel tired or drowsy during the day?",
    "Do you face difficulty concentrating or staying focused during the day?": "do you face difficulty concentrating or staying focused during the day?",
    "How often do you feel anxious or nervous?": "how often do you feel anxious or nervous?",
    "How would you describe your current emotional state?": "how would you describe your current emotional state?",
    "Have you experienced trauma that continues to disturb your sleep?": "have you experienced trauma that continues to disturb your sleep?",
    "Do you often worry excessively about the future or daily tasks before bed?": "do you often worry excessively about the future or daily tasks before bed?",
    "Do you dwell on past events (rumination) before falling asleep?": "do you dwell on past events (rumination) before falling asleep?",
    "Do you experience chronic worry that keeps your mind active at night?": "do you experience chronic worry that keeps your mind active at night?",
    "How often do you use mobile or digital devices before sleeping?": "how often do you use mobile or digital devices before sleeping?",
    "How often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?": "how often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?",
    "Do you have someone to talk to when you feel mentally low or stressed?": "do you have someone to talk to when you feel mentally low or stressed?",
    "How would you describe the environment at your home/school/work?": "how would you describe the environment at your home/school/work?",
    "How often does bright lighting in your room affect your ability to sleep?": "do you have bright lighting in your sleeping environment?",
    "How would you rate the noise level in your sleeping environment?": "how would you rate the noise level in your sleeping environment?",
    "How often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?": "how often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?",
    "Do you experience any physical pain or discomfort while trying to sleep?": "do you experience any physical pain or discomfort while trying to sleep?",
    "How often do you exercise during the day?": "do you have any medical condition that interferes with your sleep?",
    "How would you rate your stress levels before bedtime?": "are you currently taking any medications that may affect your sleep patterns?",
    "How often do you take naps during the day?": "have you been diagnosed with any sleep disorders (e.g., insomnia, apnea)?",
    "How would you describe your bedtime routine?": "have you experienced any hormonal changes (e.g., puberty, menstruation, menopause) affecting sleep?",
    "How often do you feel refreshed after waking up?": "are you diagnosed with any neurological disorder (e.g., parkinson's, epilepsy) affecting sleep?"
}

ORDINAL_MAPPINGS = {
    'what is your age group?': {'0–12 (children)': 0, '13–18 (adolescents)': 1, '19–30 (young adults)': 2, '31+ (adults & seniors)': 3},
    'on average, how many hours do you sleep at night?': {'less than 4 hours': 0, '4–6 hours': 1, '6–8 hours': 2, 'more than 8 hours': 3},
    'how often do you have trouble falling asleep?': {'never': 0, 'occasionally': 1, 'frequently': 2, 'always': 3},
    'how often do you feel tired or drowsy during the day?': {'never': 0, 'rarely': 1, 'frequently': 2, 'every day': 3},
    'how often do you feel anxious or nervous?': {'never': 0, 'sometimes': 1, 'often': 2, 'always': 3},
    'how would you describe your current emotional state?': {'happy and content': 0, 'occasionally stressed': 1, 'often overwhelmed': 2, 'mentally distressed': 3},
    'have you experienced trauma that continues to disturb your sleep?': {'no': 0, 'no trauma': 0, 'yes, but sleep unaffected': 1, 'yes, occasionally affects sleep': 2, 'yes, frequently affects sleep': 3},
    'do you dwell on past events (rumination) before falling asleep?': {'never': 0, 'occasionally': 1, 'frequently': 2, 'always': 3},
    'how often do you use mobile or digital devices before sleeping?': {'never': 0, 'sometimes': 1, 'most nights': 2, 'every night': 3},
    'how often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?': {'never': 0, 'rarely': 1, 'frequently': 2, 'daily': 3},
    'how would you describe the environment at your home/school/work?': {'very supportive': 0, 'somewhat supportive': 1, 'neutral': 2, 'stressful and unsupportive': 3},
    'how would you rate the noise level in your sleeping environment?': {'very quiet': 0, 'mostly quiet': 1, 'occasionally noisy': 2, 'very noisy': 3},
    'how often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?': {'never': 0, 'sometimes': 1, 'often': 2, 'always': 3},
    'do you have any medical condition that interferes with your sleep?': {'no medical condition': 0, 'mild condition': 1, 'moderate condition': 2, 'severe condition': 3},
    'have you been diagnosed with any sleep disorders (e.g., insomnia, apnea)?': {'no': 0, 'diagnosed, under control': 1, 'diagnosed, affects sleep': 2},
    'are you diagnosed with any neurological disorder (e.g., parkinson\'s, epilepsy) affecting sleep?': {'no': 0, 'mild condition': 1, 'moderate impact': 2, 'severe impact on sleep': 3}
}

BINARY_MAPPINGS = {
    'do you wake up feeling well-rested?': {'yes': 1, 'no': 0, 'always': 1, 'often': 1, 'sometimes': 0, 'never': 0},
    'do you face difficulty concentrating or staying focused during the day?': {'yes': 1, 'no': 0, 'never': 0, 'occasionally': 1, 'often': 1, 'always': 1},
    'do you often worry excessively about the future or daily tasks before bed?': {'yes': 1, 'no': 0, 'never': 0, 'occasionally': 1, 'frequently': 1, 'always': 1},
    'do you experience chronic worry that keeps your mind active at night?': {'yes': 1, 'no': 0, 'never': 0, 'occasionally': 1, 'frequently': 1, 'always': 1},
    'do you have someone to talk to when you feel mentally low or stressed?': {'yes': 1, 'no': 0, 'always': 1, 'most of the time': 1, 'sometimes': 0, 'never': 0},
    'do you have bright lighting in your sleeping environment?': {'yes': 1, 'no': 0, 'never': 0, 'sometimes': 1, 'often': 1, 'always': 1},
    'do you experience any physical pain or discomfort while trying to sleep?': {'yes': 1, 'no': 0, 'never': 0, 'occasionally': 1, 'often': 1, 'always': 1},
    'are you currently taking any medications that may affect your sleep patterns?': {'yes': 1, 'no': 0},
    'have you experienced any hormonal changes (e.g., puberty, menstruation, menopause) affecting sleep?': {'yes': 1, 'no': 0}
}


# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    quiz_results = db.relationship('QuizResult', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class QuizResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    answers = db.Column(db.Text, nullable=False)  # Store answers as a JSON string
    sleep_score = db.Column(db.Float, nullable=False)
    effectiveness_percentage = db.Column(db.Float, nullable=False)
    recommendations = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class SleepScorePredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.encoders = {}
        self.feature_names = []
        
    def load_model(self):
        """Load the trained model and related files"""
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'models', 'sleep_model.pkl')
            scaler_path = os.path.join(os.path.dirname(__file__), 'models', 'scaler.pkl')
            feature_names_path = os.path.join(os.path.dirname(__file__), 'models', 'feature_names.pkl')
            encoders_path = os.path.join(os.path.dirname(__file__), 'models', 'encoders.pkl')
            
            # Check if model file exists
            if not os.path.exists(model_path):
                raise FileNotFoundError("Model file not found. Please ensure the model is trained first.")
            
            # Load model (this should work)
            self.model = joblib.load(model_path)
            print("✅ Model loaded successfully")
            
            # Try to load feature names
            if os.path.exists(feature_names_path):
                try:
                    self.feature_names = joblib.load(feature_names_path)
                    print("✅ Feature names loaded successfully")
                except Exception as e:
                    print(f"⚠️ Warning: Could not load feature names: {e}")
                    # Create default feature names based on the model
                    if hasattr(self.model, 'feature_names_in_'):
                        self.feature_names = list(self.model.feature_names_in_)
                    else:
                        # Fallback feature names based on the questions
                        self.feature_names = [
                            'what is your age group?',
                            'on average, how many hours do you sleep at night?',
                            'how often do you have trouble falling asleep?',
                            'do you wake up feeling well-rested?',
                            'how often do you feel tired or drowsy during the day?',
                            'do you face difficulty concentrating or staying focused during the day?',
                            'how often do you feel anxious or nervous?',
                            'how would you describe your current emotional state?',
                            'have you experienced trauma that continues to disturb your sleep?',
                            'do you often worry excessively about the future or daily tasks before bed?',
                            'do you dwell on past events (rumination) before falling asleep?',
                            'do you experience chronic worry that keeps your mind active at night?',
                            'how often do you use mobile or digital devices before sleeping?',
                            'how often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?',
                            'do you have someone to talk to when you feel mentally low or stressed?',
                            'how would you describe the environment at your home/school/work?',
                            'do you have bright lighting in your sleeping environment?',
                            'how would you rate the noise level in your sleeping environment?',
                            'how often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?',
                            'do you experience any physical pain or discomfort while trying to sleep?',
                            'do you have any medical condition that interferes with your sleep?',
                            'are you currently taking any medications that may affect your sleep patterns?',
                            'have you been diagnosed with any sleep disorders (e.g., insomnia, apnea)?',
                            'have you experienced any hormonal changes (e.g., puberty, menstruation, menopause) affecting sleep?',
                            'are you diagnosed with any neurological disorder (e.g., parkinson\'s, epilepsy) affecting sleep?'
                        ]
            
            # Try to load scaler
            if os.path.exists(scaler_path):
                try:
                    self.scaler = joblib.load(scaler_path)
                    print("✅ Scaler loaded successfully")
                except Exception as e:
                    print(f"⚠️ Warning: Could not load scaler: {e}")
                    # Set scaler to None on failure
                    self.scaler = None
                    print("✅ Scaler set to None as fallback.")
            
            # Try to load encoders
            if os.path.exists(encoders_path):
                try:
                    self.encoders = joblib.load(encoders_path)
                    print("✅ Encoders loaded successfully")
                except Exception as e:
                    print(f"⚠️ Warning: Could not load encoders: {e}")
                    # Create default encoders
                    self.encoders = {}
                    print("✅ Created fallback encoders")
            
            return True
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            return False

    def normalize_text(self, text):
        """Normalize text data"""
        if isinstance(text, str):
            return text.strip().lower()
        return text

    def encode_features(self, df_input):
        """Encode categorical features using the trained encoders or fallback to manual encoding."""
        df_encoded = df_input.copy()
        
        # Normalize text values to lowercase
        for col in df_encoded.columns:
            df_encoded[col] = df_encoded[col].apply(self.normalize_text)

        # --- Manual Encoding ---
        # This is now the primary method to ensure consistency.
        
        # Apply ordinal encoding
        for column, mapping in ORDINAL_MAPPINGS.items():
            if column in df_encoded.columns:
                df_encoded[column] = df_encoded[column].map(mapping)

        # Apply binary encoding
        for column, mapping in BINARY_MAPPINGS.items():
            if column in df_encoded.columns:
                df_encoded[column] = df_encoded[column].map(mapping)
        
        # For any other columns that might be objects, encode them numerically
        for column in df_encoded.columns:
            if df_encoded[column].dtype == 'object':
                df_encoded[column] = pd.Categorical(df_encoded[column]).codes
        
        df_encoded = df_encoded.fillna(0)
        return df_encoded

    def predict_sleep_score(self, input_data):
        """Predict sleep score for new data"""
        if self.model is None:
            raise ValueError("Model not loaded. Please load the model first.")
        
        # Convert dict to single-row DataFrame
        df_input = pd.DataFrame([input_data])
        
        # Encode features
        df_encoded = self.encode_features(df_input)
        
        # Ensure all required features are present
        for col in self.feature_names:
            if col not in df_encoded.columns:
                df_encoded[col] = 0
        
        # Reorder columns to match training features
        X_input = df_encoded[self.feature_names]
        
        # Scale input
        if self.scaler:
            X_input_scaled = self.scaler.transform(X_input)
        else:
            # If scaler is not available, use the input as is
            X_input_scaled = X_input
        
        # Predict
        prediction = self.model.predict(X_input_scaled)
        return prediction[0]

# Initialize the predictor
predictor = SleepScorePredictor()

# --- Authentication Endpoints ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not all([email, password, name]):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email address already in use'}), 409

    new_user = User(name=name, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'User created successfully',
        'user': {'name': new_user.name, 'email': new_user.email}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {'name': user.name, 'email': user.email}
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Sleep Analysis API is running'
    })

@app.route('/api/predict', methods=['POST'])
def predict_sleep_score():
    """Predict sleep score and save results to the database"""
    try:
        data = request.get_json()
        
        if not data or 'answers' not in data or 'email' not in data:
            return jsonify({'error': 'Missing answers or user email'}), 400

        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        answers_data = data['answers']
        
        # Transform frontend question keys to backend feature names
        input_for_predictor = {}
        for frontend_question, answer in answers_data.items():
            backend_question = QUESTION_MAPPING.get(frontend_question)
            if backend_question:
                input_for_predictor[backend_question] = answer
        
        # Make prediction
        predicted_score = predictor.predict_sleep_score(input_for_predictor)

        # Calculate sleep effectiveness
        min_score, max_score = 25, 53
        effectiveness = max(0, min(100, ((predicted_score - min_score) / (max_score - min_score)) * 100))
        
        # Get age group for recommendations
        age_group_answer = input_for_predictor.get("what is your age group?", "19–30 (young adults)")
        age_group_key = age_group_answer.strip().lower()
        
        # Generate recommendations
        recommendations = get_sleep_recommendations(age_group_key, predicted_score, effectiveness)
        
        # Save result to database
        new_result = QuizResult(
            user_id=user.id,
            answers=json.dumps(answers_data),
            sleep_score=round(predicted_score, 2),
            effectiveness_percentage=round(effectiveness, 2),
            recommendations=recommendations
        )
        db.session.add(new_result)
        db.session.commit()

        return jsonify({
            'success': True,
            'sleep_score': round(predicted_score, 2),
            'effectiveness_percentage': round(effectiveness, 2),
            'recommendations': recommendations,
        })
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/api/results/<email>', methods=['GET'])
def get_results(email):
    """Get all quiz results for a user"""
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    results = []
    for result in user.quiz_results:
        results.append({
            'id': result.id,
            'timestamp': result.timestamp.isoformat(),
            'answers': json.loads(result.answers),
            'sleep_score': result.sleep_score,
            'effectiveness_percentage': result.effectiveness_percentage,
            'recommendations': result.recommendations,
        })
    
    # Sort results by timestamp, newest first
    results.sort(key=lambda r: r['timestamp'], reverse=True)

    return jsonify({'success': True, 'results': results})

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """Get the list of questions for the frontend"""
    questions = [
        {
            "question": "What is your age group?",
            "options": ["0–12 (Children)", "13–18 (Adolescents)", "19–30 (Young Adults)", "31+ (Adults & Seniors)"]
        },
        {
            "question": "On average, how many hours do you sleep at night?",
            "options": ["Less than 4 hours", "4–6 hours", "6–8 hours", "More than 8 hours"]
        },
        {
            "question": "How often do you have trouble falling asleep?",
            "options": ["Never", "Occasionally", "Frequently", "Always"]
        },
        {
            "question": "Do you wake up feeling well-rested?",
            "options": ["Always", "Often", "Sometimes", "Never"]
        },
        {
            "question": "How often do you feel tired or drowsy during the day?",
            "options": ["Never", "Rarely", "Frequently", "Every day"]
        },
        {
            "question": "Do you face difficulty concentrating or staying focused during the day?",
            "options": ["Never", "Occasionally", "Often", "Always"]
        },
        {
            "question": "How often do you feel anxious or nervous?",
            "options": ["Never", "Sometimes", "Often", "Always"]
        },
        {
            "question": "How would you describe your current emotional state?",
            "options": ["Happy and content", "Occasionally stressed", "Often overwhelmed", "Mentally distressed"]
        },
        {
            "question": "Have you experienced trauma that continues to disturb your sleep?",
            "options": ["No trauma", "Yes, but sleep unaffected", "Yes, occasionally affects sleep", "Yes, frequently affects sleep"]
        },
        {
            "question": "Do you often worry excessively about the future or daily tasks before bed?",
            "options": ["Never", "Occasionally", "Frequently", "Always"]
        },
        {
            "question": "Do you dwell on past events (rumination) before falling asleep?",
            "options": ["Never", "Occasionally", "Frequently", "Always"]
        },
        {
            "question": "Do you experience chronic worry that keeps your mind active at night?",
            "options": ["Never", "Occasionally", "Frequently", "Always"]
        },
        {
            "question": "How often do you use mobile or digital devices before sleeping?",
            "options": ["Never", "Occasionally", "Most nights", "Every night"]
        },
        {
            "question": "How often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?",
            "options": ["Never", "Rarely", "Frequently", "Daily"]
        },
        {
            "question": "Do you have someone to talk to when you feel mentally low or stressed?",
            "options": ["Always", "Most of the time", "Sometimes", "Never"]
        },
        {
            "question": "How would you describe the environment at your home/school/work?",
            "options": ["Very supportive", "Somewhat supportive", "Neutral", "Stressful and unsupportive"]
        },
        {
            "question": "How often does bright lighting in your room affect your ability to sleep?",
            "options": ["Never", "Sometimes", "Often", "Always"]
        },
        {
            "question": "How would you rate the noise level in your sleeping environment?",
            "options": ["Very quiet", "Mostly quiet", "Occasionally noisy", "Very noisy"]
        },
        {
            "question": "How often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?",
            "options": ["Never", "Sometimes", "Often", "Always"]
        },
        {
            "question": "Do you experience any physical pain or discomfort while trying to sleep?",
            "options": ["Never", "Occasionally", "Often", "Always"]
        },
        {
            "question": "How often do you exercise during the day?",
            "options": ["Never", "Occasionally", "Regularly", "Daily"]
        },
        {
            "question": "How would you rate your stress levels before bedtime?",
            "options": ["Very low", "Moderate", "High", "Extremely high"]
        },
        {
            "question": "How often do you take naps during the day?",
            "options": ["Never", "Rarely", "Sometimes", "Daily"]
        },
        {
            "question": "How would you describe your bedtime routine?",
            "options": ["Consistent and relaxing", "Somewhat consistent", "Inconsistent", "No routine"]
        },
        {
            "question": "How often do you feel refreshed after waking up?",
            "options": ["Always", "Often", "Sometimes", "Rarely"]
        }
    ]
    
    return jsonify({
        'success': True,
        'questions': questions
    })

def get_sleep_recommendations(age_group, sleep_score, effectiveness):
    """Generate age-specific sleep recommendations"""
    
    recommendations = {
        '0–12 (children)': {
            'title': '🧸 Sleep Recommendations for Children (0-12 years)',
            'remedies': [
                "🛏️ **Consistent Bedtime Routine**: Establish a calming 30-45 minute bedtime routine with activities like reading, gentle music, or quiet storytelling",
                "📱 **Screen Time Limits**: No screens 1-2 hours before bedtime. Blue light can disrupt melatonin production in developing brains",
                "🌙 **Optimal Sleep Duration**: Ensure 9-11 hours of sleep for school-age children (6-13 years) and 11-14 hours for preschoolers (3-5 years)",
                "🍎 **Healthy Sleep Environment**: Keep bedroom cool (65-70°F), dark, and quiet. Consider blackout curtains and white noise machines",
                "🏃 **Physical Activity**: Encourage regular outdoor play and physical activity during the day, but avoid vigorous exercise 3 hours before bedtime",
                "🥛 **Nutrition & Hydration**: Avoid caffeine completely. Limit fluids 1 hour before bedtime. Consider a light snack if hungry",
                "🧘 **Relaxation Techniques**: Teach simple breathing exercises or gentle stretching. Try progressive muscle relaxation for anxious children",
                "🎵 **Comfort Items**: Allow comfort objects like stuffed animals or soft blankets that provide security and comfort"
            ]
        },
        
        '13–18 (adolescents)': {
            'title': '🎓 Sleep Recommendations for Adolescents (13-18 years)',
            'remedies': [
                "⏰ **Circadian Rhythm Support**: Understand that teen brains naturally shift to later sleep times. Aim for 8-10 hours of sleep with consistent sleep-wake times",
                "📚 **Study Schedule Management**: Create a study schedule that doesn't require late-night cramming. Use active study techniques during peak alertness hours",
                "📱 **Digital Wellness**: Use blue light filters on devices after sunset. Create a charging station outside the bedroom for phones and tablets",
                "🏋️ **Exercise Timing**: Regular exercise is crucial but avoid intense workouts 4 hours before bedtime. Morning or afternoon exercise is ideal",
                "☕ **Caffeine Awareness**: Limit caffeine intake, especially after 2 PM. Be aware of hidden caffeine in sodas, energy drinks, and chocolate",
                "🧠 **Stress Management**: Practice stress-reduction techniques like journaling, meditation apps, or talking with trusted adults about daily pressures",
                "🛏️ **Sleep Environment**: Create a teen-friendly sleep sanctuary with comfortable bedding, appropriate temperature, and minimal light pollution",
                "👥 **Social Balance**: Balance social activities with sleep needs. Educate about the importance of sleep for academic performance and emotional regulation"
            ]
        },
        
        '19–30 (young adults)': {
            'title': '🌟 Sleep Recommendations for Young Adults (19-30 years)',
            'remedies': [
                "⚖️ **Work-Life Balance**: Establish clear boundaries between work/study and personal time. Avoid checking emails or work-related content before bed",
                "🍷 **Substance Awareness**: Limit alcohol consumption, especially 3 hours before bedtime. Alcohol disrupts REM sleep and sleep quality",
                "💪 **Regular Exercise Routine**: Aim for 150 minutes of moderate exercise weekly. Morning workouts can help regulate circadian rhythms",
                "🧘 **Mindfulness & Meditation**: Practice mindfulness meditation, progressive muscle relaxation, or use guided sleep meditation apps",
                "📅 **Consistent Schedule**: Maintain regular sleep-wake times even on weekends. Avoid 'social jet lag' from irregular weekend sleep patterns",
                "🌡️ **Sleep Environment Optimization**: Invest in quality mattress and pillows. Keep bedroom temperature between 60-67°F for optimal sleep",
                "🍽️ **Nutrition Timing**: Avoid large meals 3 hours before bedtime. If hungry, opt for light snacks with tryptophan (turkey, milk, bananas)",
                "💼 **Financial Stress Management**: Address financial anxieties through budgeting, financial planning, or seeking counseling to reduce bedtime worry"
            ]
        },
        
        '31+ (adults & seniors)': {
            'title': '🏡 Sleep Recommendations for Adults & Seniors (31+ years)',
            'remedies': [
                "🏥 **Medical Evaluation**: Regular check-ups to identify and treat sleep disorders, sleep apnea, or other medical conditions affecting sleep",
                "💊 **Medication Review**: Consult healthcare providers about medications that might affect sleep. Some medications can cause insomnia or drowsiness",
                "🧘 **Relaxation Practices**: Incorporate relaxation techniques like deep breathing, gentle yoga, or tai chi to manage stress and prepare for sleep",
                "🌿 **Natural Sleep Aids**: Consider natural options like chamomile tea, valerian root, or melatonin supplements (consult healthcare provider first)",
                "📖 **Sleep Hygiene Education**: Understand age-related sleep changes. Older adults may need less sleep (7-8 hours) but should maintain quality",
                "🏃 **Age-Appropriate Exercise**: Regular, moderate exercise like walking, swimming, or gentle stretching. Avoid vigorous exercise close to bedtime",
                "🍽️ **Dietary Considerations**: Limit spicy foods, large meals, and excessive fluids before bedtime. Consider foods rich in magnesium and calcium",
                "🧠 **Cognitive Health**: Engage in mentally stimulating activities during the day. Address anxiety, depression, or chronic pain that may affect sleep",
                "🛏️ **Comfort Optimization**: Ensure mattress and pillows provide adequate support for joints and spine. Consider memory foam or adjustable beds if needed"
            ]
        }
    }
    
    if age_group not in recommendations:
        return "No specific recommendations available for this age group."
    
    rec = recommendations[age_group]
    
    # Create formatted output
    output = f"\n{'='*60}\n"
    output += f"{rec['title']}\n"
    output += f"{'='*60}\n"
    
    # Add effectiveness context
    if effectiveness < 50:
        output += f"🚨 **Priority Level: HIGH** - Your sleep effectiveness is {effectiveness:.1f}%\n"
        output += "Focus on implementing 3-4 of these recommendations immediately:\n\n"
    elif effectiveness < 75:
        output += f"⚠️ **Priority Level: MODERATE** - Your sleep effectiveness is {effectiveness:.1f}%\n"
        output += "Consider implementing 2-3 of these recommendations to improve your sleep:\n\n"
    else:
        output += f"✅ **Priority Level: MAINTENANCE** - Your sleep effectiveness is {effectiveness:.1f}%\n"
        output += "Great job! Use these recommendations to maintain and optimize your sleep:\n\n"
    
    # Add all recommendations
    for i, remedy in enumerate(rec['remedies'], 1):
        output += f"{i}. {remedy}\n\n"
    
    # Add general tips
    output += "💡 **General Tips:**\n"
    output += "• Start with 1-2 recommendations and gradually incorporate more\n"
    output += "• Track your sleep improvements over 2-3 weeks\n"
    output += "• Consult healthcare providers for persistent sleep issues\n"
    output += "• Remember that sleep improvement takes time and consistency\n"
    output += f"{'='*60}\n"
    
    return output

if __name__ == '__main__':
    with app.app_context():
        # Create the database tables if they don't exist
        db.create_all()

    print("🚀 Starting Sleep Analysis API...")
    print("📊 Loading ML model...")
    
    # Try to load the model on startup
    if predictor.load_model():
        print("✅ Model loaded successfully")
    else:
        print("⚠️ Model not loaded. API will attempt to load on first request.")
    
    print("🌐 API is ready to receive requests")
    print("📍 API endpoints:")
    print("   - GET  /api/health - Health check")
    print("   - GET  /api/questions - Get quiz questions")
    print("   - POST /api/predict - Predict sleep score")
    print("   - POST /api/signup - User signup")
    print("   - POST /api/login - User login")
    print("   - GET  /api/results/<email> - Get user quiz results")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
