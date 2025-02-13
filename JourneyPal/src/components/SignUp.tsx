import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../JourneyPal.css';
import { useNavigate } from 'react-router-dom';


const SignUp: React.FC = () => {

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
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
        } else {
            console.error('Registration failed:', response);
        }
      } catch (err) {
        console.error('Registration failed:', err);
      }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <input type="text" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <Link to="/login">Log In</Link></p>
    </div>
  );
};

export default SignUp;
