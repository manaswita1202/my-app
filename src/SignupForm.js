import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './SignupForm.css';

const SignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteHash = searchParams.get('invite');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [inviteData, setInviteData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingInvite, setIsValidatingInvite] = useState(true);
  const [apiError, setApiError] = useState('');

  // Validate invite on component mount
  useEffect(() => {
    if (!inviteHash) {
      setApiError('No invite hash provided. You need a valid invitation link to register.');
      setIsValidatingInvite(false);
      return;
    }

    validateInvite(inviteHash);
  }, [inviteHash]);

  const validateInvite = async (hash) => {
    try {
      const response = await fetch(`http://localhost:5000/validate-invite/${hash}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid invite');
      }

      if (data.valid) {
        setInviteData(data);
        setFormData(prev => ({
          ...prev,
          email: data.email // Pre-fill email from invite
        }));
      } else {
        throw new Error(data.message || 'Invalid invite');
      }
    } catch (error) {
      console.error('Invite validation error:', error);
      setApiError(error.message || 'Failed to validate invite');
    } finally {
      setIsValidatingInvite(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent email change if it doesn't match invite
    if (name === 'email' && inviteData && value !== inviteData.email) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (inviteData && formData.email !== inviteData.email) {
      newErrors.email = 'Email must match the invited email';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.email,
          password: userData.password,
          invite_hash: inviteHash
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      setIsLoading(true);
      setApiError('');
      
      try {
        const result = await registerUser(formData);
        console.log('Registration successful:', result);
        setIsSubmitted(true);
        setErrors({});
      } catch (error) {
        console.error('Registration error:', error);
        setApiError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(formErrors);
    }
  };

  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      'admin': 'Merchandiser',
      'PD': 'PD',
      'sampling': 'Sampling Head',
      'embroidery': 'Embroidery Head'
    };
    return roleMap[roleName] || roleName;
  };

  // Loading state while validating invite
  if (isValidatingInvite) {
    return (
      <div className="signup-container">
        <div className="loading-message">
          <h2>Validating Invitation...</h2>
          <p>Please wait while we verify your invitation.</p>
        </div>
      </div>
    );
  }

  // Error state for invalid/expired invites
  if (!inviteData && apiError) {
    return (
      <div className="signup-container">
        <div className="error-message">
          <h2>Invalid Invitation</h2>
          <p>{apiError}</p>
          <p>Please contact your administrator for a valid invitation link.</p>
          <Link to="/" className="back-button">Go to Home</Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="signup-container">
        <div className="success-message">
          <h2>Account Created Successfully!</h2>
          <p>Welcome to the application! Your account has been created with the role of <strong>{getRoleDisplayName(inviteData.role)}</strong>.</p>
          <p>You can now <Link to="/login">log in</Link> with your credentials.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1>Create Your Account</h1>
        
        {inviteData && (
          <div className="invite-info">
            <p>You've been invited to join as: <strong>{getRoleDisplayName(inviteData.role)}</strong></p>
            <p className="invite-expires">Invitation expires: {new Date(inviteData.expires_at).toLocaleDateString()}</p>
          </div>
        )}
        
        {apiError && (
          <div className="api-error-message">
            {apiError}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
            disabled={isLoading || (inviteData && formData.email === inviteData.email)}
            readOnly={inviteData && formData.email === inviteData.email}
          />
          {inviteData && formData.email === inviteData.email && (
            <span className="field-note">Email is pre-filled from your invitation</span>
          )}
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'error' : ''}
            disabled={isLoading}
            placeholder="Minimum 6 characters"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>
        
        <button 
          type="submit" 
          className="signup-button"
          disabled={isLoading || !inviteData}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;