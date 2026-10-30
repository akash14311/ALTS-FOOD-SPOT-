import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { showToast } = useToast();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('altsfoodspot_user') || localStorage.getItem('foodspot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('altsfoodspot_token') || localStorage.getItem('foodspot_token') || null;
  });

  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('altsfoodspot_token', token);
    } else {
      localStorage.removeItem('altsfoodspot_token');
      localStorage.removeItem('foodspot_token');
    }
  }, [token]);

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('altsfoodspot_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('altsfoodspot_user');
      localStorage.removeItem('foodspot_user');
    }
  }, [user]);

  // Verify and fetch latest user info on app startup
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('altsfoodspot_token') || localStorage.getItem('foodspot_token');
      if (storedToken) {
        try {
          const res = await API.get('/auth/me');
          if (res.success && res.data) {
            setUser(res.data);
          }
        } catch (err) {
          console.warn('Session verification error:', err.message);
          // Token invalid or expired
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Welcome back, ${res.data.user.name.split(' ')[0]}!`, 'success');
        return res.data;
      }
      throw new Error(res.message || 'Login failed');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await API.post('/auth/register', formData);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        showToast('Account created successfully! Welcome to ALTS FOOD spot.', 'success');
        return res.data;
      }
      throw new Error(res.message || 'Registration failed');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // Send OTP handler with optional explicit channel ('phone' | 'email')
  const sendOtp = async (identifier, channel) => {
    try {
      const res = await API.post('/auth/send-otp', { identifier, channel });
      if (res.success) {
        showToast(res.message || 'Verification code dispatched!', 'info');
        return res.data;
      }
      throw new Error(res.message || 'Failed to dispatch verification code');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // Verify OTP handler (supports login & instant account creation)
  const verifyOtp = async (identifier, code, name, channel, secondaryIdentifier) => {
    try {
      const res = await API.post('/auth/verify-otp', { identifier, code, name, channel, secondaryIdentifier });
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(
          res.data.isNewUser
            ? 'Account created successfully! Welcome to ALTS FOOD spot.'
            : `Welcome back, ${res.data.user.name.split(' ')[0]}!`,
          'success'
        );
        return res.data;
      }
      throw new Error(res.message || 'Verification failed');
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('altsfoodspot_token');
    localStorage.removeItem('foodspot_token');
    localStorage.removeItem('altsfoodspot_user');
    localStorage.removeItem('foodspot_user');
    showToast('Logged out successfully', 'info');
  }, [showToast]);

  // Update profile
  const updateProfile = async (data) => {
    try {
      const res = await API.put('/users/profile', data);
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, ...res.data }));
        showToast('Profile updated successfully', 'success');
        return res.data;
      }
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = Boolean(user && user.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        sendOtp,
        verifyOtp,
        logout,
        updateProfile,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
