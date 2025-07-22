import React, { useEffect, useRef, useState } from 'react';
import './AudioRecord.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CallRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agents, setAgents] = useState([]);
    const [formData, setFormData] = useState({
        CustomerNumber: "",
        AgentID: ""
    });

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const audioRef = useRef(null);

    useEffect(() => {
        // Load agents list
        axios.get("http://127.0.0.1:5000/api/getallagents")
            .then(res => setAgents(res.data))
            .catch(console.error);
    }, []);

    const calculateDuration = (blob) => {
        return new Promise((resolve) => {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audio.addEventListener("loadedmetadata", () => {
                const duration = Math.round(audio.duration);
                URL.revokeObjectURL(url); // Clean up
                resolve(duration);
            });

            audio.addEventListener("error", () => {
                console.error("Error loading audio for duration calculation");
                resolve(0);
            });
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);

                // Calculate duration
                const duration = await calculateDuration(blob);
                setAudioDuration(duration);

                // Stop all tracks in the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(1000); // Request data every second for better duration accuracy
            setRecording(true);
        } catch (err) {
            console.error("Mic error:", err);
            setError("Microphone access denied.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setRecording(false);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setAudioBlob(file);
            const url = URL.createObjectURL(file);
            setAudioURL(url);

            // Calculate duration
            const duration = await calculateDuration(file);
            setAudioDuration(duration);
        }
    };

    const handleSubmit = async () => {
        if (!formData.CustomerNumber || !formData.AgentID || !audioBlob) {
            alert("Please fill in Customer Number, Agent and record/upload audio.");
            return;
        }

        if (!audioDuration || audioDuration === 0) {
            alert("Please wait until audio duration is calculated.");
            return;
        }

        setLoading(true);
        setError(null);

        const formToSend = new FormData();
        formToSend.append("audio", audioBlob);
        formToSend.append("language", "english"); // default for now

        try {
            const response = await fetch("http://127.0.0.1:5000/sentiment/analyze_audio", {
                method: "POST",
                body: formToSend,
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Server error.");
                return;
            }

            // Prepare final data for database
            const finalPayload = {
                CustomerNumber: formData.CustomerNumber,
                AgentID: formData.AgentID,
                AudioFilePath: data.file_path || "",
                TranscribedText: data.transcript || "",
                Language: "English",
                Sentiment: data.sentiment?.label || "Neutral",
                ConfidenceScore: Math.abs(data.sentiment?.score || 0).toFixed(2),
                ActionType: "Pending",
                AIRecommendations: data.ai_suggestions || "",
                Notes: "",
                CallDurationInSeconds: 0,
                CategoryID: data.category?.id || ""
            };

            await axios.post("http://127.0.0.1:5000/insert/InsertCompleteCallRecord", finalPayload);
            alert("✅ Call record submitted!");

            // Clear form
            setFormData({ CustomerNumber: "", AgentID: "" });
            setAudioBlob(null);
            setAudioURL(null);
            setAudioDuration(0);
        } catch (err) {
            console.error("Error:", err);
            setError("Submission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="audio-container">
            <h2>📞 Call Recorder & Submission</h2>

            <input
                name="CustomerNumber"
                value={formData.CustomerNumber}
                onChange={handleChange}
                placeholder="📱 Customer Number"
                required
            />

            <select name="AgentID" value={formData.AgentID} onChange={handleChange} required>
                <option value="">👤 Select Agent</option>
                {agents.map(agent => (
                    <option key={agent.AgentId} value={agent.AgentId}>
                        {agent.AgentName}
                    </option>
                ))}
            </select>

            <div className="record-controls">
                {!recording ? (
                    <button onClick={handleStartRecording} disabled={loading}>🔴 Start Recording</button>
                ) : (
                    <button onClick={handleStopRecording}>⏹ Stop</button>
                )}
            </div>

            <div className="upload-section">
                <label>📂 Or Upload:</label>
                <input type="file" accept="audio/*" onChange={handleUpload} disabled={loading} />
            </div>

            {audioURL && (
                <div className="audio-preview">
                    <audio
                        ref={audioRef}
                        controls
                        src={audioURL}
                        onLoadedMetadata={() => {
                            if (audioRef.current) {
                                setAudioDuration(Math.round(audioRef.current.duration));
                            }
                        }}
                    ></audio>
                    <p>⏱ Duration: {audioDuration} sec</p>
                </div>
            )}

            <button
                onClick={handleSubmit}
                disabled={loading || recording || !audioBlob || audioDuration === 0}
            >
                {loading ? "🔄 Submitting..." : "📤 Submit Call"}
            </button>

            {error && <div className="error-message">❌ {error}</div>}
        </div>
    );
};

export default CallRecorder;