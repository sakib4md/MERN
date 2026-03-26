import { createContext,  useState, useEffect } from "react";
import api from "../api/axiosInstance";
import { getToken, setToken as storageSetToken, removeItem as storageRemoveItem } from "../utils/safeStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoading(true);

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // don't set api.defaults headers here; request interceptor reads token from storage

      try {
        const res = await api.get("/api/users/profile");
        if (mounted) setUser(res.data.user);
      } catch (err) {
        // Only clear token when server explicitly rejects it
        if (err.response && err.response.status === 401) {
          if (mounted) {
              setToken(null);
              setUser(null);
              storageRemoveItem("token");
          }
        } else {
          // transient error (network/CORS/timeout) — keep token and let user retry
          console.error("Failed to fetch profile:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [token]);

  const saveToken = (t) => {
    setToken(t);
    if (t) storageSetToken(t);
    else storageRemoveItem("token");
  };

  const register = async (name, email, password) => {
    const res = await api.post("/api/users/register", { name, email, password });
    const { token: t, user: u } = res.data;
    saveToken(t);
    setUser(u);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/api/users/login", { email, password });
    const { token: t, user: u } = res.data;
    saveToken(t);
    setUser(u);
    return res.data;
  };

  const logout = () => {
    saveToken(null);
    setUser(null);
  };

  // Update current user's profile
  const updateProfile = async (updates) => {
    const res = await api.put("/api/users/profile", updates);
    const { user: u } = res.data;
    setUser(u);
    return res.data;
  };

  // Delete current user's account
  const deleteProfile = async () => {
    const res = await api.delete("/api/users/profile");
    // after successful delete, clear local auth
    logout();
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, register, login, logout, updateProfile, deleteProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
