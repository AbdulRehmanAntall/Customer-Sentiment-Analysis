import React, { useState, useRef } from 'react';
import './AudioRecord.css';

const AudioRecord = () => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [language, setLanguage] = useState("english");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);
            };

            mediaRecorder.start();
            setRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or unavailable.");
        }
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioBlob(file);
            setAudioURL(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!audioBlob) {
            alert("Please record or upload an audio file.");
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("language", language);

        try {
            const response = await fetch("http://127.0.0.1:5000/sentiment/analyze_audio", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Server responded with an error.");
            } else {
                setResult(data);
            }

        } catch (err) {
            console.error("Error analyzing audio:", err);
            setError("An unexpected error occurred while analyzing audio.");
        }

        setLoading(false);
    };

    return (
        <div className="audio-container">
            <h2>🎙 Audio Sentiment Analyzer</h2>

            <div className="language-select">
                <label>Select Language:</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                    <option value="english">English</option>
                    <option value="urdu">Urdu</option>
                </select>
            </div>

            <div className="record-controls">
                {!recording ? (
                    <button onClick={handleStartRecording} disabled={loading}>🔴 Start Recording</button>
                ) : (
                    <button onClick={handleStopRecording}>⏹ Stop Recording</button>
                )}
            </div>

            <div className="upload-section">
                <label>Or Upload File:</label>
                <input type="file" accept="audio/*" onChange={handleUpload} disabled={loading} />
            </div>

            {audioURL && (
                <div className="audio-preview">
                    <p>🎧 Preview:</p>
                    <audio controls src={audioURL}></audio>
                </div>
            )}

            <button className="submit-btn" onClick={handleSubmit} disabled={loading || recording}>
                {loading ? "Analyzing..." : "Analyze Audio"}
            </button>

            {error && (
                <div className="error-message">
                    ❌ <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="result">
                    <h3>📄 Transcript:</h3>
                    <p>{result.transcript || "No transcript available."}</p>

                    {result.translated && result.translated !== result.transcript && (
                        <>
                            <h3>🌐 Translated to English:</h3>
                            <p>{result.translated}</p>
                        </>
                    )}

                    {result.sentiment && (
                        <>
                            <h3>📊 Sentiment:</h3>
                            <p>
                                <strong>{result.sentiment.label}</strong>
                                {" "} (Confidence: {(Math.abs(result.sentiment.score) * 100).toFixed(2)}%)

                            </p>
                        </>
                    )}

                    {result.file_path && (
                        <>
                            <h3>📁 File Saved At:</h3>
                            <code>{result.file_path}</code>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AudioRecord;
