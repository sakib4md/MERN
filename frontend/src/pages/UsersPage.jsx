import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import roles, { roleColors, can } from "../utils/roles";
import UserActions from "../components/UserActions";
import { useState, useEffect, useMemo, useCallback } from "react";

const UsersPage = () => {
  const { token, user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [sortConfig, setSortConfig] = useState({
    name: 1,
    email: 0,
    createdAt: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  // Fix #3 — never call setState synchronously inside an effect
  const canEdit = can(currentUser?.role, "editUsers");
  useEffect(() => {
    if (!canEdit) {
      const id = setTimeout(() => {
        setEditingId(null);
        setEditForm({ name: "", email: "", role: "" });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [canEdit]);

  const sortString = useMemo(
    () =>
      Object.entries(sortConfig)
        .filter(([, dir]) => dir !== 0)
        .map(([field, dir]) => (dir === -1 ? "-" : "") + field)
        .join(","),
    [sortConfig],
  );

  const toggleFieldSort = useCallback((field) => {
    setSortConfig((prev) => ({
      ...prev,
      [field]: { 0: 1, 1: -1, "-1": 0 }[prev[field]],
    }));
    setPage(1);
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users", { page, search, limit, sortConfig }],
    queryFn: () =>
      api
        .get(
          `/api/users?page=${page}&limit=${limit}` +
            `&search=${encodeURIComponent(search)}` +
            `&sort=${encodeURIComponent(sortString)}`,
        )
        .then((r) => r.data),
    enabled: !!token,
    staleTime: 30_000,
    keepPreviousData: true,
  });

  // Fix #2 — no infinite scroll, just current page
  const users = data?.users ?? [];
  const pagination = data?.pagination ?? {};
  const totalPages = pagination.totalPages ?? 1;
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const goTo = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const left = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    const arr = [];
    if (left > 1) {
      arr.push(1);
      if (left > 2) arr.push("…");
    }
    for (let i = left; i <= right; i++) arr.push(i);
    if (right < totalPages) {
      if (right < totalPages - 1) arr.push("…");
      arr.push(totalPages);
    }
    return arr;
  }, [page, totalPages]);

  if (!token)
    return (
      <div className="rounded-[32px] border border-slate-700/80 bg-slate-900/90 p-10 text-center text-slate-200">
        <p className="text-lg font-semibold">Please login to view users.</p>
      </div>
    );

  if (error)
    return (
      <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200">
        <p className="text-lg font-semibold">Unable to load users</p>
        <p className="mt-2 text-sm">{error.message}</p>
      </div>
    );

  return (
    <section className="space-y-6">
      <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/95">
        {/* toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Users
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {pagination.total ? `${pagination.total} total` : "Manage users"}{" "}
              — search, sort &amp; paginate
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email…"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            <div className="inline-flex rounded-2xl bg-slate-100 p-1 dark:bg-slate-900/80">
              {[5, 12, 20, 25].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setLimit(n);
                    setPage(1);
                  }}
                  className={`rounded-2xl px-3 py-1 text-sm font-semibold transition
                    ${
                      limit === n
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* table */}
        <div className="mt-4 h-[200px] overflow-auto rounded-lg border">
          <table className="min-w-full table-auto divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
              <tr>
                {[
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: null, label: "Role" },
                  { key: null, label: "Status" },
                  { key: "createdAt", label: "Created" },
                  { key: null, label: "Actions", right: true },
                ].map(({ key, label, right }) => (
                  <th
                    key={label}
                    className={`px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-500 ${right ? "text-right" : "text-left"}`}
                  >
                    {label}
                    {key && (
                      <button
                        onClick={() => toggleFieldSort(key)}
                        className="ml-2 text-xs"
                      >
                        {sortConfig[key] === 1
                          ? "▲"
                          : sortConfig[key] === -1
                            ? "▼"
                            : "⇅"}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-transparent">
              {isLoading
                ? Array.from({ length: limit }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(6)
                        .fill(0)
                        .map((__, j) => (
                          <td key={j} className="px-4 py-4">
                            <div className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
                          </td>
                        ))}
                    </tr>
                  ))
                : users.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/60"
                    >
                      <td className="px-4 py-3">
                        {editingId === user._id ? (
                          <div className="flex flex-col gap-1">
                            <input
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm((s) => ({
                                  ...s,
                                  name: e.target.value,
                                }))
                              }
                              className="rounded-md border px-2 py-1 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            />
                            <select
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm((s) => ({
                                  ...s,
                                  role: e.target.value,
                                }))
                              }
                              className="rounded-md border px-2 py-1 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                            >
                              {roles
                                .getRoleOptions()
                                .map(({ value, label }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user.name}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {editingId === user._id ? (
                          <input
                            value={editForm.email}
                            onChange={(e) =>
                              setEditForm((s) => ({
                                ...s,
                                email: e.target.value,
                              }))
                            }
                            className="w-full rounded-md border px-2 py-1 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                          />
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {user.email}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${roleColors[user.role] ?? "bg-slate-400 text-white"}`}
                        >
                          {user.role?.toUpperCase() ?? "VIEWER"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {user.status ?? "active"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <UserActions
                          user={user}
                          editingId={editingId}
                          setEditingId={setEditingId}
                          editForm={editForm}
                          setEditForm={setEditForm}
                          refetch={refetch}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* ── pagination ── */}
        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {page}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {totalPages}
            </span>
            {pagination.total ? (
              <>
                {" "}
                &middot;{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {pagination.total}
                </span>{" "}
                users
              </>
            ) : (
              ""
            )}
          </p>

          <div className="flex items-center gap-1">
            {/* ◀◀ first */}
            <button
              onClick={() => goTo(1)}
              disabled={!hasPrev || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="First page"
            >
              «
            </button>
            {/* ◀ prev */}
            <button
              onClick={() => goTo(page - 1)}
              disabled={!hasPrev || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="Previous page"
            >
              ‹
            </button>

            {/* numbered pages */}
            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span
                  key={`ell-${i}`}
                  className="flex h-9 w-9 items-center justify-center text-sm text-slate-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  disabled={isLoading}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition
                    ${
                      p === page
                        ? "border-sky-400 bg-sky-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    }`}
                >
                  {p}
                </button>
              ),
            )}

            {/* ▶ next */}
            <button
              onClick={() => goTo(page + 1)}
              disabled={!hasNext || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="Next page"
            >
              ›
            </button>
            {/* ▶▶ last */}
            <button
              onClick={() => goTo(totalPages)}
              disabled={!hasNext || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              title="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsersPage;
