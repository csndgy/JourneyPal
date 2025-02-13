import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const Login: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Itt lehetne validáció és backend API hívás
        console.log('Login Data:', formData);
    };

    return (
        <div className="login-container">
    <h2 className="login-title">Log In</h2>
    <form onSubmit={handleSubmit} className="login-form">
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="login-input" />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="login-input" />
        <button type="submit" className="login-button">Log In</button>
    </form>
    <p className="login-text">
        Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
    </p>
</div>

    );
};

export default Login;