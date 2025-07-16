from flask import Blueprint, request, jsonify
from sqlalchemy import create_engine, text
from config import DB_CONNECTION_STRING

insert = Blueprint('insert', __name__)
engine = create_engine(DB_CONNECTION_STRING)

@insert.route('/test', methods=['GET'])
def test_connection():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT * FROM TestTable"))
        data = [{"TestID": row[0], "TestValue": row[1]} for row in result]
    return jsonify(data)

@insert.route('/InsertCompleteCallRecord', methods=['POST'])
def insert_complete_call_record():
    data = request.get_json()

    try:
        # Extract data, type-safe
        customer_number = str(data.get('CustomerNumber'))
        agent_id = str(data.get('AgentID'))
        call_duration = int(data.get('CallDurationInSeconds')) if data.get('CallDurationInSeconds') is not None else None
        audio_path = str(data.get('AudioFilePath')) if data.get('AudioFilePath') else None
        category_id = int(data.get('CategoryID')) if data.get('CategoryID') is not None else None
        transcription_text = str(data.get('TranscribedText')) if data.get('TranscribedText') else None
        language = str(data.get('Language')) if data.get('Language') else None
        sentiment = str(data.get('Sentiment')) if data.get('Sentiment') else None
        confidence_score = float(data.get('ConfidenceScore')) if data.get('ConfidenceScore') is not None else None
        action_type = str(data.get('ActionType')) if data.get('ActionType') else None
        ai_recommendations = str(data.get('AIRecommendations')) if data.get('AIRecommendations') else None
        notes = str(data.get('Notes')) if data.get('Notes') else None

        # Debug print
        print("[Received data for stored procedure]")
        print(f"CustomerNumber: {customer_number}")
        print(f"AgentID: {agent_id}")
        print(f"CallDurationInSeconds: {call_duration}")
        print(f"AudioFilePath: {audio_path}")
        print(f"CategoryID: {category_id}")
        print(f"TranscribedText: {transcription_text}")
        print(f"Language: {language}")
        print(f"Sentiment: {sentiment}")
        print(f"ConfidenceScore: {confidence_score}")
        print(f"ActionType: {action_type}")
        print(f"AIRecommendations: {ai_recommendations}")
        print(f"Notes: {notes}")

        with engine.begin() as conn:   # 🔥 ensures transaction commits properly
            query = text("""
                EXEC InsertCompleteCallRecord
                    @CustomerNumber=:customer_number,
                    @AgentID=:agent_id,
                    @CallDurationInSeconds=:call_duration,
                    @AudioFilePath=:audio_path,
                    @CategoryID=:category_id,
                    @TranscribedText=:transcription_text,
                    @Language=:language,
                    @Sentiment=:sentiment,
                    @ConfidenceScore=:confidence_score,
                    @ActionType=:action_type,
                    @AIRecommendations=:ai_recommendations,
                    @Notes=:notes
            """)

            result = conn.execute(query, {
                'customer_number': customer_number,
                'agent_id': agent_id,
                'call_duration': call_duration,
                'audio_path': audio_path,
                'category_id': category_id,
                'transcription_text': transcription_text,
                'language': language,
                'sentiment': sentiment,
                'confidence_score': confidence_score,
                'action_type': action_type,
                'ai_recommendations': ai_recommendations,
                'notes': notes
            })

            proc_result = result.fetchone()
            if proc_result:
                new_call_id = proc_result[0]
                message = proc_result[1]
                print("\n---------------success--------\n")
            else:
                new_call_id = None
                message = "No response from stored procedure"

        return jsonify({
            "message": message,
            "CallID": new_call_id
        }), 201

    except Exception as e:
        print(f"[Error] {e}")
        return jsonify({"error": str(e)}), 500
