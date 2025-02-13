import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const SignUp: React.FC = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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
        console.log('Sign Up Data:', formData);
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="signup-form">
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required className='signup-input'/>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className='signup-input' />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className='signup-input'/>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required className='signup-input'/>
                <button type="submit" className="signup-button">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/login">Log In</Link></p>
        </div>
    );
};

export default SignUp;
