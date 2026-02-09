from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import pandas as pd
from ..models import HealthRecord, db
from datetime import datetime

bp = Blueprint('health', __name__)

@bp.route('/record', methods=['POST'])
@jwt_required()
def add_record():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    date_str = data.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
    try:
        record_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    # Clean data for HealthRecord model
    cleaned_data = {}
    numeric_fields = ['lh', 'estrogen', 'pdg', 'overall_score', 'deep_sleep_in_minutes', 
                      'avg_resting_heart_rate', 'stress_score', 'daily_steps']
    integer_fields = ['cramps', 'fatigue', 'moodswing', 'stress', 'bloating', 'sleepissue']
    
    for field in numeric_fields:
        if field in data and data[field] is not None and data[field] != '':
            try:
                cleaned_data[field] = float(data[field])
            except:
                pass
                
    for field in integer_fields:
        if field in data and data[field] is not None and data[field] != '':
            try:
                cleaned_data[field] = int(data[field])
            except:
                pass

    if 'last_period_date' in data and data['last_period_date']:
        try:
            cleaned_data['last_period_date'] = datetime.strptime(data['last_period_date'], '%Y-%m-%d').date()
        except:
            pass

    # Handle Daily Note & Sentiment Analysis
    if 'daily_note' in data and data['daily_note']:
        note = data['daily_note'].strip()
        cleaned_data['daily_note'] = note
        
        # Simple Sentiment Analysis using TextBlob
        try:
            from textblob import TextBlob
            blob = TextBlob(note)
            # Polarity is float [-1.0, 1.0] where -1 is negative and 1 is positive
            cleaned_data['sentiment_score'] = blob.sentiment.polarity
        except Exception as e:
            print(f"Sentiment Analysis Error: {e}")
            cleaned_data['sentiment_score'] = 0.0 # Default neutral
            
    # Check if record for this date already exists
    record = HealthRecord.query.filter_by(user_id=user_id, date=record_date).first()
    if record:
        # Update existing
        for key, value in cleaned_data.items():
            setattr(record, key, value)
    else:
        # Create new
        record = HealthRecord(user_id=user_id, date=record_date, **cleaned_data)
        db.session.add(record)
        
    try:
        db.session.commit()
        return jsonify({"msg": "Record saved", "id": record.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"DEBUG: Health Record Error: {str(e)}")
        return jsonify({"msg": "Database error", "error": str(e)}), 500

@bp.route('/record/<int:id>', methods=['PUT'])
@jwt_required()
def update_record_by_id(id):
    user_id = int(get_jwt_identity())
    record = HealthRecord.query.filter_by(id=id, user_id=user_id).first()
    
    if not record:
        return jsonify({"msg": "Record not found"}), 404
        
    data = request.get_json()
    
    # Allow date update if needed, but check conflict
    if 'date' in data:
        try:
            new_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            if new_date != record.date:
                conflict = HealthRecord.query.filter_by(user_id=user_id, date=new_date).first()
                if conflict:
                    return jsonify({"msg": "A record for this date already exists"}), 400
                record.date = new_date
        except ValueError:
             return jsonify({"msg": "Invalid date format"}), 400

    numeric_fields = ['lh', 'estrogen', 'pdg', 'overall_score', 'deep_sleep_in_minutes', 
                      'avg_resting_heart_rate', 'stress_score', 'daily_steps']
    integer_fields = ['cramps', 'fatigue', 'moodswing', 'stress', 'bloating', 'sleepissue']
    
    for field in numeric_fields:
        if field in data:  # Only update present fields
            try:
                setattr(record, field, float(data[field]) if data[field] is not None and data[field] != '' else None)
            except:
                pass
                
    for field in integer_fields:
        if field in data:
            try:
                setattr(record, field, int(data[field]) if data[field] is not None and data[field] != '' else None)
            except:
                pass

    try:
        db.session.commit()
        return jsonify({"msg": "Record updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Database error", "error": str(e)}), 500

@bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    user_id = int(get_jwt_identity())
    records = HealthRecord.query.filter_by(user_id=user_id).order_by(HealthRecord.date.asc()).all()
    
    if not records:
        # If no personal data, return sample data from processed dataset
        try:
            processed_path = os.path.join(current_app.root_path, '../../data/processed/final_dataset.csv')
            if os.path.exists(processed_path):
                df = pd.read_csv(processed_path).fillna(0).head(15) # Take 15 rows for sample and fill NaNs
                sample_data = []
                for i, row in df.iterrows():
                    sample_data.append({
                        "id": f"sample-{i}",
                        "date": row.get('date', f"2023-01-{i+1:02d}"),
                        "lh": float(row.get('lh', 0)),
                        "estrogen": float(row.get('estrogen', 0)),
                        "pdg": float(row.get('pdg', 0)),
                        "cramps": int(row.get('cramps', 0)),
                        "fatigue": int(row.get('fatigue', 0)),
                        "moodswing": int(row.get('moodswing', 0)),
                        "stress": int(row.get('stress', 0)),
                        "bloating": int(row.get('bloating', 0)),
                        "sleepissue": int(row.get('sleepissue', 0)),
                        "overall_score": float(row.get('overall_score', 0)),
                        "deep_sleep_in_minutes": float(row.get('deep_sleep_in_minutes', 0)),
                        "avg_resting_heart_rate": float(row.get('avg_resting_heart_rate', 0)),
                        "stress_score": float(row.get('stress_score', 0)),
                        "daily_steps": float(row.get('daily_steps', 0)),
                        "is_example": True
                    })
                return jsonify(sample_data)
        except Exception as e:
            print(f"Error loading sample data: {e}")

    today = datetime.utcnow().date()
    
    response_data = []
    
    # helper to process real record
    def to_dict(r):
        return {
            "id": r.id,
            "date": r.date.strftime('%Y-%m-%d'),
            "lh": r.lh,
            "estrogen": r.estrogen,
            "pdg": r.pdg,
            "cramps": r.cramps,
            "fatigue": r.fatigue,
            "moodswing": r.moodswing,
            "stress": r.stress,
            "bloating": r.bloating,
            "sleepissue": r.sleepissue,
            "overall_score": r.overall_score,
            "deep_sleep_in_minutes": r.deep_sleep_in_minutes,
            "avg_resting_heart_rate": r.avg_resting_heart_rate,
            "stress_score": r.stress_score,
            "daily_steps": r.daily_steps,
            "last_period_date": r.last_period_date.strftime('%Y-%m-%d') if r.last_period_date else None,
            "is_estimated": False,
            "is_example": False
        }

    for r in records:
        response_data.append(to_dict(r))
        
    # --- Continuous Intelligence: Extrapolate missing days up to today ---
    if records:
        last_record = records[-1]
        last_date = last_record.date
        
        if last_date < today:
            from datetime import timedelta
            
            # Simple Smoothing / Carry-forward logic
            # In a real ML system, this would use ARIMA or LSTM.
            # Here we use a smart "Drift" logic to simulate natural variance.
            import random
            
            curr_date = last_date + timedelta(days=1)
            
            # Base values from last known state
            current_steps = last_record.daily_steps or 5000
            current_stress = last_record.stress_score or 50
            current_sleep = last_record.deep_sleep_in_minutes or 60
            current_hr = last_record.avg_resting_heart_rate or 70
            
            while curr_date <= today:
                # Add slight "life" variation so it's not a flat line
                # Steps vary +/- 10%
                step_var = random.uniform(0.9, 1.1)
                estimated_steps = int(current_steps * step_var)
                
                # Stress tends to revert to mean (say 30-40)
                # If high (>70), it decays down. If low (<20), it stays low.
                if current_stress > 50:
                    current_stress *= 0.95 # recover
                else:
                    current_stress *= random.uniform(0.95, 1.05)
                
                # Sleep varies slightly
                estimated_sleep = current_sleep * random.uniform(0.9, 1.1)
                
                response_data.append({
                    "id": f"est-{curr_date}",
                    "date": curr_date.strftime('%Y-%m-%d'),
                    "lh": None, # Hormones are hard to guess without phase logic, leave null so chart connects or breaks appropriately
                    "estrogen": None,
                    "pdg": None,
                    "cramps": last_record.cramps, # Symptoms likely persist or fade? Let's carry forward
                    "fatigue": last_record.fatigue,
                    "moodswing": last_record.moodswing,
                    "stress": int(current_stress / 25), # approx likert from score
                    "bloating": last_record.bloating,
                    "sleepissue": last_record.sleepissue,
                    "overall_score": last_record.overall_score, # Keep simple
                    "deep_sleep_in_minutes": round(estimated_sleep, 1),
                    "avg_resting_heart_rate": current_hr,
                    "stress_score": round(current_stress, 1),
                    "daily_steps": estimated_steps,
                    "last_period_date": last_record.last_period_date.strftime('%Y-%m-%d') if last_record.last_period_date else None,
                    "is_estimated": True, # CRITICAL FLAG
                    "is_example": False
                })
                
                # Update baseline for next loop for continuity
                current_steps = estimated_steps
                
                curr_date += timedelta(days=1)


    return jsonify(response_data)
