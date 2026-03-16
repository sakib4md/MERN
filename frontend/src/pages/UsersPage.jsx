import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    api
      .get("/api/users/all")
      .then((res) => setUsers(res.data.users))
      .catch((err) => setError(err.response?.data?.message || "Failed to load users"));
  }, [token]);

  if (!token) return <div style={{ padding: 20 }}>Please login to view connected users.</div>;
  if (!users && !error) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "salmon" }}>{error}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Connected Users</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Name</th>
            <th style={{ textAlign: "left", padding: 8 }}>Email</th>
            <th style={{ textAlign: "left", padding: 8 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id || u.id}>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
