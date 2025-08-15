import { useState, useEffect } from 'react';
import { getAllUsers, adminDeleteUser, getUnvalidatedUsers, validateUser, adminResetPassword } from '../services/api'; // Import adminResetPassword
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [unvalidatedUsers, setUnvalidatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('validated');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, unvalidatedRes] = await Promise.all([
        getAllUsers(),
        getUnvalidatedUsers()
      ]);
      setUsers(usersRes.data);
      setUnvalidatedUsers(unvalidatedRes.data);
    } catch (err) {
      setError('Could not fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete the user "${userName}"? This will also delete all their votes.`)) {
      try {
        await adminDeleteUser(userId);
        setSuccess(`User "${userName}" has been deleted successfully.`);
        fetchUsers(); // Refresh the user list
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete user.');
      }
    }
  };
  
  const handleApproveUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to validate the user "${userName}"?`)) {
      try {
        await validateUser(userId);
        setSuccess(`User "${userName}" has been validated successfully.`);
        fetchUsers(); // Refresh the user lists
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to validate user.');
      }
    }
  };

  const handleResetPassword = async (userId, userName) => {
    const newPassword = prompt(`Enter a new temporary password for ${userName}:`);
    if (newPassword) {
      if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      try {
        const res = await adminResetPassword(userId, newPassword);
        setSuccess(res.data.msg);
        setError('');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to reset password.');
        setSuccess('');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">User Management</h1>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('validated')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'validated' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Validated Users
          </button>
          <button onClick={() => setActiveTab('unvalidated')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'unvalidated' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Validation Requests
          </button>
        </nav>
      </div>
      
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {activeTab === 'validated' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                       <Button onClick={() => handleResetPassword(user._id, user.name)} variant="secondary" className="w-auto px-3 py-1 text-xs">
                        Reset Password
                      </Button>
                      <Button onClick={() => handleDeleteUser(user._id, user.name)} variant="danger" className="w-auto px-3 py-1 text-xs">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'unvalidated' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unvalidatedUsers.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => handleApproveUser(user._id, user.name)} variant="success" className="w-auto px-3 py-1 text-xs">
                        Approve
                      </Button>
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
}