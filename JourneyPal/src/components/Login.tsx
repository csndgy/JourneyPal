import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';
import api from '../Services/Interceptor'

interface LoginProps {
    onLogin: () => void;
  }

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
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
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('refreshToken', response.data.refreshToken)
            localStorage.setItem('identifier', response.data.identifier)
            onLogin();
            navigate('/profile')

            return response.data;
        } catch (err){
            console.error("Login failed: ", err)
        }
    };

    return (
        <div className="container">
            <div className="hero">
                <form onSubmit={handleLogin} className="form">
                    <div className="logo">JourneyPal</div>
                    
                    <input 
                        type="text" 
                        className="input"
                        placeholder="Email address or username"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                    />
                    
                    <input 
                        type="password" 
                        className="input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    
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