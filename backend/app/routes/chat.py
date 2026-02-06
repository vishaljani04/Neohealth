import os
import google.generativeai as genai
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, HealthRecord, Prediction

bp = Blueprint('chat', __name__)

# Configure Gemini
# In a real app, ensure GEMINI_API_KEY is in .env
# We will use a fallback or expect the user to have it set
GENAI_API_KEY = os.environ.get('GEMINI_API_KEY')
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

SYSTEM_INSTRUCTION = """You are the 'NeoHealth AI Assistant', a friendly and empathetic health companion integrated into the NeoHealth dashboard. 
Your goal is to explain health data, provide wellness tips, and answer questions about the user's cycle, mood, and energy based on their data.

GUIDELINES:
1. Tone: Warm, professional, non-medical, and encouraging.
2. Context Aware: Use the provided user health data (cycle phase, wellness score, recent symptoms) to tailor your answers.
3. Restrictions: DO NOT provide medical diagnoses or prescribe medication. Always advise consulting a doctor for serious issues.
4. Brevity: Keep responses concise (under 3 paragraphs) and easy to read on a mobile/chat interface.
5. Persona: You are an AI assistant, not a human doctor.

INPUT DATA EXPLANATION:
- Wellness Score (0-100): Calculated based on sleep, stress, and activity. >75 is excellent.
- Cycle Phases: Menstruation, Follicular, Ovulation, Luteal.
"""

@bp.route('/message', methods=['POST'])
@jwt_required()
def chat_message():
    if not GENAI_API_KEY:
        return jsonify({"response": "I'm sorry, my AI brain is currently offline (API Key missing). Please tell the developer to check the server configuration."}), 200

    user_id = int(get_jwt_identity())
    data = request.get_json()
    user_message = data.get('message', '')
    context_data = data.get('context', {})

    # Fetch latest real data from DB if not fully provided, or to verify
    # For hackathon speed, we trust the frontend context but we could enhance it here
    # user = User.query.get(user_id)
    
    # Determine language
    lang_code = context_data.get('language', 'en')
    lang_map = {'en': 'English', 'hi': 'Hindi', 'gu': 'Gujarati'}
    target_lang = lang_map.get(lang_code, 'English')

    # Construct the prompt
    context_str = f"""
    USER CONTEXT:
    - Current Phase: {context_data.get('phase', 'Unknown')}
    - Wellness Score: {context_data.get('wellnessScore', 'N/A')}
    - Recent Symptoms: {context_data.get('symptoms', 'None reported')}
    - Last Period: {context_data.get('lastPeriod', 'Unknown')}
    - Predicted Next Period: {context_data.get('nextPeriod', 'Unknown')}
    
    IMPORTANT: You must reply in {target_lang} language.

    USER QUESTION: "{user_message}"
    """
    
    try:
        target_model = 'gemini-flash-latest'
        model = genai.GenerativeModel(target_model, system_instruction=SYSTEM_INSTRUCTION)
        response = model.generate_content(context_str)
        
        reply = response.text
        return jsonify({"response": reply}), 200

    except Exception as e:
        error_str = str(e)
        print(f"Gemini API Error: {error_str}")
        
        if "429" in error_str or "quota" in error_str.lower():
            msg = "AI Quota exceeded. Please try again in a minute."
        elif "404" in error_str:
            msg = f"AI Model not found on this API key. (Using: {target_model})"
        elif "api_key" in error_str.lower() or "401" in error_str:
            msg = "Invalid API Key configuration."
        else:
            msg = "I'm having trouble connecting to the AI cloud. Please check your internet or API key."
            
        return jsonify({"response": msg}), 200 # Return 200 so frontend displays the msg instead of generic catch-all
