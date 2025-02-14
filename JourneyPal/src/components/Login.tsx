import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        const jsonObject = {
            "email": email,
            "username": username,
            "password": password
        }
        try {
            console.log(JSON.stringify(jsonObject)); 
            const response = await fetch('https://localhost:7193/api/Auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(jsonObject),
            });
      
            if (response) {
              console.log('Registration successful:', response);
            } else {
                console.error('Registration failed:', response);
            }
          } catch (err) {
            console.error('Registration failed:', err);
          }
    }

    return (
        <div className="login-container">
    <h2 className="login-title">Log In</h2>
    <form onSubmit={handleLogin} className="login-form">
        <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => e.target.value.includes("@") ? setEmail(e.target.value) : setUsername(e.target.value)} required className="login-input" />
        <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />
        <button type="submit" className="login-button">Log In</button>
    </form>
    <p className="login-text">
        Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link>
    </p>
    <p className='login-text'>
        Forgot your password? <Link to="/forgot-password">Reset it here</Link>
      </p>
</div>

    );
};

export default Login;