// Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">PTCL | UFONE</div>

            {/* Hamburger menu for mobile */}
            <button
                className="navbar-toggle"
                onClick={toggleMenu}
                aria-label="Toggle navigation"
                style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    position: 'absolute',
                    right: '1rem',
                    top: '1rem'
                }}
            >
                ☰
            </button>

            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Analytics</Link>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>Landing</Link>
                <Link to="/Recording" onClick={() => setIsMenuOpen(false)}>Recording</Link>
            </div>
        </nav>
    );
};

export default Navbar;