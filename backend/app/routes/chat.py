import os
import google.generativeai as genai
import requests
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, HealthRecord, Prediction, db
from groq import Groq

bp = Blueprint('chat', __name__)

# Configure Gemini
GENAI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

# Configure Groq
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

SYSTEM_INSTRUCTION_BASE = """You are 'NeoHealth AI', a user-friendly health insight assistant.

YOUR GOAL: Analyze daily health data and generate simple, non-medical, easy-to-understand insights.

IMPORTANT RULES:
1. Never show medical terms (estrogen, LH, PdG, cortisol, etc.) to NORMAL users.
2. NORMAL users see only body signals, feelings, and simple guidance.
3. PROFESSIONAL users can see structured data but NO diagnosis.
4. You are NOT a doctor. Do NOT give medical diagnosis or treatment.
5. Base analysis ONLY on provided data.
6. Prioritize smartwatch data over subjective answers if available.
7. Tone: Calm, supportive, reassuring. Never cause fear.

OUTPUT FORMAT (NORMAL USER):
- Daily Body Summary (2-3 lines, e.g., "Body feels a bit tired today.")
- Indicators (Emojis): 🟢 Energy, 🟡 Stress, 🟢 Recovery, 🟡 Body Comfort
- Gentle Suggestions (Max 3 simple actions: water, rest, walk)
- Friendly Closing

OUTPUT FORMAT (PROFESSIONAL USER):
- Structured Health Insight (Energy, Stress, Sleep, Activity)
- Data-backed Observations
- Disclaimer: "Informational insight, not medical advice."

EDGE CASES:
- Missing data: "Data is a bit low today, complete entry for better insights."
- Normal data: Positivity, don't over-analyze.

FINAL GOAL: Make the user feel understood, in control, and motivated.
"""

def get_user_history_context(user_id):
    """Fetches last 7 days of health records to build a history context."""
    try:
        seven_days_ago = datetime.utcnow().date() - timedelta(days=7)
        records = HealthRecord.query.filter(
            HealthRecord.user_id == user_id, 
            HealthRecord.date >= seven_days_ago
        ).order_by(HealthRecord.date.asc()).all()

        if not records:
            return "No specific health records found for the past week."

        history_lines = []
        for r in records:
            date_str = r.date.strftime('%Y-%m-%d')
            # Format some key metrics
            sleep = f"{r.deep_sleep_in_minutes}m deep sleep" if r.deep_sleep_in_minutes else "Sleep N/A"
            stress = f"Stress lvl {r.stress}/4" if r.stress is not None else "Stress N/A"
            mood = f"Mood {r.moodswing}/4" if r.moodswing is not None else "Mood N/A"
            symptoms = []
            if r.cramps and r.cramps > 0: symptoms.append(f"Cramps {r.cramps}/4")
            if r.fatigue and r.fatigue > 0: symptoms.append(f"Fatigue {r.fatigue}/4")
            if r.bloating and r.bloating > 0: symptoms.append(f"Bloating {r.bloating}/4")
            
            symptoms_str = ", ".join(symptoms) if symptoms else "No major symptoms"
            
            history_lines.append(f"- {date_str}: {sleep}, {stress}, {mood}. Symptoms: {symptoms_str}")
        
        return "\n".join(history_lines)
    except Exception as e:
        print(f"Error fetching history: {e}")
        return "Could not retrieve history due to database error."

def query_groq(prompt, system_instruction):
    """Queries Groq API for Llama 3."""
    if not groq_client:
        return "Groq API Key is missing. Please configure GROQ_API_KEY in backend .env file."
        
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_instruction,
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return f"Groq API Error: {str(e)}"

@bp.route('/message', methods=['POST'])
@jwt_required()
def chat_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    user_message = data.get('message', '')
    context_data = data.get('context', {})
    model_preference = data.get('model', 'gemini') # 'gemini' or 'llama' (which now means Groq Llama)

    # 1. Fetch User Info
    user = User.query.get(user_id)
    user_name = user.username if user else "Friend"

    # 2. Build RAG Context
    history_context = get_user_history_context(user_id)
    
    # Determine language
    lang_code = context_data.get('language', 'en')
    lang_map = {'en': 'English', 'hi': 'Hindi', 'gu': 'Gujarati'}
    target_lang = lang_map.get(lang_code, 'English')

    # 3. Construct the Full Prompt
    user_mode = context_data.get('mode', 'normal') # Default to normal
    
    full_prompt = f"""
    TARGET LANGUAGE: {target_lang} (Reply in this language)
    USER MODE: {user_mode} (Strictly follow output format for this mode)

    USER PROFILE:
    - Name: {user_name}
    - Phase: {context_data.get('phase', 'Unknown')}
    
    DATA INPUTS:
    - Smartwatch: Sleep Score={context_data.get('sleepScore', 'N/A')}, Deep Sleep={context_data.get('deepSleep', 'N/A')}m, HR={context_data.get('heartRate', 'N/A')}, Steps={context_data.get('steps', 'N/A')}, Stress={context_data.get('stressScore', 'N/A')}
    - Manual: Symptoms={context_data.get('symptoms', 'None')}, Mood={context_data.get('mood', 'N/A')}
    
    HISTORY (Last 7 Days):
    {history_context}
    
    USER QUESTION: "{user_message}"
    
    Analyze the data based on the rules provided in system instructions.
    """

    # 4. Route to Model
    if model_preference == 'llama':
        # Use Groq for Llama 3
        response_text = query_groq(full_prompt, SYSTEM_INSTRUCTION_BASE)
        return jsonify({"response": response_text}), 200
    
    # Default: Gemini
    if not GENAI_API_KEY:
        # Fallback to Groq if Gemini key is missing
        if groq_client:
             response_text = query_groq(full_prompt, SYSTEM_INSTRUCTION_BASE)
             return jsonify({"response": response_text + " (Fallback to Groq)"}), 200

        return jsonify({"response": "Cloud AI API Keys missing. Please configure GEMINI_API_KEY or GROQ_API_KEY."}), 200

    try:
        # Use existing configured Gemini
        model = genai.GenerativeModel('gemini-flash-latest', system_instruction=SYSTEM_INSTRUCTION_BASE)
        response = model.generate_content(full_prompt)
        return jsonify({"response": response.text}), 200

    except Exception as e:
        error_str = str(e)
        print(f"Gemini API Error: {error_str}")
        
        # Fallback to Groq on error
        if groq_client:
             response_text = query_groq(full_prompt, SYSTEM_INSTRUCTION_BASE)
             return jsonify({"response": response_text}), 200
             
        msg = "I'm having trouble connecting to the Cloud AI."
        return jsonify({"response": msg + " Error details: " + str(e)}), 200
