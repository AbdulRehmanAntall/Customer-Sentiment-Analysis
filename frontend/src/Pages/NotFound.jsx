import React from 'react';
import './NotFound.css';

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1 className="not-found-heading">404</h1>
            <p className="not-found-text">The page you’re looking for does not exist.</p>
            <a href="/" className="not-found-link">← Back to Home</a>
        </div>
    );
};

export default NotFound;
