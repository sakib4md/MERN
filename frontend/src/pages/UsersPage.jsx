import { useQuery } from "@tanstack/react-query";
import { useInView } from 'react-intersection-observer';
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import roles, { roleColors, can } from "../utils/roles";
import UserActions from "../components/UserActions";
import { useState, useEffect, useMemo, useCallback } from "react";

const UsersPage = () => {
  const { user: currentUser, token } = useAuth();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortConfig, setSortConfig] = useState({ name Asc: 1, email: 0, createdAt: 0 });
  const [loadingMore, setLoadingMore] = useState(false);

  const STORAGE_KEY = 'mern-users-table';
  console.log(token, theme, search, page, limit, sortConfig, roles);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      setPage(saved.page || 1);
      setLimit(saved.limit || 12);
      setSearch(saved.search || '');
      setSortConfig(saved.sortConfig || { name: 1, email: 0, createdAt: 0 });
    } catch {
      // ignore invalid saved state
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ page, limit, search, sortConfig }));
  }, [page, limit, search, sortConfig]);

  const getSortString = () =>
    Object.entries(sortConfig)
      .filter(([, dir]) => dir !== 0)
      .map(([field, dir]) => (dir === -1 ? '-' : '') + field)
      .join(',');

  const toggleFieldSort = (field) => {
    setSortConfig((prev) => ({
      ...prev,
      [field]: {
        0: 1,
        1: -1,
        '-1': 0,
      }[prev[field]],
    }));
    setPage(1);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", { page, search, limit, sortConfig }],
    queryFn: () =>
      api
        .get(
          `/api/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&sort=${encodeURIComponent(
            getSortString(),
          )}`,
        )
        .then((res) => res.data),
    enabled: !!token,
    staleTime: 1000 * 60,
  });

  const { users = [], pagination = {} } = data || {};

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });

  // Reset editing state whenever the current user's role changes
  useEffect(() => {
    if (!can(currentUser?.role, 'editUsers')) {
      setEditingId(null);
      setEditForm({ name: '', email: '', role: '' });
    }
  }, [currentUser?.role]);

  const canEdit = can(currentUser?.role, 'editUsers');

  // Infinite scroll observer
  const { ref: loadTrigger, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const loadMoreUsers = useCallback(async () => {
    if (loadingMore || !pagination?.hasNext || isLoading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    // Fetch next page (react-query handles cache)
    setPage(nextPage);
    await refetch();
    setLoadingMore(false);
  }, [page, loadingMore, pagination?.hasNext, isLoading, refetch]);

  useEffect(() => {
    if (inView) {
      loadMoreUsers();
    }
  }, [inView, loadMoreUsers]);

  const cards = useMemo(
    () =>
      users.map((user, index) => (
        <article
          key={user._id}
          className="card-surface min-h-[220px] overflow-hidden transition duration-300 opacity-0 animate-[fadeInUp_0.3s_ease-out_${index * 0.05}s_forwards]"
          style={{ '--fade-delay': `${index * 0.05}s` }}
        >
          {/* existing card content unchanged */}
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">User</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{user.name}</h3>
            </div>
            <div className="rounded-3xl bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">
              {user.email?.split('@')[1] || 'Unknown'}
            </div>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-500">Status</p>
              <p className="mt-2 font-semibold">{user.status || 'active'}</p>
            </div>
            <div className="rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-500">Created</p>
              <p className="mt-2 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-900/80">
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-500 dark:text-slate-500">Email</p>
              <p className="mt-2 break-all">{user.email}</p>
            </div>
          </div>
        </article>
      )),
    [users],
  );

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-14rem)] rounded-[32px] border border-slate-700/80 bg-slate-900/90 p-10 text-center text-slate-200 shadow-soft neon-border">
        <p className="mb-4 text-lg font-semibold">Please login to view users.</p>
        <p className="text-sm text-slate-400">Your dashboard is locked until you sign in.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-14rem)] rounded-[32px] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200 shadow-soft neon-border">
        <p className="text-lg font-semibold">Unable to load users</p>
        <p className="mt-2 text-sm text-red-100">{error.message}</p>
        <button onClick={() => refetch()} className="btn-soft mt-4 bg-red-500 hover:bg-red-600 text-white">Retry</button>
      </div>
    );
  }

  return (
    <section className="space-y-6 h-[calc(100vh-14rem)] flex flex-col">
      {/* Controls */}
      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950/95 neon-border hover:shadow-neonPulse transition-all duration-300">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Users</p>
            <p className="text-sm text-slate-400 dark:text-slate-400">Manage users — search, sort and infinite scroll.</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 min-w-0">
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 transition-all duration-200"
              />
            </label>

            <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900/80 neon-hover:neonPulse">
              {[5, 12, 20, 25].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setLimit(num);
                    setPage(1);
                  }}
                  className={`rounded-2xl px-3 py-1 text-sm font-semibold transition-all duration-200 neon-hover:neonPulse ${limit === num
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow-md ring-1 ring-slate-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table Container - Viewport fit + scrollable */}
      <div className="flex-1 rounded-[24px] border border-slate-200/80 bg-white/90 shadow-lg overflow-auto dark:border-slate-800 dark:bg-slate-950/95 neon-border hover:shadow-neonPulse transition-all duration-300">
        <table className="min-w-full table-auto divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="sticky top-0 bg-gradient-to-r from-slate-50 to-slate-100/50 backdrop-blur-md z-10 divide-y divide-slate-200 dark:bg-slate-900/90 dark:divide-slate-700 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200 cursor-pointer hover:text-neonGreen neon-hover:neonPulse" onClick={() => toggleFieldSort('name')}>
                Name <span>{sortConfig.name === 1 ? '▲' : sortConfig.name === -1 ? '▼' : '⇅'}</span>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200 cursor-pointer hover:text-neonGreen neon-hover:neonPulse" onClick={() => toggleFieldSort('email')}>
                Email <span>{sortConfig.email === 1 ? '▲' : sortConfig.email === -1 ? '▼' : '⇅'}</span>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200">Role</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200 cursor-pointer hover:text-neonGreen neon-hover:neonPulse" onClick={() => toggleFieldSort('createdAt')}>
                Created <span>{sortConfig.createdAt === 1 ? '▲' : sortConfig.createdAt === -1 ? '▼' : '⇅'}</span>
              </th>
              {canEdit && (
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-200">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white/50 dark:bg-slate-950/50">
            {isLoading && users.length === 0
              ? Array.from({ length: canEdit ? limit : limit }).map((_, i) => (
                <tr key={i} className="animate-pulse hover:bg-transparent">
                  <td className="px-6 py-4 skeleton">&nbsp;</td>
                  <td className="px-6 py-4 skeleton">&nbsp;</td>
                  <td className="px-6 py-4 skeleton">&nbsp;</td>
                  <td className="px-6 py-4 skeleton">&nbsp;</td>
                  <td className="px-6 py-4 skeleton">&nbsp;</td>
                  {canEdit && <td className="px-6 py-4 text-right skeleton">&nbsp;</td>}
                </tr>
              ))
              : users.length === 0
                ? (
                  <tr>
                    <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 animate-floatIn">
                      <div className="inline-flex items-center gap-3 mb-4 p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 neon-border">
                        <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c.656 0 1.283.126 1.857.356m0 0c.625.514 1.3.935 2.014 1.226V8.5a2.5 2.5 0 10-5 0V19.143c.713-.291 1.39-.712 2.014-1.226zM12 17v-1a2.5 2.5 0 00-5 0v1m10 0v-1a2.5 2.5 0 00-5 0v1m10 0v-1a2.5 2.5 0 00-5 0v1" />
                        </svg>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">No users found</h3>
                          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
                : users.map((user, index) => (
                  <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      {canEdit && editingId === user._id ? (
                        <>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                            className="w-full rounded-xl border-2 border-sky-400 bg-sky-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all dark:bg-sky-900/50 dark:border-sky-400 dark:text-sky-100"
                          />
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((s) => ({ ...s, role: e.target.value }))}
                            className="ml-2 rounded-xl border-2 border-sky-400 bg-sky-50 px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all dark:bg-sky-900/50 dark:border-sky-400 dark:text-sky-100"
                          >
                            {roles.getRoleOptions().map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <div className="text-sm font-bold text-slate-900 group-hover:text-neonGreen transition-colors dark:text-slate-100 dark:group-hover:text-neonGreen">{user.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                      {canEdit && editingId === user._id ? (
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                          className="w-full rounded-xl border-2 border-sky-400 bg-sky-50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-400/30 transition-all dark:bg-sky-900/50 dark:border-sky-400 dark:text-sky-100"
                        />
                      ) : (
                        <div>{user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-bold ring-1 ring-current/20 shadow-md ${roleColors[user.role] || 'bg-slate-100 text-slate-800 ring-slate-200/50'} neon-hover:shadow-neonPulse`}>
                        {user.role?.toUpperCase() || 'VIEWER'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-800 ring-emerald-200/50' : 'bg-orange-100 text-orange-800 ring-orange-200/50'} ring-1 ring-current/20 shadow-sm`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <UserActions
                          user={user}
                          editingId={editingId}
                          setEditingId={setEditingId}
                          editForm={editForm}
                          setEditForm={setEditForm}
                          refetch={refetch}
                        />
                      </td>
                    )}
                  </tr>
                ))}
            {loadingMore && (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="px-6 py-8 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 animate-pulse">
                    <div className="chakra-spinner w-6 h-6" />
                    Loading more users...
                  </div>
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={canEdit ? 6 : 5} ref={loadTrigger} className="h-20 invisible" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom pagination (hidden on infinite scroll, show if needed) */}
      <div className="flex items-center justify-between pt-4 opacity-30 pointer-events-none">
        <p className="text-sm text-slate-600 dark:text-slate-400">Infinite scroll enabled — scroll to load more</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-soft opacity-50 pointer-events-none">Previous</button>
          <button onClick={() => setPage(page + 1)} className="btn-soft opacity-50 pointer-events-none">Next</button>
        </div>
      </div>
    </section>
  );
};

export default UsersPage;

