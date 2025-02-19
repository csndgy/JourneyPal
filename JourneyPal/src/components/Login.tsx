import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const Login: React.FC = () => {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Determine if input is email or username
        const isEmail = emailOrUsername.includes('@');
        
        const jsonObject = {
            "email": isEmail ? emailOrUsername : '',
            "username": !isEmail ? emailOrUsername : '',
            "password": password
        };
        
        try {
            const response = await fetch('https://localhost:7193/api/Auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' }, // Fixed typo in 'Content-Type'
                body: JSON.stringify(jsonObject)
            });

            if (response.ok) {
                console.log('Login successful: ', response);
                // Add redirect or success handling here
            }
            else {
                console.log("Login failed: ", response);
            }
        } catch (err){
            console.error("Login failed: ", err);
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
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
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
                    
                    <div className="or">or</div>
                    
                    <div className="input btn">Login with gugöl</div>
                    
                    <p className="signup">
                        Don't have an account? <Link to="/signup">SignUp</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;