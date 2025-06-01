import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://samplify-backend-production.up.railway.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Note: In actual implementation, you'd use proper state management instead of localStorage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role_name", data.role_name);
        navigate("/dashboard");
      } else {
        setError(data.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setError("Server Error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const EyeIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }}
    >
      <path d="m1 1 22 22"/>
      <path d="M6.71277 6.7226C3.66479 8.79527 2 12 2 12s4 8 11 8c2.35702 0 4.49894-1.0301 6.28723-2.7226"/>
      <path d="m8.5 8.5 7 7"/>
      <path d="M9.59808 9.59863C9.22838 9.97355 9 10.4704 9 11.0087C9 12.6656 10.3431 14.0087 12 14.0087C12.5377 14.0087 13.0345 13.7803 13.4095 13.4106"/>
    </svg>
  );

  const UserIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const LockIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'inline-block',
        stroke: 'currentColor',
        strokeWidth: '2',
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

  // Maroon-Whitish Theme Styles
  const styles = {
    loginPage: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f5f5 0%,rgb(161, 9, 9) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
      margin: '0',
      boxSizing: 'border-box',
      transform: isLoading ? 'scale(0.95)' : 'scale(1)',
      opacity: isLoading ? '0.7' : '1',
      transition: 'all 0.5s ease'
    },
    backgroundContainer: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      overflow: 'hidden',
      zIndex: '1'
    },
    bgOrb: {
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      opacity: '0.15'
    },
    bgOrb1: {
      top: '-10rem',
      right: '-10rem',
      width: '20rem',
      height: '20rem',
      backgroundColor: '#800020',
      animation: 'pulse 3s ease-in-out infinite'
    },
    bgOrb2: {
      bottom: '-10rem',
      left: '-10rem',
      width: '20rem',
      height: '20rem',
      backgroundColor: '#a0002a',
      animation: 'pulse 3s ease-in-out infinite',
      animationDelay: '2s'
    },
    bgOrb3: {
      top: '10rem',
      left: '10rem',
      width: '15rem',
      height: '15rem',
      backgroundColor: '#600018',
      animation: 'bounce 4s ease-in-out infinite'
    },
    loginWrapper: {
      position: 'relative',
      zIndex: '10',
      width: '100%',
      maxWidth: '28rem',
      transform: 'scale(1)',
      opacity: '1',
      transition: 'all 0.5s ease'
    },
    loginCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(128, 0, 32, 0.1)',
      borderRadius: '1.5rem',
      padding: '2rem',
      boxShadow: '0 25px 50px -12px rgba(128, 0, 32, 0.3)',
      transition: 'box-shadow 0.3s ease'
    },
    loginHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    logoContainer: {
      width: '5rem',
      height: '5rem',
      background: 'linear-gradient(135deg,rgb(128, 0, 0) 0%,rgb(131, 7, 7) 100%)',
      borderRadius: '1rem',
      margin: '0 auto 1.5rem auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 8px 25px -8px rgba(128, 0, 0, 0.4)'
    },
    logoText: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      margin: '0',
      padding: '0'
    },
    welcomeTitle: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#800020',
      margin: '0 0 0.5rem 0',
      padding: '0'
    },
    welcomeSubtitle: {
      color: '#a0002a',
      margin: '0',
      padding: '0',
      opacity: '0.8'
    },
    loginForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    errorContainer: {
      background: 'rgba(128, 0, 32, 0.1)',
      border: '1px solid rgba(128, 0, 0, 0.2)',
      borderRadius: '0.75rem',
      padding: '1rem',
      backdropFilter: 'blur(8px)'
    },
    errorMessage: {
      color: '#800020',
      fontSize: '0.875rem',
      textAlign: 'center',
      fontWeight: '500',
      margin: '0',
      padding: '0'
    },
    inputSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    inputLabel: {
      color: '#800020',
      fontSize: '0.875rem',
      fontWeight: '600',
      margin: '0',
      padding: '0',
      display: 'block'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none',
      zIndex: '2',
      color: '#800020'
    },
    formInput: {
      width: '100%',
      height: '3.5rem',
      padding: '0 1rem 0 3rem',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid rgba(128, 0, 0, 0.2)',
      borderRadius: '0.75rem',
      color: '#800020',
      fontSize: '1rem',
      lineHeight: '1.5',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    passwordInput: {
      width: '100%',
      height: '3.5rem',
      padding: '0 3.5rem 0 3rem',
      background: 'rgba(255, 255, 255, 0.9)',
      border: '2px solid rgba(128, 0, 0, 0.2)',
      borderRadius: '0.75rem',
      color: '#800020',
      fontSize: '1rem',
      lineHeight: '1.5',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    passwordToggleBtn: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#800020',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      padding: '0.5rem',
      width: 'auto',
      height: 'auto',
      zIndex: '3',
      outline: 'none'
    },
    loginBtn: {
      width: '100%',
      height: '3.5rem',
      padding: '0 1.5rem',
      background: isLoading ? 'rgba(128, 0, 0, 0.5)' : 'linear-gradient(135deg,rgb(128, 0, 0) 0%,rgb(96, 0, 0) 100%)',
      color: 'white',
      fontWeight: '600',
      border: 'none',
      borderRadius: '0.75rem',
      cursor: isLoading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      transform: 'scale(1)',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      opacity: isLoading ? '0.5' : '1',
      boxShadow: '0 4px 15px -5px rgba(128, 0, 0, 0.4)'
    },
    loginFooter: {
      marginTop: '2rem',
      textAlign: 'center'
    },
    footerText: {
      color: '#a0002a',
      fontSize: '0.875rem',
      margin: '0',
      padding: '0',
      opacity: '0.8'
    },
    loadingContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    loadingSpinner: {
      width: '1rem',
      height: '1rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <div style={styles.loginPage}>
      {/* CSS Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Animated background elements */}
      <div style={styles.backgroundContainer}>
        <div style={{...styles.bgOrb, ...styles.bgOrb1}}></div>
        <div style={{...styles.bgOrb, ...styles.bgOrb2}}></div>
        <div style={{...styles.bgOrb, ...styles.bgOrb3}}></div>
      </div>

      {/* Main login container */}
      <div style={styles.loginWrapper}>
        {/* Glassmorphism card */}
        <div style={styles.loginCard}>
          {/* Logo and header */}
          <div style={styles.loginHeader}>
            {/* <div style={styles.logoContainer}> */}
              {/* <span style={styles.logoText}>S</span> */}
              <img src ={`/assets/samplifylogo.png`} alt="Samplify Logo" height={100} width={300}/>
            {/* </div> */}
            <h1 style={styles.welcomeTitle}>Welcome Back</h1>
            <p style={styles.welcomeSubtitle}>Sign in to continue to Samplify</p>
          </div>

          {/* Form */}
          <div style={styles.loginForm}>
            {/* Error message */}
            {error && (
              <div style={styles.errorContainer}>
                <p style={styles.errorMessage}>{error}</p>
              </div>
            )}

            {/* Username input */}
            <div style={styles.inputSection}>
              <label style={styles.inputLabel}>Username</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <UserIcon />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    ...styles.formInput,
                    ...(isLoading && { cursor: 'not-allowed', opacity: '0.7' })
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#800020';
                    e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(128, 0, 32, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password input */}
            <div style={styles.inputSection}>
              <label style={styles.inputLabel}>Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <LockIcon />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    ...styles.passwordInput,
                    ...(isLoading && { cursor: 'not-allowed', opacity: '0.7' })
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#800020';
                    e.target.style.boxShadow = '0 0 0 3px rgba(128, 0, 32, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(128, 0, 0, 0.2)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  style={{
                    ...styles.passwordToggleBtn,
                    ...(isLoading && { cursor: 'not-allowed' })
                  }}
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onMouseEnter={(e) => {
                    if (!isLoading) e.target.style.color = '#600018';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#800020';
                  }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              style={styles.loginBtn}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(135deg,rgb(160, 0, 0) 0%,rgb(128, 0, 0) 100%)';
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 8px 25px -8px rgba(128, 0, 0, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.background = 'linear-gradient(135deg,rgb(128, 0, 0) 0%,rgb(96, 0, 5) 100%)';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 15px -5px rgba(128, 0, 0, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <div style={styles.loadingContent}>
                  <div style={styles.loadingSpinner}></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>

          {/* Footer */}
          <div style={styles.loginFooter}>
            <p style={styles.footerText}>
              Secure login powered by advanced encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;