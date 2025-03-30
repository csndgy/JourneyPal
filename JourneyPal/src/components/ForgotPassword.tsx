// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import api from '../Services/Interceptor';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await api.post('api/Auth/forgot-password', { email });
      setMessage(response.data.message); 
      setError('');
    } catch (err) {
      setError('Failed to send password reset link. Please try again.' + err);
      setMessage('');
    }
  };

  return (
    <div>
      <h1>Forgot Password</h1>
      <form onSubmit={handleForgotPassword}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Send Reset Link</button>
      </form>
      <p>
        Remember your password? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default ForgotPassword;