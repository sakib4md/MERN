import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const UsersPage = () => {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/users/all").then(res => res.data.users),
    enabled: !!token, // ✅ only runs if token exists
    staleTime: 1000 * 60, // ✅ cache for 1 min, no refetch on revisit
  });

  if (!token) return <div style={{ padding: 20 }}>Please login to view users.</div>;
  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: "salmon" }}>{error.message}</div>;

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
          {data.map((u) => (
            <tr key={u._id}>
              <td style={{ padding: 8 }}>{u.name}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>
                {u.createdAt ? new Date(u.createdAt).toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
