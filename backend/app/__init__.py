from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
ma = Marshmallow()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Global Error Handler
    from flask import jsonify
    @app.errorhandler(Exception)
    def handle_exception(e):
        print(f"DEBUG: Internal Error: {str(e)}")
        response = jsonify({"msg": "Internal Server Error", "error": str(e)})
        response.status_code = 500
        return response

    @app.route('/')
    def home():
        return "NeoHealth Backend is Live! 🚀"

    with app.app_context():
        from .routes import auth, health, predictions, admin, datasets
        app.register_blueprint(auth.bp, url_prefix='/api/auth')
        app.register_blueprint(health.bp, url_prefix='/api/health')
        app.register_blueprint(predictions.bp, url_prefix='/api/predictions')
        app.register_blueprint(admin.bp, url_prefix='/api/admin')
        app.register_blueprint(datasets.bp, url_prefix='/api/datasets')
        
        from .routes import chat
        app.register_blueprint(chat.bp, url_prefix='/api/chat')
        
        # --- AUTO DB FIX: Add missing columns if they don't exist ---
        try:
            from sqlalchemy import text
            with db.engine.connect() as conn:
                print(" * Checking for missing columns...")
                conn.execute(text("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS daily_note TEXT"))
                conn.execute(text("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS sentiment_score FLOAT"))
                conn.commit()
                print(" * Database columns verified/added.")
        except Exception as db_err:
            print(f" * Database Auto-Fix Note: {db_err} (This is usually fine if columns already exist)")

        db.create_all()

    return app
