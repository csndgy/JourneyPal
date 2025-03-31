/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../Services/Interceptor';
import '../ForgotPassword.css'; // We'll create this CSS file next

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      setError('Invalid reset link. Please request a new password reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      const response = await api.post('api/Auth/reset-password', {
        email,
        token,
        newPassword,
      });
      
      setMessage(response.data || 'Password reset successful. Redirecting to login...');
      setError('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to reset password. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-card">
        <h1 className="reset-title">Reset Password</h1>
        <form className="reset-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="password-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="password-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
            />
          </div>
          {message && <div className="message success-message">{message}</div>}
          {error && <div className="message error-message">{error}</div>}
          <button type="submit" className="reset-button">
            Reset Password
          </button>
        </form>
        <div className="login-link">
          <span>Remember your password?</span>
          <a href="/login">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;