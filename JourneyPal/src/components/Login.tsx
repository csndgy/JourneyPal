/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';
import api from '../Services/Interceptor'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginProps {
    onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [feedback, setFeedback] = useState({ message: '', isError: false })
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEmail = identifier.includes('@');

        const jsonObject = {
            [isEmail ? 'email' : 'userName']: identifier,
            password: password
        }

        try {
            const response = await api.post('/api/Auth/login', jsonObject)
            if (response.status !== 200) {
                return;
            }
            else {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('refreshToken', response.data.refreshToken)
                localStorage.setItem('identifier', response.data.identifier)
                setFeedback({ message: 'Login successful! Redirecting...', isError: false });
                onLogin();
                setTimeout(() => navigate('/profile'), 2000);
            };
        } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
        setFeedback({ message: errorMessage, isError: true });
    }
};

return (
    <div className="container">
        <div className="hero">
            <form onSubmit={handleLogin} className="form">
                <div className="logo">JourneyPal</div>

                {feedback.message && (
                    <p className={`feedback-message ${feedback.isError ? 'error' : 'success'}`}>
                        {feedback.message}
                    </p>
                )}

                <input
                    type="text"
                    className="input"
                    placeholder="Email address or username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                />

                <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button
                    type="button"
                    className='show-password-button'
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <input type="submit" value="Log in" className="input submit" />

                <p className="forgotten">
                    Forgotten your login details? <Link to="/forgot-password">Get help with signing in.</Link>
                </p>
                <p className="signup">
                    Don't have an account? <Link to="/signup">SignUp</Link>
                </p>
            </form>
        </div>
    </div>
);
};

export default Login;