import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { can } from '../utils/roles';
import { useEffect } from 'react';

const RoleRoute = ({ children, minRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (minRole && !can(user.role, minRole === 'admin' ? 'manageSettings' : 'viewUsers')) {
    return <Navigate to="/users" replace />;
  }

  return children;
};

export default RoleRoute;
