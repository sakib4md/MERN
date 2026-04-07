 import { useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import roles, { roleColors, can } from "../utils/roles";
import UserActions from "../components/UserActions";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ── tiny spinner ──────────────────────────────────────────────────────────
const Spinner = ({ size = "sm" }) => (
  <svg
    className={`animate-spin text-neonGreen ${size === "sm" ? "h-5 w-5" : "h-8 w-8"}`}
    fill="none" viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ── skeleton row ─────────────────────────────────────────────────────────
const SkeletonRow = ({ cols }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-800" style={{ width: `${60 + (i * 13) % 35}%` }} />
      </td>
    ))}
  </tr>
);

// ── empty state ───────────────────────────────────────────────────────────
const EmptyState = ({ hasSearch }) => (
  <tr>
    <td colSpan={99} className="px-6 py-20 text-center">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-3xl dark:bg-slate-900">
          {hasSearch ? "🔍" : "👥"}
        </div>
        <div>
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            {hasSearch ? "No matching users" : "No users yet"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {hasSearch ? "Try a different search term." : "Users will appear here once added."}
          </p>
        </div>
      </div>
    </td>
  </tr>
);

// ─────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "mern-users-table";

const UsersPage = () => {
  const { user: currentUser, token } = useAuth();
  const { theme } = useTheme(); // keep for any downstream usage
  void theme; // suppress lint

  // ── state ────────────────────────────────────────────────────────────
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(12);
  // FIX: was `{ name Asc: 1, ... }` — invalid identifier with space
  const [sortConfig, setSortConfig] = useState({ name: 1, email: 0, createdAt: 0 });
  const [allUsers, setAllUsers]   = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({ name: "", email: "", role: "" });

  // persist preferences
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.limit)      setLimit(saved.limit);
      if (saved.search)     setSearch(saved.search);
      if (saved.sortConfig) setSortConfig(saved.sortConfig);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ limit, search, sortConfig }));
  }, [limit, search, sortConfig]);

  // ── helpers ──────────────────────────────────────────────────────────
  const getSortString = () =>
    Object.entries(sortConfig)
      .filter(([, dir]) => dir !== 0)
      .map(([field, dir]) => (dir === -1 ? "-" : "") + field)
      .join(",");

  const toggleFieldSort = (field) => {
    setSortConfig((prev) => ({
      ...prev,
      [field]: ({ 0: 1, 1: -1, "-1": 0 })[prev[field]] ?? 1,
    }));
    setPage(1);
    setAllUsers([]);
  };

  const sortArrow = (field) =>
    sortConfig[field] === 1 ? " ▲" : sortConfig[field] === -1 ? " ▼" : " ⇅";

  // ── query ────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["users", { page, search, limit, sortConfig }],
    queryFn: () =>
      api
        .get(
          `/api/users?page=${page}&limit=${limit}` +
          `&search=${encodeURIComponent(search)}` +
          `&sort=${encodeURIComponent(getSortString())}`
        )
        .then((res) => res.data),
    enabled: !!token,
    staleTime: 60_000,
    keepPreviousData: true,
  });

  // accumulate pages for infinite scroll
  useEffect(() => {
    if (!data?.users) return;
    if (page === 1) {
      setAllUsers(data.users);
    } else {
      setAllUsers((prev) => {
        const ids = new Set(prev.map((u) => u._id));
        return [...prev, ...data.users.filter((u) => !ids.has(u._id))];
      });
    }
    setLoadingMore(false);
  }, [data, page]);

  // reset on search/sort/limit change
  useEffect(() => {
    setPage(1);
    setAllUsers([]);
  }, [search, limit, sortConfig]);

  // ── infinite scroll trigger ──────────────────────────────────────────
  const { ref: loadTrigger, inView } = useInView({ threshold: 0.1 });
  const hasNext = data?.pagination?.hasNext ?? false;
  const loadedRef = useRef(false);

  useEffect(() => {
    if (inView && hasNext && !isFetching && !loadingMore) {
      if (loadedRef.current) return;
      loadedRef.current = true;
      setLoadingMore(true);
      setPage((p) => p + 1);
    } else {
      loadedRef.current = false;
    }
  }, [inView, hasNext, isFetching, loadingMore]);

  // reset editing when role changes
  useEffect(() => {
    if (!can(currentUser?.role, "editUsers")) {
      setEditingId(null);
      setEditForm({ name: "", email: "", role: "" });
    }
  }, [currentUser?.role]);

  const canEdit   = can(currentUser?.role, "editUsers");
  const colCount  = canEdit ? 6 : 5;
  const isInitial = isLoading && allUsers.length === 0;

  // ── gate: must be logged in ───────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-12 text-center shadow dark:border-slate-800 dark:bg-slate-900/80">
        <span className="text-5xl">🔒</span>
        <p className="text-xl font-bold text-slate-900 dark:text-white">Login required</p>
        <p className="text-sm text-slate-500">Please sign in to view the users directory.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-3xl border border-red-200 bg-red-50 p-10 text-center dark:border-red-800/40 dark:bg-red-950/30">
        <span className="text-4xl">⚠️</span>
        <p className="font-semibold text-red-700 dark:text-red-300">{error.message}</p>
        <button onClick={() => refetch()} className="btn-soft mt-2 bg-red-500 text-white hover:bg-red-600">
          Retry
        </button>
      </div>
    );
  }

  return (
    /* ── outer flex column fills available viewport ────────────────── */
    <section
      className="flex flex-col gap-4"
      style={{ height: "calc(100vh - 120px - 2rem)" }}
    >
      {/* ── CONTROLS ─────────────────────────────────────────────────── */}
      <div className="shrink-0 rounded-2xl border border-slate-200/80 bg-white/90 px-6 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Users
              {data?.pagination?.total != null && (
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {data.pagination.total}
                </span>
              )}
            </p>
            <p className="text-xs text-slate-400">Search, sort, and scroll to explore.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* search */}
            <label className="relative flex-1 min-w-[200px]">
              <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-neonGreen/50 focus:ring-2 focus:ring-neonGreen/15 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            {/* rows per page */}
            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900">
              {[5, 12, 20, 25].map((n) => (
                <button
                  key={n}
                  onClick={() => setLimit(n)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    limit === n
                      ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950 shadow"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLE (independently scrollable) ─────────────────────────── */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm dark:border-slate-800">
        {/* inner scrollable container */}
        <div className="h-full overflow-y-auto" id="users-scroll-container">
          <table className="min-w-full table-auto">
            {/* sticky head */}
            <thead className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-700/80 dark:bg-slate-950/95">
              <tr>
                {[
                  { label: "Name",    field: "name" },
                  { label: "Email",   field: "email" },
                  { label: "Role",    field: null },
                  { label: "Status",  field: null },
                  { label: "Created", field: "createdAt" },
                ].map(({ label, field }) => (
                  <th
                    key={label}
                    onClick={field ? () => toggleFieldSort(field) : undefined}
                    className={`px-5 py-3.5 text-left text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400
                      ${field ? "cursor-pointer select-none hover:text-neonGreen transition-colors" : ""}`}
                  >
                    {label}{field && sortArrow(field)}
                  </th>
                ))}
                {canEdit && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* skeleton rows */}
              {isInitial &&
                Array.from({ length: limit }).map((_, i) => (
                  <SkeletonRow key={i} cols={colCount} />
                ))}

              {/* empty state */}
              {!isInitial && allUsers.length === 0 && (
                <EmptyState hasSearch={search.length > 0} />
              )}

              {/* data rows */}
              {allUsers.map((user, index) => (
                <tr
                  key={user._id}
                  className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                  style={{
                    animation: `fadeInRow 0.25s ease-out ${Math.min(index * 0.03, 0.4)}s both`,
                  }}
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    {canEdit && editingId === user._id ? (
                      <div className="flex flex-col gap-1.5">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                          className="w-full rounded-xl border-2 border-neonGreen/50 bg-neonGreen/5 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-neonGreen/20 dark:bg-neonGreen/10 dark:text-white"
                        />
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm((s) => ({ ...s, role: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {roles.getRoleOptions().map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-bold uppercase text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-200">
                          {user.name?.[0] ?? "?"}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 transition-colors group-hover:text-neonGreen dark:text-slate-100 dark:group-hover:text-neonGreen">
                          {user.name}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5">
                    {canEdit && editingId === user._id ? (
                      <input
                        value={editForm.email}
                        onChange={(e) => setEditForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full rounded-xl border-2 border-neonGreen/50 bg-neonGreen/5 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-neonGreen/20 dark:bg-neonGreen/10 dark:text-white"
                      />
                    ) : (
                      <span className="text-sm text-slate-600 dark:text-slate-300">{user.email}</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${roleColors[user.role] ?? "bg-slate-200 text-slate-800"}`}>
                      {user.role?.toUpperCase() ?? "VIEWER"}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      user.status === "active" || !user.status
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" || !user.status ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {user.status ?? "active"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  {canEdit && (
                    <td className="px-5 py-3.5 text-right">
                      <UserActions
                        user={user}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        refetch={() => { setPage(1); setAllUsers([]); refetch(); }}
                      />
                    </td>
                  )}
                </tr>
              ))}

              {/* ── infinite scroll trigger row ─────────────────────── */}
              {!isInitial && allUsers.length > 0 && (
                <tr>
                  <td colSpan={colCount} className="px-6 py-4" ref={loadTrigger}>
                    {loadingMore || (isFetching && page > 1) ? (
                      <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                        <Spinner />
                        <span>Loading more users…</span>
                      </div>
                    ) : hasNext ? (
                      <div className="h-1" /> /* invisible sentinel */
                    ) : allUsers.length > limit ? (
                      <p className="text-center text-xs text-slate-400">
                        ✓ All {allUsers.length} users loaded
                      </p>
                    ) : null}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* subtle top-fade when scrolled */}
        <div className="pointer-events-none absolute inset-x-0 top-[52px] h-4 bg-gradient-to-b from-white/60 to-transparent dark:from-slate-950/60" />
      </div>

      {/* ── STATUS BAR ───────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-1 text-xs text-slate-400 dark:text-slate-500">
        <span>
          Showing {allUsers.length}
          {data?.pagination?.total ? ` of ${data.pagination.total}` : ""} users
          {isFetching && !loadingMore && " · refreshing…"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-neonGreen shadow-[0_0_4px_#00ff41] animate-pulse" />
          Infinite scroll active
        </span>
      </div>

      {/* row fade-in keyframe */}
      <style>{`
        @keyframes fadeInRow {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default UsersPage;
