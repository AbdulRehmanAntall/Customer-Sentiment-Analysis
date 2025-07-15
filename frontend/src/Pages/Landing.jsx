import React from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Link } from 'react-router-dom';
import './Landing.css';
import img1 from '../images/img1.png';

const Landing = () => {
  return (
    <>
      <Navbar />

      <div className="main-content">
        <div className="landing-card">
          <div className="landing-text">
            <h1 className="main-heading">
              Real-Time AI-Powered Urdu Call Insights
            </h1>
            <p className="mission-statement">
              Empowering supervisors with faster, smarter decision-making through intelligent, AI-driven voice analytics.
            </p>

            <div className="button-group">
              <Link to="/Recording"><button>🎙 Start Recording</button></Link>
              <Link to="/dashboard"><button>📊 View Analytics</button></Link>
            </div>
          </div>

          <div className="landing-image">
            <img src={img1} alt="Supervisor Console Illustration" />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Landing;
