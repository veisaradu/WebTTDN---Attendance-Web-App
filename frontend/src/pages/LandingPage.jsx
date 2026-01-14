import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/LandingPage.css';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const result = await register(
      registerData.name, 
      registerData.email, 
      registerData.password
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="landing-container">
      <div className="landing-hero">
        <h1 className="landing-title">Welcome to Attendance App</h1>
        <p className="landing-subtitle">
        </p>
      </div>

      <div className="landing-content">
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        <div className="auth-form-container">
          {error && <div className="auth-error">{error}</div>}
          
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  required
                  placeholder="Enter your email"
                />
                <small className="form-hint">
                  Use @prof.smth or @professor.smth for professor account
                </small>
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  required
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm your password"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
          )}
        </div>

       
      </div>
    </div>
  );
}