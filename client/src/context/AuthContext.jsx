import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('workzen_token') || null);
  const [loading, setLoading] = useState(true);

  // Check current session on mount
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('workzen_token', newToken);
        localStorage.setItem('workzen_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const completeLogin = (res) => {
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('workzen_token', newToken);
    localStorage.setItem('workzen_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const requestRecoveryCode = async (email) => {
    try {
      const res = await api.post('/auth/recovery/request-code', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Unable to send a sign-in code.',
      };
    }
  };

  const loginWithRecoveryCode = async (email, code, newPassword) => {
    try {
      const res = await api.post('/auth/recovery/verify-code', {
        email,
        code,
        ...(newPassword ? { newPassword } : {}),
      });
      if (res.data.success) {
        completeLogin(res);
        return { success: true };
      }
      return { success: false, message: 'Unable to verify sign-in code.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Unable to verify sign-in code.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        return { success: true, verificationRequired: res.data.verificationRequired, email: res.data.email };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
        email: err.response?.data?.email,
      };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const res = await api.post('/auth/verify-email', { email, code });
      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        localStorage.setItem('workzen_token', newToken);
        localStorage.setItem('workzen_user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Email verification failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Email verification failed. Please try again.',
      };
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await api.post('/auth/resend-verification', { email });
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Unable to resend the code. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('workzen_token');
    localStorage.removeItem('workzen_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        role: user?.role || 'guest',
        login,
        requestRecoveryCode,
        loginWithRecoveryCode,
        register,
        verifyEmail,
        resendVerification,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
