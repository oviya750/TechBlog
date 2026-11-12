import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('techblog_token');
    return t && t !== 'null' && t !== 'undefined' ? t : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('techblog_token');
    localStorage.removeItem('techblog_user');
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 broadcast events from Axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };

    window.addEventListener('techblog_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('techblog_auth_expired', handleAuthExpired);
  }, [logout]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('techblog_token');
      if (storedToken && storedToken !== 'null' && storedToken !== 'undefined') {
        try {
          const res = await authAPI.getMe();
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.warn('Authentication token invalid or expired:', error?.response?.data?.message || error.message);
          logout();
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('techblog_token', receivedToken);
      localStorage.setItem('techblog_user', JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout
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

