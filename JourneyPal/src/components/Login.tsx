import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';
import api from '../services/Interceptor';

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const response = await api.post('/auth/login', { email, password })
            const { token, refreshToken } = response.data

            localStorage.setItem('token', token)
            localStorage.setItem('refreshToken', refreshToken)
            navigate('/home')
        } catch (error) {
            console.error('Invalid email or password')
        }
    }

    return (
        <div className="login-container">
    <h2 className="login-title">Log In</h2>
    <form onSubmit={handleLogin} className="login-form">
        <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="login-input" />
        <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />
        <button type="submit" className="login-button">Log In</button>
    </form>
    <p className="login-text">
        Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
    </p>
    <p className='login-text'>
        Forgot your password? <a href="/forgot-password" className='signup-link'>Reset it here</a>
      </p>
</div>

    );
};

export default Login;