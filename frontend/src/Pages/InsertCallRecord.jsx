import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/InsertCallRecord.css";

const InsertCallRecord = () => {
    const [agents, setAgents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        CustomerNumber: "",
        AgentID: "",
        CallDurationInSeconds: "",
        AudioFilePath: "",
        CategoryID: "",
        TranscribedText: "",
        Language: "English",
        Sentiment: "Positive",
        ConfidenceScore: "",
        ActionType: "Pending",
        AIRecommendations: "",
        Notes: ""
    });

    useEffect(() => {
        axios.get("http://127.0.0.1:5000/api/getallagents")
            .then(res => setAgents(res.data))
            .catch(err => console.error(err));

        axios.get("http://127.0.0.1:5000/api/getallcategories")
            .then(res => setCategories(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post("http://127.0.0.1:5000/insert/InsertCompleteCallRecord", formData)
            .then(res => {
                alert("✅ Call record added successfully!");
                console.log(res.data);
            })
            .catch(err => {
                alert("❌ Error while inserting data");
                console.error(err);
            });
    };


    return (
        <div className="insert-call-form">
            <h2 className="insert-call-title">Insert Call Record</h2>
            <form onSubmit={handleSubmit} className="insert-call-form-fields">
                <input name="CustomerNumber" value={formData.CustomerNumber} onChange={handleChange} placeholder="Customer Number" className="insert-call-input" required />

                <select name="AgentID" value={formData.AgentID} onChange={handleChange} className="insert-call-input" required>
                    <option value="">Select Agent</option>
                    {agents.map(agent => (
                        <option key={agent.AgentId} value={agent.AgentId}>{agent.AgentName}</option>
                    ))}
                </select>

                <input name="CallDurationInSeconds" type="number" value={formData.CallDurationInSeconds} onChange={handleChange} placeholder="Duration (seconds)" className="insert-call-input" required />

                <input name="AudioFilePath" value={formData.AudioFilePath} onChange={handleChange} placeholder="Audio File Path" className="insert-call-input" />

                <select name="CategoryID" value={formData.CategoryID} onChange={handleChange} className="insert-call-input" required>
                    <option value="">Select Category</option>
                    {categories.map(category => (
                        <option key={category.CategoryId} value={category.CategoryId}>{category.CategoryName}</option>
                    ))}
                </select>

                <textarea name="TranscribedText" value={formData.TranscribedText} onChange={handleChange} placeholder="Transcription Text" className="insert-call-input" required />

                <select name="Language" value={formData.Language} onChange={handleChange} className="insert-call-input">
                    <option value="English">English</option>
                    <option value="Urdu">Urdu</option>
                </select>

                <select name="Sentiment" value={formData.Sentiment} onChange={handleChange} className="insert-call-input">
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Neutral">Neutral</option>
                </select>

                <input name="ConfidenceScore" type="number" step="0.01" value={formData.ConfidenceScore} onChange={handleChange} placeholder="Confidence Score (0-1)" className="insert-call-input" required />

                <select name="ActionType" value={formData.ActionType} onChange={handleChange} className="insert-call-input">
                    <option value="Pending">Pending</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Closed">Closed</option>
                    <option value="Flagged">Flagged</option>
                    <option value="Follow-up">Follow-up</option>
                </select>

                <textarea name="AIRecommendations" value={formData.AIRecommendations} onChange={handleChange} placeholder="AI Recommendations" className="insert-call-input" />

                <textarea name="Notes" value={formData.Notes} onChange={handleChange} placeholder="Supervisor Notes" className="insert-call-input" />

                <button type="submit" className="insert-call-submit-btn">Submit Call Record</button>
            </form>
        </div>
    );
};

export default InsertCallRecord;
