
from app import create_app, db
import sqlalchemy

def add_mobile_column():
    app = create_app()
    with app.app_context():
        engine = db.engine
        with engine.connect() as conn:
            try:
                print("Attempting to add 'mobile' column to 'users' table...")
                conn.execute(sqlalchemy.text("ALTER TABLE users ADD COLUMN mobile VARCHAR(20) UNIQUE;"))
                print("Column 'mobile' added successfully.")
            except Exception as e:
                print(f"Error (maybe column exists?): {e}")

if __name__ == "__main__":
    add_mobile_column()
