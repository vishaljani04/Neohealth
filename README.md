# NeoHealth AI - Healthcare Analytics Platform

## 📋 Project Overview
**NeoHealth AI** is a production-grade healthcare analytics platform designed to empower women with actionable health insights. By leveraging advanced machine learning algorithms, the platform predicts menstrual phases and provides a comprehensive dashboard for tracking vital health metrics. It bridges the gap between raw health data and personalized wellness management.

## ❓ Problem Statement
Women's health tracking is often fragmented, relying on manual entry without predictive insights. Traditional apps may lack the integration of complex hormonal data with daily lifestyle metrics like sleep, stress, and heart rate. There is a need for a unified solution that not only logs data but uses it to predict physiological states and offer data-driven health observability.

## 🎯 Objectives
- **Predictive Healthcare**: To accurately predict menstrual cycle phases using historical and real-time hormonal data.
- **Holistic Monitoring**: To provide a unified dashboard for tracking hormones, sleep, stress, and physical activity.
- **User-Centric Design**: To offer a modern, responsive, and intuitive user interface.
- **Data-Driven Insights**: To enable users to make informed lifestyle decisions based on AI-generated analytics.

## ✨ Features
- **🔐 Secure Authentication**: Robust JWT-based user registration and login system.
- **🧠 AI Cycle Prediction**: Real-time prediction of menstrual phases (Follicular, Ovulation, Luteal, Menstrual) using XGBoost.
- **📊 Interactive Dashboard**: Visual analytics for trends in hormonal levels (LH, Estrogen, PdG), heart rate, and steps.
- **📝 Comprehensive Logging**: Easy-to-use forms for logging daily symptoms, vitals, and lifestyle metrics.
- **📈 Trend Analysis**: Historical reviews of health data with dynamic charts powered by Recharts.
- **📱 Responsive Design**: Fully responsive UI built with React, Vite, and Framer Motion for smooth interactions.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS (Modern aesthetic with Glassmorphism)
- **Visualization**: Recharts
- **Icons**: Lucide-React
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL / SQLite (via SQLAlchemy)
- **Authentication**: Flask-JWT-Extended
- **ML Integration**: Scikit-Learn, XGBoost, Joblib
- **Data Processing**: Pandas, NumPy

## 🏗 System Architecture & Workflow
1.  **Data Ingestion**: Users input daily health metrics via the frontend client.
2.  **API Layer**: The Flask backend receives data, validates it using Marshmallow schemas, and stores it in the database.
3.  **Preprocessing Pipeline**: Raw data is cleaned, scaled, and transformed. Previous days' lags are calculated to capture temporal dependencies.
4.  **Inference Engine**: The pre-trained XGBoost model loads to predict the current menstrual phase based on user inputs.
5.  **Response**: The prediction and insights are sent back to the frontend for display.

## 🤖 AI/ML Models
The core of NeoHealth AI is a robust classification model.
- **Algorithm**: XGBoost (Extreme Gradient Boosting) Classifier.
- **Target**: Menstrual Phase (4 classes).
- **Features**: 
    - **Hormones**: Luteinizing Hormone (LH), Estrogen, Pregnanediol Glucuronide (PdG).
    - **Vitals**: Resting Heart Rate, Daily Steps, Deep Sleep Minutes.
    - **Symptoms**: Cramps, Fatigue, Mood Swings, Bloating.
    - **Derived**: Lag/History features (previous 1-2 days) for temporal context.
- **Performance**: Optimized for multi-class classification using `mlogloss`.

## 📂 Dataset
The model is trained on a comprehensive dataset containing daily logs of women's health metrics.
- **Source**: Aggregated clinical study data and synthetic augmentation.
- **Attributes**: Includes hormonal levels, physiological markers (temperature, heart rate), and subjective symptom logs.
- **Preprocessing**: Data encoded with LabelEncoder and scaled using StandardScaler.

## ⚙ Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)

### 1. Clone the Repository
```bash
git clone https://github.com/zpanchal04/Neohealth.git
cd Neohealth
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
```
*Note: Ensure you create a `.env` file in `backend/` if required by the configuration.*

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🚀 How to Run

### Start the Backend
```bash
# In the backend directory (with venv activated)
python train_and_save_model.py # Optional: Retrain model if data changes
python run.py
```
Server runs at `http://localhost:5000`.

### Start the Frontend
```bash
# In the frontend directory
npm run dev
```
Client runs at `http://localhost:5173`.

## 📖 Usage Guide
1.  **Register/Login**: Create an account to start tracking your personal data.
2.  **Dashboard**: View your current cycle phase prediction and summary cards.
3.  **Log Data**: Use the "Add Log" button to enter today's metrics (hormones, symptoms, sleep).
4.  **View Trends**: Navigate to the Analytics section to see graphs of your health progress over time.
5.  **Get Insights**: Check the AI prediction widget for real-time phase analysis.

## 📂 Project Structure
```
NeoHealth/
├── backend/
│   ├── app/                # Flask application logic (routes, models)
│   ├── ml_models/          # Saved XGBoost models & scalers
│   ├── run.py              # Application entry point
│   ├── train_and_save_model.py # ML training script
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/                # React source code
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views
│   │   └── services/       # API integration
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── data/
│   ├── processed/          # Cleaned CSVs for training
│   └── raw/                # Original datasets
└── notebook/               # Jupyter notebooks for EDA and model research
```

## 📊 Results / Output
- **High Accuracy**: The model successfully identifies cycle phases with high precision based on hormonal patterns.
- **Real-time Responsiveness**: Predictions are generated instantly upon data entry.
- **Visual Clarity**: Users can clearly correlate lifestyle factors (like sleep) with hormonal changes.


## 🔮 Future Scope
- **Wearable Integration**: Direct sync with Apple Health/Fitbit APIs.
- **Mobile App**: Native mobile application using React Native.
- **Advanced NLP**: AI Chatbot for health Q&A.
- **Community Features**: Anonymized community insights and support forums.

## 👥 Contributors
- **Zeel Panchal** - *AI/ML Engineer*
- **Chirag Mandani** - *Full Stack Developer*
- **Vishal Jani** - *Full Stack Developer*
- **Bansari Patel** - *AI/ML Engineer*


