# Sleep Analysis Application

A full-stack web application that analyzes sleep patterns using machine learning and provides personalized recommendations. The application consists of a React frontend and a Flask backend with a trained ML model.

## Features

- **Interactive Quiz**: 25 questions about sleep habits and lifestyle
- **ML-Powered Analysis**: Uses a Random Forest model to predict sleep scores
- **Personalized Recommendations**: Age-specific sleep improvement suggestions
- **Beautiful UI**: Modern, responsive design with starry background
- **User Authentication**: Login/signup system with local storage
- **Dashboard**: View and track your sleep analysis results

## Project Structure

```
Sleep Analysis/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── models/               # Trained ML model files
│   │   ├── sleep_model.pkl
│   │   ├── scaler.pkl
│   │   ├── feature_names.pkl
│   │   └── encoders.pkl
│   └── testing_final.ipynb   # Model training notebook
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Index.jsx     # Landing page
│   │   │   ├── Login.jsx     # Login page
│   │   │   ├── Signup.jsx    # Signup page
│   │   │   ├── Questions.jsx # Quiz interface
│   │   │   └── Dashboard.jsx # Results dashboard
│   │   └── components/
│   │       └── StarryBackground.jsx
│   └── package.json
└── README.md
```

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **pip** (Python package manager)

## Installation & Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

## Running the Application

### 1. Start the Backend Server

```bash
# In the backend directory
cd backend

# Activate virtual environment (if using one)
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Start the Flask server
python app.py
```

The backend server will start on `http://localhost:5000`

### 2. Start the Frontend Development Server

```bash
# In the frontend directory
cd frontend

# Start the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

## API Endpoints

### Backend API (`http://localhost:5000`)

- `GET /api/health` - Health check endpoint
- `GET /api/questions` - Get quiz questions
- `POST /api/predict` - Predict sleep score from quiz answers

### Example API Usage

```javascript
// Get questions
fetch('http://localhost:5000/api/questions')
  .then(response => response.json())
  .then(data => console.log(data));

// Predict sleep score
fetch('http://localhost:5000/api/predict', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    "What is your age group?": "19–30 (Young Adults)",
    "On average, how many hours do you sleep at night?": "6–8 hours",
    // ... other answers
  }),
})
.then(response => response.json())
.then(data => console.log(data));
```

## How It Works

### 1. User Flow
1. User signs up/logs in
2. Takes the 25-question sleep analysis quiz
3. Frontend sends answers to backend API
4. Backend processes data through ML model
5. Returns sleep score, effectiveness percentage, and recommendations
6. Results displayed in dashboard

### 2. ML Model
- **Algorithm**: Random Forest Regressor
- **Features**: 25 categorical features from quiz responses
- **Output**: Sleep score (25-53 range)
- **Effectiveness**: Calculated as percentage based on score range

### 3. Data Processing
- Categorical encoding for all features
- Feature scaling using StandardScaler
- Age-specific recommendation generation

## Model Training

The ML model was trained using the notebook `backend/testing_final.ipynb` which includes:
- Data preprocessing and cleaning
- Feature engineering
- Model training and validation
- Model serialization (saved as .pkl files)

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Ensure all dependencies are installed: `pip install -r requirements.txt`
   - Check if port 5000 is available
   - Verify Python version (3.8+)

2. **Frontend can't connect to backend**
   - Ensure backend is running on `http://localhost:5000`
   - Check CORS settings in backend
   - Verify API endpoints are accessible

3. **Model loading errors**
   - Ensure all .pkl files are in the `backend/models/` directory
   - Check file permissions
   - Verify model files are not corrupted

4. **CORS errors**
   - Backend has CORS enabled for all origins
   - If issues persist, check browser console for specific errors

### Development Tips

- Use browser developer tools to debug API calls
- Check Flask server logs for backend errors
- Use React Developer Tools for frontend debugging
- Monitor network tab for API request/response details

## Technologies Used

### Backend
- **Flask**: Web framework
- **Flask-CORS**: Cross-origin resource sharing
- **scikit-learn**: Machine learning library
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **joblib**: Model serialization

### Frontend
- **React**: UI framework
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Vite**: Build tool

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please ensure you have proper licenses for any external data or models used.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the browser console and server logs
4. Create an issue with detailed error information 