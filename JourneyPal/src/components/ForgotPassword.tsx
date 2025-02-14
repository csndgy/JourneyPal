import React, { useState } from 'react';
import '../ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('https://localhost:7193/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.text();
      setMessage(data);
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
      console.error('Forgot password request failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2 className="forgot-password-title">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="forgot-password-input"
          placeholder="Email Address"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="forgot-password-button"
        >
          {isLoading ? 'Sending...' : 'Reset Password'}
        </button>
      </form>
      {message && (
        <div className="forgot-password-message">
          {message}
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;