import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // ensure axios uses the token immediately (avoid race where interceptor reads localStorage too late)
      api.defaults.headers = api.defaults.headers || {};
      api.defaults.headers.Authorization = `Bearer ${token}`;
      // try to load profile
      api
        .get("/api/users/profile")
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const saveToken = (t) => {
    setToken(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
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

  return (
    <AuthContext.Provider value={{ token, user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
