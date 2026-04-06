/**
 * Role-Based Access Control (RBAC) Config
 * Efficient permission system for 5 roles: admin, cs, moderator, editor, viewer
 * Admin: Full access
 * CS: All user actions
 * Moderator: View/edit/delete
 * Editor: View/edit
 * Viewer: View only
 */

export const ROLES = {
  ADMIN: 'admin',
  CS: 'cs',
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  viewUsers: ['admin', 'cs', 'moderator', 'editor', 'viewer'],
  editUsers: ['admin', 'cs', 'moderator', 'editor'],
  deleteUsers: ['admin'],
  assignRoles: ['admin', 'cs'],
  manageSettings: ['admin']
};

export const can = (userRole, permission) => {
  return PERMISSIONS[permission]?.includes(userRole) || false;
};

export const getRoleOptions = () => [
  { value: ROLES.VIEWER, label: 'Viewer' },
  { value: ROLES.EDITOR, label: 'Editor' },
  { value: ROLES.MODERATOR, label: 'Moderator' },
  { value: ROLES.CS, label: 'Customer Support' },
  { value: ROLES.ADMIN, label: 'Admin' }
];

export const getDeletionConfirmation = (role) => {
  const messages = {
    [ROLES.ADMIN]: 'Delete this admin user? All permissions lost.',
    [ROLES.CS]: 'Delete CS user? Support tickets affected.',
    [ROLES.MODERATOR]: 'Delete moderator? Moderation queue affected.',
    [ROLES.EDITOR]: 'Delete editor? Content access revoked.',
    [ROLES.VIEWER]: 'Delete viewer account?'
  };
  return messages[role] || 'Delete user?';
};

export const roleColors = {
  [ROLES.ADMIN]: 'bg-purple-500 text-white',
  [ROLES.CS]: 'bg-emerald-500 text-white',
  [ROLES.MODERATOR]: 'bg-orange-500 text-white',
  [ROLES.EDITOR]: 'bg-blue-500 text-white',
  [ROLES.VIEWER]: 'bg-slate-400 text-slate-900'
};

export default { ROLES, PERMISSIONS, can, getRoleOptions, getDeletionConfirmation, roleColors };

