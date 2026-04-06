import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import roles, { roleColors, can } from "../utils/roles";
import UserActions from "../components/UserActions";
import { useState, useEffect, useMemo } from "react";


const UsersPage = () => {
  const { user: currentUser, token } = useAuth();
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortConfig, setSortConfig] = useState({ name: 1, email: 0, createdAt: 0 });

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

  // Reset editing state whenever the current user's role changes (e.g. switched to viewer)
  useEffect(() => {
    if (!can(currentUser?.role, 'editUsers')) {
      setEditingId(null);
      setEditForm({ name: '', email: '', role: '' });
    }
  }, [currentUser?.role]);

  const canEdit = can(currentUser?.role, 'editUsers');

  const cards = useMemo(
    () =>
      users.map((user) => (
        <article
          key={user._id}
          className="card-surface min-h-[220px] overflow-hidden transition duration-300"
        >
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

  const skeletonCards = Array.from({ length: 8 }).map((_, index) => (
    <div key={index} className="card-surface min-h-[220px] p-6">
      <div className="mb-5 h-5 w-32 rounded-full skeleton" />
      <div className="space-y-3">
        <div className="h-16 rounded-3xl skeleton" />
        <div className="h-12 rounded-3xl skeleton" />
        <div className="h-12 rounded-3xl skeleton" />
      </div>
    </div>
  ));

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-10rem)] rounded-[32px] border border-slate-700/80 bg-slate-900/90 p-10 text-center text-slate-200 shadow-soft">
        <p className="mb-4 text-lg font-semibold">Please login to view users.</p>
        <p className="text-sm text-slate-400">Your dashboard is locked until you sign in.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200 shadow-soft">
        <p className="text-lg font-semibold">Unable to load users</p>
        <p className="mt-2 text-sm text-red-100">{error.message}</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Users</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage users — search, sort and paginate.</p>
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </label>

            <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900/80">
              {[5, 12, 20, 25].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setLimit(num);
                    setPage(1);
                  }}
                  className={`rounded-2xl px-3 py-1 text-sm font-semibold transition ${limit === num
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full table-auto divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name
                  <button onClick={() => toggleFieldSort('name')} className="ml-2 text-xs">{sortConfig.name === 1 ? '▲' : sortConfig.name === -1 ? '▼' : '⇅'}</button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email
                  <button onClick={() => toggleFieldSort('email')} className="ml-2 text-xs">{sortConfig.email === 1 ? '▲' : sortConfig.email === -1 ? '▼' : '⇅'}</button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created
                  <button onClick={() => toggleFieldSort('createdAt')} className="ml-2 text-xs">{sortConfig.createdAt === 1 ? '▲' : sortConfig.createdAt === -1 ? '▼' : '⇅'}</button>
                </th>
                {canEdit && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                )}

              </tr>
            </thead>
            <tbody className="bg-white dark:bg-transparent divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && users.length === 0
                ? Array.from({ length: canEdit ? limit : limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    <td className="px-4 py-4">&nbsp;</td>
                    {!canEdit ? <td className="px-4 py-4">&nbsp;</td> : <td className="px-4 py-4 text-right">&nbsp;</td>}
                  </tr>
                ))
                : users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-900/80">
                    <td className="px-4 py-3">
                      {/* Only render inputs when the current user actually has edit permission */}
                      {canEdit && editingId === user._id ? (
                        <>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                            className="w-full rounded-md border px-2 py-1 text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                          />
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((s) => ({ ...s, role: e.target.value }))}
                            className="ml-2 rounded-md border px-2 py-1 text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                          >
                            {roles.getRoleOptions().map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                      {canEdit && editingId === user._id ? (
                        <input
                          value={editForm.email}
                          onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                          className="w-full rounded-md border px-2 py-1 text-sm bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400/40 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700"
                        />
                      ) : (
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-10">{user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || 'bg-slate-400 text-slate-900'}`}>
                        {user.role?.toUpperCase() || 'VIEWER'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{user.status || 'active'}</td>

                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
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
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">Showing {users.length} users — page {page}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-soft disabled:opacity-50">Previous</button>
            <button onClick={() => setPage(page + 1)} className="btn-soft">Next</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsersPage;
