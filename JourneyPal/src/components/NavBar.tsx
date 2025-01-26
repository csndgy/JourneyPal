import React from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';

const NavBar: React.FC = () => {
    return (
        <nav className="navbar">
            <h1 className="navbar-logo">JourneyPal</h1>
            <ul className="navbar-links">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/checklist">Checklist</Link>
                </li>
            </ul>
            <div className="navbar-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="navbar-buttons">
                <button className="login">Log In</button>
                <button className="signup">Sign Up</button>
            </div>
        </nav>
    );
};

export default NavBar;