// frontend/src/pages/ValidationDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleUser, validateUser, rejectUser } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

export default function ValidationDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [age, setAge] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getSingleUser(userId);
        setUser(res.data);
        if (res.data.dob) {
            const dob = new Date(res.data.dob);
            const today = new Date();
            let calculatedAge = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                calculatedAge--;
            }
            setAge(calculatedAge);
        }
      } catch (err) {
        setError('Could not fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleApprove = async () => {
    if (window.confirm(`Are you sure you want to approve ${user.name}?`)) {
      try {
        await validateUser(userId);
        setSuccess('User approved successfully! Redirecting...');
        setTimeout(() => navigate('/admin/users', { state: { activeTab: 'unvalidated' } }), 2000);
      } catch (err) {
        setError('Failed to approve user.');
      }
    }
  };

  const handleReject = async () => {
    const reason = prompt(`Please provide a reason for rejecting ${user.name}:`);
    if (reason) {
      try {
        await rejectUser(userId, { reason });
        setSuccess('User rejected successfully! Redirecting...');
        setTimeout(() => navigate('/admin/users', { state: { activeTab: 'unvalidated' } }), 2000);
      } catch (err) {
        setError('Failed to reject user.');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <Button onClick={() => navigate('/admin/users', { state: { activeTab: 'unvalidated' } })} variant="secondary" className="mb-4">
        &larr; Back to Validation Requests
      </Button>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Review Validation Request</h1>
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {user && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 flex flex-col items-center">
              <img
                src={user.photoUrl ? `http://localhost:5000${user.photoUrl}` : 'https://via.placeholder.com/128'}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover mb-4 shadow-md"
              />
            </div>
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 mb-4">{user.email}</p>
              <div className="space-y-2 text-sm">
                <p><strong>State:</strong> {user.state}</p>
                <p><strong>City:</strong> {user.city}</p>
                <p><strong>Date of Birth:</strong> {new Date(user.dob).toLocaleDateString()}</p>
                <p><strong>Age:</strong> {age}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <p className="text-sm text-gray-600 mb-4">Review the user's information and choose an action. This cannot be undone.</p>
            <div className="flex space-x-4">
              <Button onClick={handleApprove} variant="success">Approve User</Button>
              <Button onClick={handleReject} variant="danger">Reject User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}