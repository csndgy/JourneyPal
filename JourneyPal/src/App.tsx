import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PressRecommendations from './components/PressRecommendations';
import Stats from './components/Stats';
import Footer from './components/Footer';
import Checklist from './components/Checklist';
import './JourneyPal.css';

const App: React.FC = () => {
    return (
        <Router>
            <div className="journey-pal-container">
                <NavBar />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <HeroSection />
                                <PressRecommendations />
                                <Stats />
                                <Footer />
                            </>
                        }
                    />
                    <Route path="/checklist" element={<Checklist />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;