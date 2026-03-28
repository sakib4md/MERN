import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { useState } from "react";

const UsersPage = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const themeStyles = {
    dark: {
      container: {
        backgroundColor: '#2a2a2a',
        border: '1px solid #404040',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      },
      inputSelect: {
        backgroundColor: '#1a1a1a',
        color: 'rgba(255,255,255,0.95)',
        border: '1px solid #404040'
      },
      label: {
        color: 'rgba(255,255,255,0.8)'
      },
      tableHead: {
        backgroundColor: '#2a2a2a'
      },
      borderBottom: '2px solid #404040',
      paginationContainer: {
        backgroundColor: '#2a2a2a',
        borderTop: '1px solid #404040'
      },
      rowHover: '#1a1a1a'
    },
    light: {
      container: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      },
      inputSelect: {
        backgroundColor: 'white',
        color: '#213547',
        border: '1px solid #dee2e6'
      },
      label: {
        color: '#495057'
      },
      tableHead: {
        backgroundColor: '#f8f9fa'
      },
      borderBottom: '2px solid #dee2e6',
      paginationContainer: {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6'
      },
      rowHover: '#f1f3f4'
    }
  };

  const styles = themeStyles[theme];

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", { page, search, limit }],
    queryFn: () => api.get(`/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`).then((res) => res.data),
    enabled: !!token,
    staleTime: 1000 * 60,
  });

  const { users = [], pagination = {} } = data || {};

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

if (!token) return <div style={{ padding: 20, color: 'var(--text-primary)' }}>Please login to view users.</div>;
  if (isLoading) return <div style={{ padding: 20, color: 'var(--text-primary)' }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'var(--error)' }}>{error.message}</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, flexGrow: 1, color: 'var(--text-primary)' }}>Connected Users ({pagination.total || 0} total)</h2>
        <div style={{ 
          ...styles.container,
          display: "flex", 
          gap: 12, 
          alignItems: "center", 
          padding: "12px 16px", 
          borderRadius: 8 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearch}
              style={{ 
                ...styles.inputSelect,
                padding: "10px 12px", 
                borderRadius: 6,
                minWidth: 240,
                outline: "none",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb), 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ ...styles.label, fontWeight: 500 }}>Rows:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              style={{ 
                ...styles.inputSelect,
                padding: "10px 12px", 
                borderRadius: 6,
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--accent)";
                e.target.style.boxShadow = "0 0 0 3px rgba(var(--accent-rgb), 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            >
              {[5, 10, 15, 20, 25, 50].map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ overflow: "auto", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", maxHeight: "70vh" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ fontWeight: "bold" }}>
              <th style={{ 
                position: "sticky", 
                top: 0, 
                ...styles.tableHead,
                padding: 16, 
                borderBottom: styles.borderBottom, 
                textAlign: "left",
                color: 'var(--text-primary)'
              }}>Name</th>
              <th style={{ 
                position: "sticky", 
                top: 0, 
                ...styles.tableHead,
                padding: 16, 
                borderBottom: styles.borderBottom, 
                textAlign: "left",
                color: 'var(--text-primary)'
              }}>Email</th>
              <th style={{ 
                position: "sticky", 
                top: 0, 
                ...styles.tableHead,
                padding: 16, 
                borderBottom: styles.borderBottom, 
                textAlign: "left",
                color: 'var(--text-primary)'
              }}>Created</th>
              <th style={{ 
                position: "sticky", 
                top: 0, 
                ...styles.tableHead,
                padding: 16, 
                borderBottom: styles.borderBottom, 
                textAlign: "left",
                color: 'var(--text-primary)'
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u._id} user={u} theme={theme} />
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div style={{ 
          ...styles.paginationContainer,
          marginTop: 20, 
          padding: 16, 
          display: "flex", 
          justifyContent: "center", 
          gap: 16, 
          alignItems: "center" 
        }}>
          <PaginationButton 
            onClick={() => handlePageChange(page - 1)} 
            disabled={!pagination.hasPrev}
            children="← Previous"
            theme={theme}
          />
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: 'var(--text-primary)' }}>
            Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <PaginationButton 
            onClick={() => handlePageChange(page + 1)} 
            disabled={!pagination.hasNext}
            children="Next →"
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

const PaginationButton = ({ onClick, disabled, children, theme }) => {
  const baseStyle = {
    padding: "12px 24px", 
    borderRadius: 8,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 500,
    fontSize: "1em",
    transition: "all 0.3s ease",
    opacity: 1
  };

  if (disabled) {
    return <button onClick={onClick} disabled style={{ ...baseStyle, border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)', boxShadow: 'none' }}>{children}</button>;
  }

  return (
    <button 
      onClick={onClick}
      style={{ 
        ...baseStyle,
        border: '1px solid var(--primary-blue)', 
        backgroundColor: theme === 'light' ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-dark))' : 'var(--primary-blue)', 
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 16px rgba(0,123,255,0.4)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 12px rgba(0,123,255,0.3)";
      }}
    >
      {children}
    </button>
  );
};

const UserRow = ({ user, theme }) => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [hover, setHover] = useState(false);

  const themeStylesRow = theme === 'dark' ? {
    rowHover: '#1a1a1a',
    borderBottom: '#404040',
    editInput: '#1a1a1a',
    editBorder: '#404040',
    emailColor: 'rgba(255,255,255,0.6)'
  } : {
    rowHover: '#f1f3f4',
    borderBottom: '#eee',
    editInput: 'white',
    editBorder: '#ddd',
    emailColor: '#555'
  };

  // Mutations...
  const updateMutation = useMutation({
    mutationFn: (updates) => api.put(`/api/users/${user._id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/users/${user._id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ email, name });
      setEditing(false);
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${user.name} (${user.email})?`)) return;
    try {
      await deleteMutation.mutateAsync();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Delete failed");
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEmail(user.email);
    setName(user.name);
  };

  return (
    <tr 
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        backgroundColor: hover ? themeStylesRow.rowHover : "transparent",
        transition: "background-color 0.2s ease"
      }}
    >
      <td style={{ padding: 16, borderBottom: `1px solid ${themeStylesRow.borderBottom}`, verticalAlign: "middle" }}>
        {editing ? (
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ 
              width: "100%", 
              padding: 8, 
              backgroundColor: themeStylesRow.editInput,
              color: 'var(--text-primary)',
              border: `1px solid ${themeStylesRow.editBorder}`, 
              borderRadius: 4, 
              boxSizing: "border-box" 
            }}
          />
        ) : (
          <div style={{ fontWeight: 500, fontSize: "1em", color: 'var(--text-primary)' }}>{user.name}</div>
        )}
      </td>
      <td style={{ padding: 16, borderBottom: `1px solid ${themeStylesRow.borderBottom}`, verticalAlign: "middle" }}>
        {editing ? (
          <input 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ 
              width: "100%", 
              padding: 8, 
              backgroundColor: themeStylesRow.editInput,
              color: 'var(--text-primary)',
              border: `1px solid ${themeStylesRow.editBorder}`, 
              borderRadius: 4, 
              boxSizing: "border-box", 
              fontSize: "0.9em" 
            }}
          />
        ) : (
          <span style={{ fontSize: "0.9em", color: themeStylesRow.emailColor }}>{user.email}</span>
        )}
      </td>
      <td style={{ padding: 16, borderBottom: `1px solid ${themeStylesRow.borderBottom}`, verticalAlign: "middle", color: 'var(--text-primary)' }}>
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
      </td>
      <td style={{ padding: 16, borderBottom: `1px solid ${themeStylesRow.borderBottom}`, verticalAlign: "middle" }}>
        {editing ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              style={{
                padding: "8px 16px",
                backgroundColor: updateMutation.isPending ? "var(--text-secondary)" : "var(--success)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: updateMutation.isPending ? "not-allowed" : "pointer",
                fontSize: "0.9em",
                fontWeight: 500
              }}
            >
              {updateMutation.isPending ? "Saving..." : "✅ Save"}
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--text-secondary)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.9em"
              }}
            >
              ❌ Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button 
              onClick={() => setEditing(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--primary-blue)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.9em",
                fontWeight: 500
              }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: "8px 16px",
                backgroundColor: "var(--error)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.9em",
                fontWeight: 500
              }}
              disabled={deleteMutation.isPending}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default UsersPage;

