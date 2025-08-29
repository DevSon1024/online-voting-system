// frontend/src/pages/VoterManagementPage.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllUsers, adminDeleteUser, getUnvalidatedUsers, getResubmittedUsers, validateUser, adminResetPassword } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AddVoterModal from '../components/AddVoterModal';

export default function VoterManagementPage() {
  const [users, setUsers] = useState([]);
  const [unvalidatedUsers, setUnvalidatedUsers] = useState([]);
  const [resubmittedUsers, setResubmittedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'validated');
  const [showAddVoterModal, setShowAddVoterModal] = useState(false);

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, unvalidatedRes, resubmittedRes] = await Promise.all([
        getAllUsers(),
        getUnvalidatedUsers(),
        getResubmittedUsers()
      ]);
      setUsers(usersRes.data);
      setUnvalidatedUsers(unvalidatedRes.data);
      setResubmittedUsers(resubmittedRes.data);
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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="elevated-card rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Voter Management</h1>
            <p className="text-gray-600">Manage voter registrations, validations, and user accounts</p>
          </div>
          <Button 
            onClick={() => setShowAddVoterModal(true)}
            variant="primary"
            size="lg"
            className="min-w-[140px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Voter
          </Button>
        </div>
      </div>
      <div className="glass-card rounded-xl p-1 mb-6">
        <nav className="flex space-x-1" aria-label="Tabs">
          <button onClick={() => setActiveTab('validated')} className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'validated'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-medium'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}>Validated Voters
          </button>
          <button onClick={() => setActiveTab('unvalidated')} className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'unvalidated'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-medium'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}>Validation Requests
          </button>
          <button onClick={() => setActiveTab('resubmitted')} className={`flex-1 text-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'resubmitted'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-medium'
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }`}>Resubmitted Requests
          </button>
        </nav>
      </div>
      
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {activeTab === 'validated' && (
        <div className="professional-card overflow-hidden hover-lift">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{calculateAge(user.dob)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link to={`/admin/user/${user._id}`}>
                        <Button variant="glass" size="sm" className="w-auto">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        variant="danger"
                        size="sm"
                        className="w-auto"
                      >
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
        <div className="professional-card overflow-hidden hover-lift">
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
                      <Link to={`/admin/validate-user/${user._id}`}>
                        <Button variant="primary" size="sm" className="w-auto">
                          Validate User
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'resubmitted' && (
        <div className="professional-card overflow-hidden hover-lift">
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
                {resubmittedUsers.map(user => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/validate-user/${user._id}`}>
                        <Button variant="warning" size="sm" className="w-auto">
                          Review Resubmission
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showAddVoterModal && <AddVoterModal onClose={() => setShowAddVoterModal(false)} onSave={fetchUsers} />}
    </div>
  );
}