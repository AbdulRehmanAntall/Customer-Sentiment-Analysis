from flask import Blueprint, jsonify, request
from sqlalchemy import create_engine, text
from config import DB_CONNECTION_STRING
from datetime import datetime, timedelta

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

@api.route('/getallagents', methods=['GET'])
def getallagents():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM Agents"))
        data = [{"AgentId": row[0], "AgentName": row[1], "PhoneNumber": row[2], "DateEmployed:": row[3]} for row in result]
    return jsonify(data)

@api.route('/getallcategories', methods=['GET'])
def getallcategories():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM ComplaintCategories"))
        data = [{"CategoryId": row[0], "CategoryName": row[1]} for row in result]
    return jsonify(data)

@api.route('/gettotalcallsperagent', methods=['GET'])
def get_total_calls_per_agent():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetTotalCallsPerAgent @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"AgentName": row[0], "TotalCalls": row[1]} for row in result]

    return jsonify(data)

@api.route('/GetSentimentDistribution', methods=['GET'])
def GetSentimentDistribution():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetSentimentDistribution @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"Sentiment": row[0], "Sentiment Count": row[1]} for row in result]

    return jsonify(data)

@api.route('/GetTopComplaintCategories', methods=['GET'])
def GetTopComplaintCategories():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetTopComplaintCategories @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"CategoryName": row[0], 'CategoryCount': row[1]} for row in result]

    return jsonify(data)

@api.route('/GetAgentSentimentStats', methods=['GET'])
def GetAgentSentimentStats():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetAgentSentimentStats @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"AgentName": row[0], "PositiveCalls": row[1], "NegativeCalls": row[2], "NeutralCalls": row[3]} for row in result]

    return jsonify(data)

@api.route('/GetAverageCallDurationPerCategory', methods=['GET'])
def GetAverageCallDurationPerCategory():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetAverageCallDurationPerCategory @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"CategoryName": row[0], "AverageDuration": row[1]} for row in result]

    return jsonify(data)

@api.route('/GetRecentSupervisorActions', methods=['GET'])
def GetRecentSupervisorActions():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetRecentSupervisorActions @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"ActionID": row[0], "CallID": row[1], "AgentName": row[2], "ActionType": row[3],
                 "AIRecommendations": row[4], "Notes": row[5], "ActionDate": row[6]} for row in result]

    return jsonify(data)

@api.route('/GetAgentAverageCallDuration', methods=['GET'])
def GetAgentAverageCallDuration():
    start_date = request.args.get('start_date')
    end_date = datetime.strptime(request.args.get('end_date'), '%Y-%m-%d') + timedelta(days=1)

    query = text("""EXEC GetAgentAverageCallDuration @StartDate=:start_date, @EndDate=:end_date""")

    with engine.connect() as conn:
        result = conn.execute(query, {'start_date': start_date, 'end_date': end_date})
        data = [{"AgentName": row[0], "AverageDuration": row[1]} for row in result]

    return jsonify(data)

@api.route('/GetSentimentRatioByCategory', methods=['GET'])
def GetSentimentRatioByCategory():
    query = text("""EXEC GetSentimentRatioByCategory""")

    with engine.connect() as conn:
        result = conn.execute(query)
        data = [{"CategoryName": row[0], "Sentiment": row[1], "TotalCount": row[2]} for row in result]

    return jsonify(data)

@api.route('/GetAverageConfidenceBySentiment', methods=['GET'])
def GetAverageConfidenceBySentiment():
    query = text("""EXEC GetAverageConfidenceBySentiment""")

    with engine.connect() as conn:
        result = conn.execute(query)
        data = [{"Sentiment": row[0], "AverageConfidence": row[1]} for row in result]

    return jsonify(data)
