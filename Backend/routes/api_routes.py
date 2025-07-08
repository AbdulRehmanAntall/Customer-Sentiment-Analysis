from flask import Blueprint, jsonify
from sqlalchemy import create_engine, text
from config import DB_CONNECTION_STRING

api = Blueprint('api', __name__)

# DB connection
engine = create_engine(DB_CONNECTION_STRING)
@api.route('/')
def index():
    return "✅ Flask backend is running on port 5000"

@api.route('/test', methods=['GET'])
def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM TestTable"))
        data = [{"TestID": row[0], "TestValue": row[1]} for row in result]
    return jsonify(data)
