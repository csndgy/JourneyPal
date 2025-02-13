import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HeroSection from './components/HeroSection';
import PressRecommendations from './components/PressRecommendations';
import Stats from './components/Stats';
import Footer from './components/Footer';
import Checklist from './components/Checklist';
import SignUp from './components/SignUp';
import './JourneyPal.css';
import Login from './components/Login';

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
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
