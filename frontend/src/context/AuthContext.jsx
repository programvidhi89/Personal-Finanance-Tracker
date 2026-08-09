import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Initialize Axios header immediately on script load to prevent race conditions on hard refresh
const initialToken = localStorage.getItem('jwt_token');
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      if (username) localStorage.setItem('username', username);
      setIsAuthenticated(true);
      // Set default header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('username');
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token, username]);

  const login = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
