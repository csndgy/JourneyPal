import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        
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
    }

    return (
        <div className="login-container">
    <h2 className="login-title">Log In</h2>
    <form onSubmit={handleLogin} className="login-form">
        <input type="text" name="email/username" placeholder="Email/Username" value={email} onChange={(e) => e.target.value.includes('@') ? setEmail(e.target.value) : setUsername(e.target.value)} className="login-input" />
        <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />
        <button type="submit" className="login-button">Log In</button>
    </form>
    <p className="login-text">
        Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
    </p>
    <p className='login-text'>
        Forgot your password? <a href="/forgot-password" className='signup-link'>Reset it here</a>
      </p>
      <p>
        
      </p>
</div>

    );
};

export default Login;