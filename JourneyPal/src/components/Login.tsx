import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Determine if input is email or username
        const isEmail = emailOrUsername.includes('@');
        
        // Debug point 1: Log what we're sending
        const jsonObject = {
            [email.includes('@') ? 'email' : 'userName']: email.includes('@') ? email : username,
            password: password
        }
        console.log('Sending login request:', jsonObject);
        
        try {
            const response = await fetch('https://localhost:7193/api/Auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json' },
                body: JSON.stringify(jsonObject)
            });
    
            // Debug point 2: Log the raw response
            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response text:', responseText);
    
            if (response.ok) {
                const data = JSON.parse(responseText);
                localStorage.setItem("token", data.token);
                localStorage.setItem("identifier", data.Identifier);
                console.log("Login successful:", data);
                navigate("/profile");
            } else {
                console.error("Login failed:", responseText);
            }
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