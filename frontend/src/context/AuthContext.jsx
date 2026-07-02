import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('attendIQ_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('attendIQ_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    let res;
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (e) {
      throw new Error('Backend server is offline. Please make sure the backend server is running on port 5000.');
    }
    
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Invalid server response (${res?.status || 500}). Please check if the backend is running.`);
    }

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    localStorage.setItem('attendIQ_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const loginStudent = async (rollNumber) => {
    let res;
    try {
      res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rollNumber })
      });
    } catch (e) {
      throw new Error('Backend server is offline. Please make sure the backend server is running on port 5000.');
    }
    
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error('Invalid server response.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Student login failed');
    }
    
    localStorage.setItem('attendIQ_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (username, email, password) => {
    let res;
    try {
      res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'admin' }) // Default to admin for seed/test convenience
      });
    } catch (e) {
      throw new Error('Backend server is offline. Please make sure the backend server is running on port 5000.');
    }
    
    let data;
    try {
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error(`Invalid server response (${res?.status || 500}). Please check if the backend is running.`);
    }

    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    localStorage.setItem('attendIQ_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('attendIQ_user');
    setUser(null);
  };

  // Helper fetch with authentication header and safe JSON parsing
  const authFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    
    // Read fresh token
    const storedUser = localStorage.getItem('attendIQ_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      } catch (e) {
        console.error('Error reading auth token', e);
      }
    }
    
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers
      });
    } catch (e) {
      throw new Error('Backend server connection failed. Ensure your server is running.');
    }
    
    if (res.status === 401) {
      logout();
      throw new Error('Session expired. Please log in again.');
    }
    
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginStudent, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
