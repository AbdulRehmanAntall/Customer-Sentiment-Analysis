from flask import Blueprint, request, jsonify
import os
import uuid
from textblob import TextBlob
from pydub import AudioSegment
from openai import OpenAI
from dotenv import load_dotenv

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

    # Convert to MP3 if needed
    if ext != ".mp3":
        sound = AudioSegment.from_file(filepath)
        filepath = filepath.replace(ext, ".mp3")
        sound.export(filepath, format="mp3")

    try:
        # Transcribe
        with open(filepath, "rb") as f:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                language="ur" if language == "urdu" else "en"
            )

        transcript = transcription.text
        translated_text = None

        # Translate if Urdu
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

        # Sentiment analysis
        sentiment_input = translated_text if translated_text else transcript
        blob = TextBlob(sentiment_input)
        polarity = blob.sentiment.polarity
        sentiment_label = "POSITIVE" if polarity > 0 else "NEGATIVE" if polarity < 0 else "NEUTRAL"

        return jsonify({
            "file_path": filepath,
            "transcript": transcript,
            "translated": translated_text,
            "sentiment": {
                "label": sentiment_label,
                "score": polarity
            }
        })

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500

@sentiment.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "API is live ✅"}), 200
