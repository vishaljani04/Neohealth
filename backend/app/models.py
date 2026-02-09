from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    mobile = db.Column(db.String(20), unique=True, nullable=True)
    
    health_records = db.relationship('HealthRecord', backref='user', lazy='dynamic')
    predictions = db.relationship('Prediction', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class HealthRecord(db.Model):
    __tablename__ = 'health_records'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Hormone Metrics
    lh = db.Column(db.Float)
    estrogen = db.Column(db.Float)
    pdg = db.Column(db.Float)
    
    # Symptoms (0-4 Likert)
    cramps = db.Column(db.Integer)
    fatigue = db.Column(db.Integer)
    moodswing = db.Column(db.Integer)
    stress = db.Column(db.Integer)
    bloating = db.Column(db.Integer)
    sleepissue = db.Column(db.Integer)
    
    # Physiological Metrics
    overall_score = db.Column(db.Float)
    deep_sleep_in_minutes = db.Column(db.Float)
    avg_resting_heart_rate = db.Column(db.Float)
    stress_score = db.Column(db.Float)
    daily_steps = db.Column(db.Float)
    last_period_date = db.Column(db.Date) # Added this field
    daily_note = db.Column(db.Text) # New field for user notes
    sentiment_score = db.Column(db.Float) # New field for sentiment analysis result
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_health_user_date', 'user_id', 'date'),
    )

class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_id = db.Column(db.Integer, db.ForeignKey('health_records.id'), nullable=True)
    date = db.Column(db.Date, nullable=False)
    predicted_phase = db.Column(db.String(64), nullable=False)
    confidence = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_pred_user_date', 'user_id', 'date'),
    )
