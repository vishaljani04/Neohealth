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
    CORS(app)

    with app.app_context():
        from .routes import auth, health, predictions, admin, datasets
        app.register_blueprint(auth.bp, url_prefix='/api/auth')
        app.register_blueprint(health.bp, url_prefix='/api/health')
        app.register_blueprint(predictions.bp, url_prefix='/api/predictions')
        app.register_blueprint(admin.bp, url_prefix='/api/admin')
        app.register_blueprint(datasets.bp, url_prefix='/api/datasets')
        
        from .routes import chat
        app.register_blueprint(chat.bp, url_prefix='/api/chat')
        
        db.create_all()

    return app
