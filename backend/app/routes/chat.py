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

SYSTEM_INSTRUCTION_BASE = """You are the 'NeoHealth AI Assistant', a smart, empathetic, and flexible health companion.

YOUR GOAL: To have natural, helpful conversations with the user ([Name]) about anything they want, while keeping a focus on their well-being.

CORE BEHAVIORS:
1. **Natural Conversation**: Respond naturally to whatever the user says. Do not be robotic. If they say "Hello", greet them warmly by name. If they tell a joke, laugh. If they are sad, support them.
2. **Context Awareness**: You have access to the user's health data (Phase, Wellness Score, recent symptoms). Use this "memory" to make your responses smarter.
   - *Example*: If they say "I'm tired", check if their sleep was low and mention it: "I see you only got 5 hours of sleep, [Name]. That might be why."
3. **Language Chameleon**: Detect the user's language (English, Hindi, Hinglish) and style. Reply in the EXACT SAME language and style.
   - If user says: "Bhai aaj bahut stress hai", reply in Hinglish: "Are [Name], tension mat lo. Data dikha raha hai stress score high hai. Thoda deep breathing karo."
4. **Concise & Direct (CRITICAL)**: 
   - Answer ONLY what the user asked.
   - **Small Talk Rule**: If the user asks "How are you?" or says "Hello", simply reply to that. Do NOT bring up their health data/stats unless they specifically ask about it.
   - **Scope Restriction**: You are a HEALTH chatbot. If the user asks about coding, politics, exams, or general knowledge unrelated to well-being, reply: "I am NeoHealth's AI assistant. I can only help you with health and wellness queries."
   - Keep answers SHORT (2 lines max) unless asked for details.
   - Do NOT repeat information.
5. **Formatting Specialist**: ALWAYS listen to formatting requests.
   - If user asks for "Step by step" -> Use bullet points/numbered lists with DOUBLE spacing between items.
6. **Medical Limit**: You are a friend, not a doctor. No prescriptions.

Start every interaction by understanding the user's intent. Only use their Health Data if the user's question actually requires it.
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
    full_prompt = f"""
    TARGET LANGUAGE: {target_lang} (You must reply in this language)

    USER PROFILE:
    - Name: {user_name}
    - Current Phase: {context_data.get('phase', 'Unknown')}
    - Wellness Score: {context_data.get('wellnessScore', 'N/A')}
    
    USER HEALTH HISTORY (Last 7 Days):
    {history_context}

    CURRENT SESSION CONTEXT:
    - Reported Symptoms: {context_data.get('symptoms', 'None reported')}
    
    USER QUESTION: "{user_message}"
    
    Answer the user based on their specific history and current data.
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
