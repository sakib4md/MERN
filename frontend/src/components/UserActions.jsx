import { can, getDeletionConfirmation } from '../utils/roles';
import api from '../api/axiosInstance';
import roles from '../utils/roles';

import { useAuth } from '../hooks/useAuth';

const UserActions = ({ user, editingId, setEditingId, editForm, setEditForm, refetch }) => {
  const { user: currentUser } = useAuth();
  console.log(can(currentUser?.role, 'editUsers'), 'editUsers permission for role:', currentUser?.role);
  const handleEdit = () => {
    setEditingId(user._id);
    setEditForm({ name: user.name || '', email: user.email || '', role: user.role || 'viewer' });
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/users/${user._id}`, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role
      });
      setEditingId(null);
      await refetch();
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(getDeletionConfirmation(user.role))) return;
    try {
      await api.delete(`/api/users/${user._id}`);
      await refetch();
      alert('User deleted');
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  if (editingId === user._id) {
    return (
      <div className="flex gap-2">
        <button onClick={handleSave} className="btn-soft bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1 rounded-lg text-sm">
          Save
        </button>
        <button onClick={handleCancel} className="btn-soft px-3 py-1 rounded-lg text-sm">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {can(currentUser?.role, 'editUsers') && (
        <button onClick={handleEdit} className="btn-soft px-3 py-1 rounded-lg text-sm">
          Edit
        </button>
      )}
      {can(currentUser?.role, 'deleteUsers') && (
        <button onClick={handleDelete} className="btn-soft bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1 rounded-lg text-sm">
          Delete
        </button>
      )}
    </div>
  );
};

export default UserActions;
