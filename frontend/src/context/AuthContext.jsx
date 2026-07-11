import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
    ? "http://localhost:5000"
    : "";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/login`,
      { email, password },
      { withCredentials: true },
    );
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (userData) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/auth/signup`,
      userData,
      { withCredentials: true },
    );
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await axios.post(
      `${API_BASE_URL}/api/auth/logout`,
      {},
      { withCredentials: true },
    );
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
