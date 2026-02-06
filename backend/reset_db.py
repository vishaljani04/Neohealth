
from app import create_app, db
from app.models import User, HealthRecord, Prediction
import sqlalchemy

def reset_database():
    app = create_app()
    with app.app_context():
        print(f"Connected to: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Confirm with user (simulated here since user asked for it)
        print("⚠ WARNING: This will DELETE ALL DATA (Users, Health Records, Predictions).")
        print("Dropping all tables...")
        
        # Drop all tables
        db.drop_all()
        print("All tables dropped.")
        
        # Re-create all tables
        print("Creating tables with new schema...")
        db.create_all()
        print("Tables created successfully.")
        
        # Verify schema
        inspector = sqlalchemy.inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('users')]
        print(f"Columns in 'users' table: {columns}")
        
        if 'mobile' in columns:
            print("✅ check: 'mobile' column exists.")
        else:
            print("❌ ERROR: 'mobile' column is MISSING!")

if __name__ == "__main__":
    reset_database()
