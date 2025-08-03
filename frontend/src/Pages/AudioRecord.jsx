import React, { useEffect, useRef, useState } from 'react';
import './AudioRecord.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AudioRecord = () => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [audioDuration, setAudioDuration] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
            setError(null);
            setSuccess(null);
        } catch (err) {
            console.error("Mic error:", err);
            setError("Microphone access denied. Please allow microphone permissions.");
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
            setError("Please fill in Customer Number, Agent and record/upload audio.");
            return;
        }

        if (!audioDuration || audioDuration === 0) {
            setError("Please wait until audio duration is calculated.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

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
            setSuccess("✅ Call record submitted successfully!");

            // Clear form
            setFormData({ CustomerNumber: "", AgentID: "" });
            setAudioBlob(null);
            setAudioURL(null);
            setAudioDuration(0);
        } catch (err) {
            console.error("Error:", err);
            setError("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="audio-container">
            <div className="call-recorder-wrapper">
                <div className="left-section">
                    <h2>Customer Voice Review</h2>
                    <p className="subtitle">
                        We found that customers express themselves better when they give feedback via voice notes.
                    </p>

                    <div className="form-group">
                        <label>Customer Phone Number</label>
                        <input
                            name="CustomerNumber"
                            value={formData.CustomerNumber}
                            onChange={handleChange}
                            placeholder="Enter customer phone number"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Agent</label>
                        <select
                            name="AgentID"
                            value={formData.AgentID}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Agent</option>
                            {agents.map(agent => (
                                <option key={agent.AgentId} value={agent.AgentId}>
                                    {agent.AgentName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="right-section">
                    <div className="recording-control">
                        <button
                            className={`record-button ${recording ? 'recording' : ''}`}
                            onClick={recording ? handleStopRecording : handleStartRecording}
                            disabled={loading}
                        >
                            {recording ? (
                                <span className="pulse-animation">⏹ Stop</span>
                            ) : (
                                <span>🔴 Record</span>
                            )}
                        </button>
                        <p className="recording-status">
                            {recording ? "Recording in progress..." : "Click to start recording"}
                        </p>
                    </div>

                    {audioURL && (
                        <div className="audio-player">
                            <h4>Your Recording</h4>
                            <audio
                                ref={audioRef}
                                controls
                                src={audioURL}
                                onLoadedMetadata={() => {
                                    if (audioRef.current) {
                                        setAudioDuration(Math.round(audioRef.current.duration));
                                    }
                                }}
                            />
                            <div className="audio-duration">Duration: {audioDuration} seconds</div>
                        </div>
                    )}

                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={loading || recording || !audioBlob || audioDuration === 0}
                    >
                        {loading ? "Processing..." : "Submit Review"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="message-popup error">
                    <div className="message-content">
                        <span className="message-icon">❌</span>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="message-popup success">
                    <div className="message-content">
                        <span className="message-icon">✓</span>
                        <span>{success}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioRecord;