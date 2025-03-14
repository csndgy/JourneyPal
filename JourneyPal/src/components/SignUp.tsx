import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    const jsonObject = {
      "userName": username,
      "email": email,
      "password": password
    }

    try {
        console.log(JSON.stringify(jsonObject)); 
        const response = await fetch('https://localhost:7193/api/Auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonObject),
        });
  
        if (response) {
          console.log('Registration successful:', response);
          navigate('/home')
        } else {
            console.error('Registration failed:', response);
        }
      } catch (err) {
        console.error('Registration failed:', err);
      }
  };

  return (
    <div className="container">
      <div className="hero">
        <form onSubmit={handleSignup} className="form">
          <div className="logo">JourneyPal</div>
          
          <div className="signup-subtitle">
            Sign up to plan travels with your family and friends.
          </div>
          
          <div className="input btn google-signup">
            <span>GOOGLE MAJD BENI</span>
          </div>
          
          <div className="or">or</div>
          
          <input 
            type="text" 
            className="input" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          
          <input 
            type="email" 
            className="input" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
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
          
          <input 
            type="password" 
            className="input" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          
          <input type="submit" value="Sign up" className="input submit" />
          
          <p className="terms">
            By signing up, you agree to our <a href="#">Terms</a>, <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a>.
          </p>
        
          <p className="login-option">
            Have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;