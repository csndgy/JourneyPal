// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import api from '../Services/Interceptor';
import '../ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('api/Auth/forgot-password', { email });
      setMessage(response.data.message); 
      setError('');
    } catch (err) {
      setError('Failed to send password reset link. Please try again.');
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-card">
        <h1 className="forgot-title">Reset Password</h1>
        <form className="forgot-form" onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              className="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          {message && <div className="message success-message">{message}</div>}
          {error && <div className="message error-message">{error}</div>}
          
          <button 
            className="reset-button" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        
        <div className="login-link">
          Remember your password?<a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;