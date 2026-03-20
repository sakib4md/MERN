import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axiosInstance";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const hasFetched = useRef(false); // ✅ blocks StrictMode double call

  useEffect(() => {
    if (!token) return;
    if (hasFetched.current) return; // ✅ skip second StrictMode run
    hasFetched.current = true;

    const controller = new AbortController();

    api.get("/api/users/profile", { signal: controller.signal })
      .then((res) => setUser(res.data.user))
      .catch((err) => {
        if (err.name === "CanceledError") return;
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
      });

    return () => controller.abort(); // ✅ cleanup on unmount
  }, [token]);

  const saveToken = (t) => {
    hasFetched.current = false; // ✅ reset on new login
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