import React, { useState, useEffect } from "react";
import '../Styles/CallDetails.css';
import moment from 'moment';

const CallDetails = () => {
    const [callDetails, setCallDetails] = useState([]);
    const [filteredDetails, setFilteredDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    const [startDate, setStartDate] = useState(moment().subtract(7, 'days').format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedSentiment, setSelectedSentiment] = useState("");
    const [selectedAgent, setSelectedAgent] = useState("");

    const [editingNotes, setEditingNotes] = useState({}); // { CallID: newNote }

    const actionTypes = ["Flagged", "Escalated", "Closed", "Pending", "Follow-up"];
    const sentiments = ["Positive", "Negative", "Neutral"];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("http://127.0.0.1:5000/api/getallcategories");
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    const fetchCallDetails = async () => {
        if (!startDate || !endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `http://localhost:5000/api/GetCallDetailsWithinDateRange?start_date=${startDate}&end_date=${endDate}`
            );
            if (!response.ok) {
                throw new Error("Failed to fetch call details.");
            }
            const data = await response.json();
            setCallDetails(data);
            setFilteredDetails(data); // initial filter
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters
    useEffect(() => {
        let filtered = [...callDetails];

        if (selectedCategory) {
            filtered = filtered.filter(c => c.CategoryName === selectedCategory);
        }
        if (selectedAction) {
            filtered = filtered.filter(c => c.ActionType === selectedAction);
        }
        if (selectedSentiment) {
            filtered = filtered.filter(c => c.Sentiment === selectedSentiment);
        }
        if (selectedAgent) {
            filtered = filtered.filter(c =>
                c.AgentName && c.AgentName.toLowerCase().includes(selectedAgent.toLowerCase())
            );
        }

        setFilteredDetails(filtered);
    }, [selectedCategory, selectedAction, selectedSentiment, selectedAgent, callDetails]);

    const handleNoteChange = (id, value) => {
        setEditingNotes(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveNote = async (id) => {
        const updatedNote = editingNotes[id];
        try {
            const res = await fetch("http://localhost:5000/api/updateCallNote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    CallID: id,
                    Notes: updatedNote
                })
            });

            if (!res.ok) throw new Error("Failed to update note.");

            // Update local state
            setCallDetails(prev =>
                prev.map(call =>
                    call.CallID === id ? { ...call, Notes: updatedNote } : call
                )
            );
            setEditingNotes(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        } catch (err) {
            alert("Error saving note: " + err.message);
        }
    };

    // Helper function to get status badge class
    const getStatusClass = (actionType) => {
        if (!actionType) return '';
        return `status-badge status-${actionType.toLowerCase()}`;
    };

    // Helper function to get sentiment class
    const getSentimentClass = (sentiment) => {
        if (!sentiment) return '';
        return `status-badge sentiment-${sentiment.toLowerCase()}`;
    };

    return (
        <div className="call-details-container">
            <h2>📞 Call Details</h2>

            {/* Filters */}
            <div className="filter-section">
                <div className="date-filters">
                    <label>
                        Start Date:{" "}
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </label>
                    <label>
                        End Date:{" "}
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </label>
                    <button className="search-button" onClick={fetchCallDetails}>
                        Search
                    </button>
                </div>

                {/* Dropdown filters */}
                <div className="dropdown-filters">
                    <label>
                        Category:{" "}
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                        >
                            <option value="">All</option>
                            {categories.map((cat, i) => (
                                <option key={i} value={cat.CategoryName}>
                                    {cat.CategoryName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Agent Name:{" "}
                        <input
                            type="text"
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            placeholder="Enter agent name"
                        />
                    </label>

                    <label>
                        Action Type:{" "}
                        <select
                            value={selectedAction}
                            onChange={e => setSelectedAction(e.target.value)}
                        >
                            <option value="">All</option>
                            {actionTypes.map((action, i) => (
                                <option key={i} value={action}>{action}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Sentiment:{" "}
                        <select
                            value={selectedSentiment}
                            onChange={e => setSelectedSentiment(e.target.value)}
                        >
                            <option value="">All</option>
                            {sentiments.map((s, i) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>
                    </label>
                </div>
            </div>

            {/* Status Messages */}
            {loading && <div className="loading-message">Loading call details...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && !filteredDetails.length && (
                <div className="no-records-message">No call records found.</div>
            )}

            {/* Table */}
            {!loading && filteredDetails.length > 0 && (
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="call-details-table">
                            <thead>
                                <tr>
                                    <th>Call ID</th>
                                    <th>Agent Name</th>
                                    <th>Customer Number</th>
                                    <th>Category</th>
                                    <th>Action Type</th>
                                    <th>Sentiment</th>
                                    <th>AI Recommendation</th>
                                    <th>Transcribed Text</th>
                                    <th>Supervisor Notes</th>

                                </tr>
                            </thead>
                            <tbody>
                                {filteredDetails.map(call => (
                                    <tr key={call.CallID}>
                                        <td>
                                            <span className="call-id">
                                                {call.CallID}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="agent-name">
                                                {call.AgentName || <span className="empty-cell">—</span>}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="customer-number">
                                                {call.CustomerNumber || <span className="empty-cell">—</span>}
                                            </span>
                                        </td>
                                        <td>
                                            {call.CategoryName || <span className="empty-cell">—</span>}
                                        </td>
                                        <td>
                                            {call.ActionType ? (
                                                <span className={getStatusClass(call.ActionType)}>
                                                    {call.ActionType}
                                                </span>
                                            ) : (
                                                <span className="empty-cell">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {call.Sentiment ? (
                                                <span className={getSentimentClass(call.Sentiment)}>
                                                    {call.Sentiment}
                                                </span>
                                            ) : (
                                                <span className="empty-cell">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {call.AIRecommendations || <span className="empty-cell">—</span>}
                                        </td>
                                        <td>
                                            {call.TranscribedText ? (
                                                <div className="transcribed-text">
                                                    {call.TranscribedText}
                                                </div>
                                            ) : (
                                                <span className="empty-cell">—</span>
                                            )}
                                        </td>
                                        <td>
                                            {call.ActionType === "Pending" ? (
                                                <div className="notes-input-container">
                                                    <input
                                                        type="text"
                                                        className="notes-input"
                                                        value={editingNotes[call.CallID] ?? call.Notes}
                                                        onChange={(e) =>
                                                            handleNoteChange(call.CallID, e.target.value)
                                                        }
                                                    />
                                                    <button
                                                        className="save-button"
                                                        onClick={() => handleSaveNote(call.CallID)}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            ) : (
                                                call.Notes || <span className="empty-cell">—</span>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallDetails;