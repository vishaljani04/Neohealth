
import sqlite3
import os
import sys
from datetime import datetime
from app import create_app, db
from app.models import User, HealthRecord, Prediction

# Configuration
SQLITE_DB_PATH = 'instance/neohealth.db'

def fetch_sqlite_data():
    """Reads all data from the existing SQLite database."""
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Error: SQLite database not found at {SQLITE_DB_PATH}")
        return None

    print(f"Reading data from {SQLITE_DB_PATH}...")
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    data = {}

    # 1. Fetch Users
    cursor.execute("SELECT * FROM users")
    data['users'] = [dict(row) for row in cursor.fetchall()]
    print(f"  - Found {len(data['users'])} users")

    # 2. Fetch Health Records
    cursor.execute("SELECT * FROM health_records")
    data['health_records'] = [dict(row) for row in cursor.fetchall()]
    print(f"  - Found {len(data['health_records'])} health records")

    # 3. Fetch Predictions
    cursor.execute("SELECT * FROM predictions")
    data['predictions'] = [dict(row) for row in cursor.fetchall()]
    print(f"  - Found {len(data['predictions'])} predictions")

    conn.close()
    return data

def migrate_to_postgres(data):
    """Inserts data into the configured PostgreSQL database."""
    app = create_app()
    
    # Ensure we are connecting to Postgres
    db_url = app.config['SQLALCHEMY_DATABASE_URI']
    if 'sqlite' in db_url:
        print("Error: The application is still configured to use SQLite.")
        print("Please update .env to use PostgreSQL before running this script.")
        print("Example: DATABASE_URL=postgresql://postgres:password@localhost:5432/neohealth")
        return

    print(f"\nConnecting to PostgreSQL at {db_url}...")

    with app.app_context():
        try:
            # Create Tables
            print("Creating tables in PostgreSQL...")
            db.create_all()
            
            # 1. Migrate Users
            print("Migrating Users...")
            user_map = {} # Old ID -> New ID (if we wanted to re-map, but we'll try to keep IDs)
            
            for row in data['users']:
                # Check if user exists
                if User.query.filter_by(email=row['email']).first():
                    print(f"  - User {row['email']} already exists. Skipping.")
                    continue
                
                user = User(
                    id=row['id'], # Keep original ID to maintain relationships
                    username=row['username'],
                    email=row['email'],
                    password_hash=row['password_hash'],
                    created_at=datetime.strptime(row['created_at'], '%Y-%m-%d %H:%M:%S.%f') if isinstance(row['created_at'], str) else row['created_at']
                )
                db.session.add(user)
            db.session.commit()
            
            # 2. Migrate Health Records
            print("Migrating Health Records...")
            for row in data['health_records']:
                # Parsers for date/datetime
                rec_date = datetime.strptime(row['date'], '%Y-%m-%d').date() if isinstance(row['date'], str) else row['date']
                
                # Check duplicate
                if HealthRecord.query.filter_by(user_id=row['user_id'], date=rec_date).first():
                    continue

                record = HealthRecord(
                    id=row['id'],
                    user_id=row['user_id'],
                    date=rec_date,
                    lh=row['lh'],
                    estrogen=row['estrogen'],
                    pdg=row['pdg'],
                    cramps=row['cramps'],
                    fatigue=row['fatigue'],
                    moodswing=row['moodswing'],
                    stress=row['stress'],
                    bloating=row['bloating'],
                    sleepissue=row['sleepissue'],
                    overall_score=row['overall_score'],
                    deep_sleep_in_minutes=row['deep_sleep_in_minutes'],
                    avg_resting_heart_rate=row['avg_resting_heart_rate'],
                    stress_score=row['stress_score'],
                    daily_steps=row['daily_steps'],
                    last_period_date=datetime.strptime(row['last_period_date'], '%Y-%m-%d').date() if row['last_period_date'] else None,
                    created_at=datetime.strptime(row['created_at'], '%Y-%m-%d %H:%M:%S.%f') if isinstance(row['created_at'], str) else row['created_at']
                )
                db.session.add(record)
            db.session.commit()

            # 3. Migrate Predictions
            print("Migrating Predictions...")
            for row in data['predictions']:
                pred_date = datetime.strptime(row['date'], '%Y-%m-%d').date() if isinstance(row['date'], str) else row['date']
                
                if Prediction.query.filter_by(user_id=row['user_id'], date=pred_date).first():
                    continue

                pred = Prediction(
                    id=row['id'],
                    user_id=row['user_id'],
                    record_id=row['record_id'],
                    date=pred_date,
                    predicted_phase=row['predicted_phase'],
                    confidence=row['confidence'],
                    created_at=datetime.strptime(row['created_at'], '%Y-%m-%d %H:%M:%S.%f') if isinstance(row['created_at'], str) else row['created_at']
                )
                db.session.add(pred)
            db.session.commit()

            # Update Sequence IDs (Postgres specific) to ensure auto-increment works
            print("Resetting primary key sequences...")
            db.session.execute(db.text("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id),0) + 1, false) FROM users;"))
            db.session.execute(db.text("SELECT setval(pg_get_serial_sequence('health_records', 'id'), coalesce(max(id),0) + 1, false) FROM health_records;"))
            db.session.execute(db.text("SELECT setval(pg_get_serial_sequence('predictions', 'id'), coalesce(max(id),0) + 1, false) FROM predictions;"))
            db.session.commit()

            print("\nMigration Completed Successfully! ✅")
            
        except Exception as e:
            print(f"\nData Migration Failed: {str(e)}")
            db.session.rollback()

if __name__ == "__main__":
    print("--- NeoHealth SQLite to PostgreSQL Migration Tool ---")
    
    # 1. Fetch data from SQLite
    sqlite_data = fetch_sqlite_data()
    
    if sqlite_data:
        # 2. Insert into Postgres
        migrate_to_postgres(sqlite_data)
