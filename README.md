# NeoHealth AI - Healthcare Analytics Platform

## 📋 Project Overview
**NeoHealth AI** is a production-grade healthcare analytics platform designed to empower women with actionable health insights. By leveraging advanced machine learning and Generative AI, the platform predicts menstrual phases, provides a comprehensive wellness dashboard, and offers a multilingual AI Health Assistant for personalized advice.

**Major Update (February 2025):** transformed from a static prototype to a **Fully Integrated Full-Stack Application** with a live Python/Flask backend and PostgreSQL database. The UI is now completely responsive across Desktop, Tablet, and Mobile devices.

---

## ✨ Unique & New Features (Phase 2 Update)

### 1. 🤖 Multilingual AI Health Assistant
A context-aware chatbot powered by **Google Gemini AI**.
- **Context-Integrated**: It doesn't just chat; it knows your current cycle phase, wellness score, and recent symptoms to give personalized advice.
- **Multilingual Support**: Fully operational in **English (EN)**, **Hindi (HI)**, and **Gujarati (GU)**.
- **Natural Language**: Ask about period cramps, diet tips for the follicular phase, or why your stress levels are high.

### 2. 🌍 Advanced Internationalization (i18n)
The entire application UI has been localized to support a diverse user base:
- **Dynamic Language Switching**: Toggle between English, Hindi, and Gujarati instantly without reloading.
- **Localized Content**: Labels, charts, predictions, and forms are fully translated to ensure accessibility.

### 3. 🧠 Smart Period Prediction Engine
An upgraded prediction logic that uses multiple sources:
- **XGBoost Inference**: Machine learning for phase classification.
- **Heuristic Logic**: Custom algorithms to predict exact future period dates based on historical data.
- **Manual Overrides**: Allows users to set their manual cycle length for personalized accuracy.
- **Confidence Scoring**: Transparent AI confidence levels for every prediction.

### 4. 📊 Full-Screen Premium Dashboard
Redesigned layout for a "wow" factor:
- **Edge-to-Edge Design**: Optimized for modern wide monitors with a balanced centering system.
- **Responsive Mobile & Tablet View**: The entire application now adapts seamlessly to smaller screens with a native app-like feel, including a collapsible navigation menu.
- **Glassmorphism UI**: High-gloss, modern aesthetic using translucent layers and vibrant gradients.
- **Responsive Analytics**: Real-time Recharts integration (LH, Estrogen, Heart Rate) that scales perfectly.

---

## 🚀 Core Features (Base Functionality)

- **🔐 Secure Authentication**: Robust JWT-based user register/login with mobile number verification.
- **📈 Trend Analysis**: Historical reviews of LH, Estrogen, PdG, heart rate, and steps.
- **📝 Comprehensive Logging**: Easy-to-use forms for daily symptoms, sleep score, and stress tracking.
- **🧩 Explainable AI (XAI)**: Features like "Why this prediction?" break down the data logic behind the AI's conclusions.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Localization**: i18next + react-i18next
- **Visualization**: Recharts
- **Icons**: Lucide-React
- **Animations**: Framer Motion

### Backend
- **Framework**: Flask (Python)
- **AI Engine**: Google Gemini API (Generative AI)
- **ML Models**: XGBoost, Scikit-Learn
- **Database**: PostgreSQL / SQLAlchemy
- **Authentication**: Flask-JWT-Extended

---

## ⚙ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Gemini API Key (Optional, for Chatbot)

### 1. Clone the Repository
```bash
git clone https://github.com/vishaljani04/Neohealth.git
cd Neohealth
```

### ⚙️ Quick Installation (All-in-One)
Now you can set up both backend and frontend from the root folder!

#### 1. Setup Environment
```bash
# Installs both Python (pip) and Node (npm) dependencies automatically
npm run setup
```

#### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Open .env and fill in your keys (GEMINI_API_KEY, DATABASE_URL, etc.)
```

#### 3. Run Everything
```bash
# From the root folder, starts both Backend & Frontend together
npm run dev
```

---

## 📂 Project Structure
All requirement files are now in the **Root Folder**:
- `requirements.txt` (Python/Backend Dependencies)
- `package.json` (Node/Frontend Dependencies & Setup Scripts)

```
NeoHealth/
├── requirements.txt    # ← Backend Requirements
├── package.json         # ← Frontend Requirements & Global Scripts
├── backend/            # Flask API & AI Logic
└── frontend/           # React Web App
```

---

## 👥 Contributors
- **Vishal Jani** - *Full Stack Developer*
- **Chirag Mandani** - *Full Stack Developer*
- **Zeel Panchal** - *AI/ML Engineer*
- **Bansari Patel** - *AI/ML Engineer*
