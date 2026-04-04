import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import getErrorMessage from "../utils/getErrorMessage";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/profile");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-md p-6 rounded-2xl border border-slate-200 bg-white/90 dark:bg-slate-950/95 dark:border-slate-800">
      <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-sky-400/30 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-sky-400/30 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
          />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-soft">Login</button>
          <p className="text-sm text-slate-600 dark:text-slate-400">No account? <Link to="/register" className="underline">Register</Link></p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
