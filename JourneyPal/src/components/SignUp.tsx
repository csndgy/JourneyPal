/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../JourneyPal.css';
import '../SingUpLogin.css';
import api from '../Services/Interceptor';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState({message: '', isError: false});
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFeedback({message: 'Passwords do not match', isError: true});
      return;
    }

    const jsonObject = {
      "userName": username,
      "email": email,
      "password": password
    }

    try {
      const response = await api.post('https://localhost:7193/api/Auth/register', jsonObject)

      if (response) {
        setFeedback({ message: 'Registration successful! Redirecting to login...', isError: false });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setFeedback({ message: 'Registration failed. Please try again.', isError: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setFeedback({ message: errorMessage, isError: true });
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

          {feedback.message && (
            <p className={`feedback-message ${feedback.isError ? 'error' : 'success'}`}>
              {feedback.message}
            </p>
          )}

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
            type={showPassword ? "text" : "password"}
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            className="input"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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