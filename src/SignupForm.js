import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SignupForm.css';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const roleOptions = [
    { value: '', label: 'Select Role' },
    { value: 'merchandiser', label: 'Merchandiser' },
    { value: 'pd', label: 'PD' },
    { value: 'samplingHead', label: 'Sampling Head' },
    { value: 'embroideryHead', label: 'Embroidery Head' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length === 0) {
      // Form is valid, proceed with submission
      console.log('Form submitted successfully:', formData);
      setIsSubmitted(true);
      setErrors({});
    } else {
      // Form has errors
      setErrors(formErrors);
    }
  };

  if (isSubmitted) {
    return (
      <div className="signup-container">
        <div className="success-message">
          <h2>Account Created Successfully!</h2>
          <p>Welcome to the application. Your account has been created with the role of {
            roleOptions.find(option => option.value === formData.role)?.label
          }.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1>Create an Account</h1>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
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
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword}</span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Select Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={errors.role ? 'error' : ''}
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && <span className="error-message">{errors.role}</span>}
        </div>
        
        <button type="submit" className="signup-button">Create Account</button>
        
        <div className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;