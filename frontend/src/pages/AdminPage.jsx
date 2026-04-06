import { useAuth } from "../hooks/useAuth";

export default function AdminPage() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="mb-2 text-lg font-semibold">Access denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        Welcome, {user.name} — role: <strong>{user.role}</strong>
      </p>
      <section className="space-y-4">
        <div className="rounded-md border bg-slate-50 p-4 dark:bg-slate-800">
          <h3 className="font-semibold">User management</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">Admin-only controls go here.</p>
        </div>
      </section>
    </div>
  );
}
