# NeoHealth

### *Empowering Women Through AI-Driven Healthcare Analytics*

---

## 📝 Description
**NeoHealth** is a comprehensive healthcare platform designed to provide women with deep insights into their physiological health. By combining machine learning, real-time data tracking, and generative AI, the platform offers a holistic approach to wellness management. It transforms complex hormonal data into actionable insights, helping users understand their bodies better through every phase of their cycle.

## 📖 Abstract
In many healthcare systems, monitoring reproductive and hormonal health can be fragmented and data-heavy. NeoHealth addresses this by providing a unified, AI-enhanced interface that analyzes physiological trends such as Estrogen, LH (Luteinizing Hormone), PdG, and physical activities like heart rate and step counts. 

The platform utilizes an **XGBoost-driven prediction engine** to forecast menstrual phases with high precision. Furthermore, it integrates a **Google Gemini-powered AI Assistant** that offers context-aware guidance in multiple languages (English, Hindi, and Gujarati). By merging predictive analytics with natural language processing, NeoHealth creates a proactive and accessible health monitoring ecosystem that prioritizes user privacy and data-driven wellness.

---

## 🚀 All Features
- **Smart Cycle Tracking**: Automatic prediction of menstrual phases using advanced ML models.
- **Multilingual AI Health Assistant**: A context-aware chatbot (Gemini AI) that understands your health data and responds in English, Hindi, and Gujarati.
- **Interactive Wellness Dashboard**: A premium, high-gloss interface featuring real-time health analytics via Recharts.
- **Trend Analysis & Visualization**: Long-term tracking and graphical representation of Estrogen, LH, PdG, Heart Rate, and Step Count.
- **Global Accessibility (i18n)**: Instant language switching across the entire UI for a localized experience.
- **Explainable AI (XAI)**: Provides transparent insights into "Why" a specific prediction was made, breaking down the logic behind the AI.
- **Secure Authentication**: Robust JWT-based registration and login system ensuring user data security.
- **Comprehensive Daily Logging**: Easy-to-use forms for tracking daily symptoms, sleep quality, stress levels, and more.
- **Responsive Design**: Optimized experience across Desktop, Tablet, and Mobile devices with a native app-like feel.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Localization**: i18next
- **Visualization**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Framework**: Python + Flask
- **AI Engine**: Google Gemini API
- **ML Models**: XGBoost, Scikit-Learn, Pandas
- **Database**: PostgreSQL / SQLAlchemy
- **Authentication**: Flask-JWT-Extended

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL Database

### 1. Clone the Repository
```bash
git clone https://github.com/vishaljani04/Neohealth.git
cd Neohealth
```

### 2. Install Dependencies
You can set up both the frontend and backend automatically from the root folder:
```bash
npm run setup
```

### 3. Environment Configuration
Navigate to the `backend` folder and set up your `.env` file:
```bash
cd backend
cp .env.example .env
# Open .env and add your GEMINI_API_KEY and DATABASE_URL
```

### 4. Run the Application
From the root folder, start both the Backend and Frontend concurrently:
```bash
npm run dev
```

---

## 📂 Project Structure
```text
NeoHealth/
├── requirements.txt    # Integrated Python dependencies
├── package.json        # Frontend dependencies & root scripts
├── backend/            # Flask API, AI Logic & ML Models
│   ├── app/            # Core API routes & controllers
│   ├── ml_models/      # Pre-trained XGBoost models
│   └── run.py          # Backend entry point
└── frontend/           # React Application
    ├── src/            # Source code (Components & Pages)
    └── public/         # Static assets & localization files
```

---

## 👥 Contributors
1. **Zeel Panchal**
2. **Chirag Mandani**
3. **Bansari Patel**
4. **Vishal Jani**

---
© 2026 NeoHealth. Built for modern wellness.
