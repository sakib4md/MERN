import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  if (!user?.isAdmin) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
        <h2 className="mb-2 text-lg font-semibold">Access denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
      <h1 className="mb-4 text-2xl font-bold">Admin Dashboard</h1>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Welcome, {user.name} ({user.email}).</p>

      <section className="space-y-4">
        <div className="rounded-md border bg-slate-50 p-4 dark:bg-slate-800">
          <h3 className="font-semibold">Controls</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">You can add admin-only controls here (user management, billing links, logs).</p>
        </div>

        <div className="rounded-md border bg-slate-50 p-4 dark:bg-slate-800">
          <h3 className="font-semibold">Quick Actions</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
            <li>View all users</li>
            <li>Manage billing</li>
            <li>System logs</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
