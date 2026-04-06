import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { getRoleOptions, roleColors, can, ROLES } from '../utils/roles';
import api from '../api/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const SettingsPage = () => {
  const { user, token, updateProfile } = useAuth();
  const { theme } = useTheme();
  const [showRoleChanger, setShowRoleChanger] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || ROLES.VIEWER);
  const [activeTab, setActiveTab] = useState('roles');

  const roleDisplayMap = {
    [ROLES.VIEWER]: 'User',
    [ROLES.EDITOR]: 'Editor',
    [ROLES.MODERATOR]: 'Moderator',
    [ROLES.CS]: 'Customer Support',
    [ROLES.ADMIN]: 'Admin'
  };

  const handleRealRoleChange = async (roleValue) => {
    try {
      const response = await updateProfile({ role: roleValue });
      console.log('Role updated:', response);
      setSelectedRole(roleValue);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
    setShowRoleChanger(false);
  };

  const { data: allUsers } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => api.get('/api/users/all').then(res => res.data.users),
    enabled: !!token,
  });

  if (!user) return <div className="p-8 text-center">Login required</div>;

  console.log('Current user role:', user.role);

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Role management and permissions</p>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-2 rounded-2xl font-semibold ${activeTab === 'roles' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}
        >
          Roles
        </button>
        <button 
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-2 rounded-2xl font-semibold ${activeTab === 'permissions' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-900'}`}
        >
          Permissions
        </button>
      </div>

      {activeTab === 'roles' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Your Role</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColors[user.role] || 'bg-slate-400 text-slate-900'}`}>
                  {roleDisplayMap[user.role] || user.role?.toUpperCase() || 'VIEWER'}
                </span>
                <button 
                  onClick={() => setShowRoleChanger(!showRoleChanger)}
                  className="text-xs bg-sky-500 hover:bg-sky-600 text-white px-3 py-1 rounded-full transition-colors font-medium"
                  disabled={!can(user.role, 'manageSettings')}
                >
                  {showRoleChanger ? 'Cancel' : 'Change Role'}
                </button>
              </div>
              {showRoleChanger && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-sky-200/50 space-y-2">
                  {getRoleOptions().map((option) => {
                    const display = roleDisplayMap[option.value] || option.label;
                    const isSelected = selectedRole === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleRealRoleChange(option.value)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected 
                            ? 'bg-sky-500 text-white shadow-sm' 
                            : 'hover:bg-sky-50 dark:hover:bg-sky-900/50 text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        <span className="font-medium">{display}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {allUsers?.map((u) => (
            <div key={u._id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-6 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{u.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${roleColors[u.role] || 'bg-slate-400 text-slate-900'}`}>
                  {u.role?.toUpperCase() || 'VIEWER'}
                </span>
                {can(user.role, 'assignRoles') && (
                  <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Assign Role
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-8 shadow-soft dark:border-slate-800 dark:bg-slate-950/95">
          <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">Permissions Matrix</h2>
          <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">
            Admin: Full access • Customer Support: All user actions • Moderator: View/edit/delete • Editor: View/edit • User: View only
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">View Users</th>
                  <th className="text-left py-3 px-4">Edit Users</th>
                  <th className="text-left py-3 px-4">Delete Users</th>
                  <th className="text-left py-3 px-4">Assign Roles</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries({ ADMIN: ROLES.ADMIN, CS: ROLES.CS, MODERATOR: ROLES.MODERATOR, EDITOR: ROLES.EDITOR, USER: ROLES.VIEWER }).map(([roleKey, roleValue]) => (
                  <tr key={roleValue} className="border-t">
                    <td className="py-3 px-4 font-semibold">{roleKey}</td>
                    <td className={`py-3 px-4 ${can(roleValue, 'viewUsers') ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                      {can(roleValue, 'viewUsers') ? '✓' : '✗'}
                    </td>
                    <td className={`py-3 px-4 ${can(roleValue, 'editUsers') ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                      {can(roleValue, 'editUsers') ? '✓' : '✗'}
                    </td>
                    <td className={`py-3 px-4 ${can(roleValue, 'deleteUsers') ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                      {can(roleValue, 'deleteUsers') ? '✓' : '✗'}
                    </td>
                    <td className={`py-3 px-4 ${can(roleValue, 'assignRoles') ? 'text-green-600 font-semibold' : 'text-slate-400'}`}>
                      {can(roleValue, 'assignRoles') ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
