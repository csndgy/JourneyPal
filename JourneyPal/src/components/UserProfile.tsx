import React, { useState, useEffect } from 'react';
import '../UserProfile.css';
import api, { handleFullLogout } from '../Services/Interceptor';

interface User {
  username: string;
  email: string;
  telephone?: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  label: string;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User>({
    username: "",
    email: "",
    telephone: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [tempPhone, setTempPhone] = useState<string>("");
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        handleFullLogout();
        return;
      }
      await fetchUserData();
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (user.telephone) {
      setTempPhone(user.telephone);
    }
  }, [user.telephone]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("Token:", token);

      const response = await fetch(`https://localhost:7193/api/AccountDetails/profile?nameId=${localStorage.getItem("identifier")}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      console.log("Response status:", response.status);

      if (response.status === 401) {
        // Token expired or invalid - redirect to login
        // window.location.href = '/login';
        throw new Error('Unauthorized - please log in again');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error("Error fetching user data:", err); // Add detailed error logging
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof passwordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!validatePhoneNumber(tempPhone)) {
      setPhoneError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    try {
      await api.patch(`/api/AccountDetails/update-phone?nameId=${localStorage.getItem("identifier")}`, {
        phoneNumber: tempPhone
      });

      setUser({ ...user, telephone: tempPhone });
      setIsEditingPhone(false);
    } catch (err) {
      setPhoneError('Failed to update phone number. Please try again.');
      console.error("Error updating phone number:", err);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    try {
        await api.patch(`/api/AccountDetails/change-password?nameId=${localStorage.getItem("identifier")}`, {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
            confirmPassword: passwordForm.confirmPassword
        });

        setIsChangingPassword(false);
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });
        alert("Password changed successfully!");
    } catch (err) {
        console.error("Error changing password:", err);
        if (err instanceof Error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          alert((err as any).response?.data || "Failed to change password. Please try again.");
        } else {
          alert("Failed to change password. Please try again.");
        }
    }
};

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return { score: 0, label: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let label = '';
    if (score <= 2) label = 'Weak';
    else if (score <= 3) label = 'Medium';
    else label = 'Strong';

    return { score, label };
  };

  const getStrengthColor = (strength: PasswordStrength) => {
    if (!strength.label) return '';
    switch (strength.label) {
      case 'Weak':
        return 'strength-weak';
      case 'Medium':
        return 'strength-medium';
      case 'Strong':
        return 'strength-strong';
      default:
        return '';
    }
  };

  const strength = checkPasswordStrength(passwordForm.newPassword);

  if (loading) {
    return <div className="user-profile-container">Loading...</div>;
  }

  if (error) {
    return <div className="user-profile-container">Error: {error}</div>;
  }

  return (
    <div className="user-profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Profile Information</h2>

        <div className="profile-section">
          <label>Username</label>
          <div className="info-value">{user.username}</div>
        </div>

        <div className="profile-section">
          <label>Email</label>
          <div className="info-value">{user.email}</div>
        </div>

        <div className="profile-section">
          <label>Phone Number</label>
          {isEditingPhone ? (
            <form onSubmit={handlePhoneSubmit} className="phone-form">
              <input
                type="tel"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="Enter phone number (e.g., +1234567890)"
                className="phone-input"
              />
              {phoneError && <div className="error-message">{phoneError}</div>}
              <div className="button-group">
                <button type="submit" className="save-button">Save</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsEditingPhone(false);
                    setPhoneError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="phone-display">
              <span>{user.telephone || 'Not set'}</span>
              <button
                className="edit-button"
                onClick={() => setIsEditingPhone(true)}
              >
                {user.telephone ? 'Change' : 'Add'}
              </button>
            </div>
          )}
        </div>

        <div className="password-section">
          <h3>Password</h3>
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisibility.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('currentPassword')}
                  >
                    <img
                      src={
                        passwordVisibility.currentPassword
                          ? "/images/close.png"
                          : "/images/open.png"
                      }
                      alt="Toggle visibility"
                      className="password-toggle-icon"
                    />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisibility.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('newPassword')}
                  >
                    <img
                      src={
                        passwordVisibility.newPassword
                          ? "/images/close.png"
                          : "/images/open.png"
                      }
                      alt="Toggle visibility"
                      className="password-toggle-icon"
                    />
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="password-strength-indicator">
                    <div className={`strength-bars ${getStrengthColor(strength)}`}>
                      {[1, 2, 3].map((bar) => (
                        <div
                          key={bar}
                          className={`strength-bar ${bar <= strength.score ? 'active' : ''
                            }`}
                        />
                      ))}
                    </div>
                    <span className={`strength-label ${getStrengthColor(strength)}`}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={passwordVisibility.confirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="password-input"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                  >
                    <img
                      src={
                        passwordVisibility.confirmPassword
                          ? "/images/close.png"
                          : "/images/open.png"
                      }
                      alt="Toggle visibility"
                      className="password-toggle-icon"
                    />
                  </button>
                </div>
              </div>

              <div className="button-group">
                <button type="submit" className="save-button">Update Password</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsChangingPassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="change-password-button"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;