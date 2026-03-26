import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";

const UsersPage = () => {
  const { token } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/users/all").then((res) => res.data.users),
    enabled: !!token, // ✅ only runs if token exists
    staleTime: 1000 * 60, // ✅ cache for 1 min, no refetch on revisit
  });

  if (!token)
    return <div style={{ padding: 20 }}>Please login to view users.</div>;
  if (isLoading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error)
    return <div style={{ padding: 20, color: "salmon" }}>{error.message}</div>;

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
            <UserRow key={u._id} user={u} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserRow = ({ user }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email);

  const updateMutation = useMutation({
    mutationFn: (updates) => api.put(`/api/users/${user._id}`, updates),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/users/${user._id}`),
    onSuccess: () => queryClient.invalidateQueries(["users"]),
  });

  const handleSave = async () => {
    console.log("save1"); console.log("save1");
    try {
      console.log("save2");
      await updateMutation.mutateAsync({ email });
      console.log("save3");
      setEditing(false);
    } catch (err) {
      alert(err?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete user ${user.email}?`)) return;
    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      alert(err?.message || "Delete failed");
    }
  };

  return (
    <tr>
      <td style={{ padding: 8 }}>{user.name}</td>
      <td style={{ padding: 8 }}>
        {editing ? (
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        ) : (
          user.email
        )}
      </td>
      <td style={{ padding: 8 }}>
        {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
      </td>
      <td style={{ padding: 8 }}>
        {editing ? (
          <>
            <button onClick={handleSave} disabled={updateMutation.isLoading}>
              {updateMutation.isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEmail(user.email);
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button
              onClick={handleDelete}
              style={{ marginLeft: 8, background: "#c0392b", color: "white" }}
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default UsersPage;
