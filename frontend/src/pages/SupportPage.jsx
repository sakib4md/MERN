import React from 'react';
import SupportChat from '../components/SupportForm';

const SupportPage = () => {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Support</h1>
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:bg-slate-950/95 dark:border-slate-800">
        <SupportChat />
      </div>
    </div>
  );
};

export default SupportPage;