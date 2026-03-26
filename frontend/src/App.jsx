// App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import UsersPage from "./pages/UsersPage";

// HomePage moved to ./pages/HomePage

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ padding: 10 }}>
          <Link to="/">Home</Link> | <Link to="/login">Login</Link> |{" "}
          <Link to="/register">Register</Link> | <Link to="/users">Users</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* ✅ changed */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
