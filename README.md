# 📞 Customer Sentiment Analysis via Voice Notes

Welcome to **cusHello** — a customer sentiment analysis system that transforms voice note feedback into actionable insights for businesses.

---

## 🎯 Overview

This system allows customers to record their experience with a company using a **voice note via WhatsApp**. Once the note is submitted:

1. The backend captures the audio.
2. **Automatic Speech Recognition (ASR)** transcribes the voice note.
3. A **Large Language Model (LLM)** analyzes the transcription, extracts keywords, determines sentiment, and recommends actions.
4. A structured response is generated for the business to review and act upon.

---

## 🌟 Features

- 🎤 Voice-based customer feedback collection
- 🧠 ASR + LLM-powered natural language understanding
- 🔍 Sentiment classification (Positive, Negative, Neutral)
- 🏷️ Keyword extraction and tagging
- 📊 Recommendation engine for business insights
- 🔄 Real-time API response
- 📱 WhatsApp Integration-ready

---

## 🛠️ Tech Stack

- **Frontend**: React (optional dashboard)
- **Backend**: Flask + Python
- **Speech Recognition**: [OpenAI Whisper](https://openai.com/research/whisper)
- **LLM**: GPT (via OpenAI API)
- **Database**: SQL Server / SQLite
- **Tools**: TextBlob, Pydub, SQLAlchemy

---

## 🚀 Demo Flow

1. Customer gets a WhatsApp link after a service interaction.
2. They record and send a voice note.
3. System transcribes and analyzes the voice note.
4. Keywords, sentiment, and recommendations are stored and displayed.

---

## 🧰 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/customer-sentiment-voice.git
cd customer-sentiment-voice
```

### 2. Create a .env file in Backend Folder
- the file should exist OPENAI_API_KEY=your_openai_api_key_here

### 3. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate      # Linux/Mac
# OR
venv\Scripts\activate         # Windows
```

### 4. Install Dependencies

-In Backend Folder
```bash
pip install -r requirements.txt
```
-In Frontend Folder
```bash
npm install
```




### 5. Run the  Backend Server

```bash
python app.py
```

### 6. Run the Frontend File

```bash
npm run dev
```



