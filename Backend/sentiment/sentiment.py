from flask import Blueprint, request, jsonify
import os
import uuid
from textblob import TextBlob
from pydub import AudioSegment
from openai import OpenAI
from dotenv import load_dotenv
from jose import jwt
# Load environment variables from .env
load_dotenv()

# Use the API key securely
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# Ensure pydub can find ffmpeg
AudioSegment.converter = r"C:\Users\DELL\ffmpeg\bin\ffmpeg.exe"

# Flask blueprint
sentiment = Blueprint('sentiment', __name__)



# Upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "audio_files")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@sentiment.route('/analyze_audio', methods=['POST'])
def analyze_audio():
    print("📥 Incoming request to /analyze_audio")
    audio = request.files.get("audio")
    language = request.form.get("language", "").lower()

    if not audio or language not in ["english", "urdu"]:
        return jsonify({"error": "Missing audio or unsupported language"}), 400

    ext = os.path.splitext(audio.filename)[1] or ".mp3"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    audio.save(filepath)

    if ext != ".mp3":
        sound = AudioSegment.from_file(filepath)
        filepath = filepath.replace(ext, ".mp3")
        sound.export(filepath, format="mp3")

    try:
        with open(filepath, "rb") as f:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="ur" if language == "urdu" else "en"
            )

        transcript = transcription.text
        translated_text = None

        if language == "urdu":
            print("🌐 Translating from Urdu to English...")
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Translate the following Urdu text to English."},
                    {"role": "user", "content": transcript}
                ]
            )
            translated_text = response.choices[0].message.content.strip()

        # Final text for analysis
        sentiment_input = translated_text if translated_text else transcript

        # 📊 Sentiment Analysis
        blob = TextBlob(sentiment_input)
        polarity = blob.sentiment.polarity
        sentiment_label = "POSITIVE" if polarity > 0 else "NEGATIVE" if polarity < 0 else "NEUTRAL"

        # 🤖 AI Suggestions
        ai_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant working for PTCL/Ufone to support customer service quality assurance. "
                        "Given the transcript of a customer call and the detected sentiment, generate a short (1–3 line) professional remark. "
                        "This note should be directed to a team supervisor and briefly describe the situation, tone, and recommended action. "
                        "Keep it respectful, actionable, and easy to scan quickly."
                    )
                },
                {
                    "role": "user",
                    "content": f"Transcript: {sentiment_input}. Sentiment: {sentiment_label}."
                }
            ]
        )
        ai_suggestions = ai_response.choices[0].message.content.strip()

        # 🧠 Category Detection
        categories = [
            {"id": 1, "name": "Internet Issues"},
            {"id": 2, "name": "Billing Inquiry"},
            {"id": 3, "name": "Package Upgrade"},
            {"id": 4, "name": "Technical Support"},
            {"id": 5, "name": "Other"},
            {"id": 6, "name": "Service Outage"},
            {"id": 7, "name": "New Connection"},
            {"id": 8, "name": "Account Verification"},
            {"id": 9, "name": "Payment Issue"},
            {"id": 10, "name": "Speed Complaint"},
            {"id": 11, "name": "Equipment Fault"},
            {"id": 12, "name": "Promotion Inquiry"},
            {"id": 13, "name": "Complaint Follow-up"},
            {"id": 14, "name": "Service Migration"},
            {"id": 15, "name": "VIP Customer Support"},
        ]

        category_prompt = (
            "You are a customer service assistant. Based on the following transcript, choose the most relevant category "
            "from this list:\n\n" +
            "\n".join([f"{c['id']}: {c['name']}" for c in categories]) +
            f"\n\nTranscript:\n{sentiment_input}\n\nRespond ONLY with the Category ID and name. Format: {{\"id\": <ID>, \"name\": \"<Category Name>\"}}"
        )

        cat_response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Classify the customer issue."},
                {"role": "user", "content": category_prompt}
            ]
        )

        # Extract result from AI response
        import json
        try:
            category_json = json.loads(cat_response.choices[0].message.content.strip())
        except Exception as e:
            print("⚠️ Failed to parse category, defaulting to Other.")
            category_json = {"id": 5, "name": "Other"}  # Default to Other

        return jsonify({
            "file_path": filepath,
            "transcript": transcript,
            "translated": translated_text,
            "sentiment": {
                "label": sentiment_label,
                "score": polarity,
            },
            "ai_suggestions": ai_suggestions,
            "category": category_json
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


@sentiment.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "API is live ✅"}), 200
