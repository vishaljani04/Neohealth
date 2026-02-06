from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models import User, db

bp = Blueprint('auth', __name__)

@bp.route('/check-mobile', methods=['POST'])
def check_mobile():
    data = request.get_json()
    mobile = data.get('mobile')
    if not mobile:
        return jsonify({"msg": "Mobile number required"}), 400
        
    user = User.query.filter_by(mobile=mobile).first()
    if user:
        return jsonify({"exists": True, "username": user.username}), 200
    else:
        return jsonify({"exists": False}), 200

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({"msg": "Username already exists"}), 400
        
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"msg": "Email already exists"}), 400

    if data.get('mobile') and User.query.filter_by(mobile=data.get('mobile')).first():
        return jsonify({"msg": "Mobile number already exists"}), 400
        
    user = User(
        username=data.get('username'), 
        email=data.get('email'),
        mobile=data.get('mobile')
    )
    user.set_password(data.get('password'))
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"msg": "User created successfully"}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = None
    # Support login by Mobile
    if data.get('mobile'):
        user = User.query.filter_by(mobile=data.get('mobile')).first()
    # Support login by Username (legacy)
    elif data.get('username'):
        user = User.query.filter_by(username=data.get('username')).first()
        
    if user and user.check_password(data.get('password')):
        # Ensure identity is a string to avoid "subject must be string" errors
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user={"id": user.id, "username": user.username, "mobile": user.mobile}), 200
        
    return jsonify({"msg": "Invalid credentials"}), 401

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(id=user.id, username=user.username, email=user.email, mobile=user.mobile)
