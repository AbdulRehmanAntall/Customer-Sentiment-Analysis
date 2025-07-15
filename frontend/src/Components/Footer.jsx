import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div>
                <p>© 2025 PTCL | UFONE Telecom Services</p>
                <p>Contact: info@ptcl.com.pk | +92-42-111-20-20-20</p>
            </div>
            <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </div>
        </footer>
    );
};

export default Footer;
