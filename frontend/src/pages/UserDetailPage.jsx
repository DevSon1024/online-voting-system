// frontend/src/pages/UserDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSingleUser, adminUpdateUser, adminResetPassword, adminDeleteUser } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// New component for inline editing
const EditableField = ({ label, value, name, type = 'text', onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append(name, currentValue);
    await onSave(formData);
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b">
      <span className="font-semibold">{label}:</span>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            name={name}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-auto"
          />
          <Button onClick={handleSave} variant="success" className="w-auto px-3 py-1 text-xs">Save</Button>
          <Button onClick={() => setIsEditing(false)} variant="secondary" className="w-auto px-3 py-1 text-xs">Cancel</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>{type === 'date' ? new Date(value).toLocaleDateString() : value}</span>
          <Button onClick={() => setIsEditing(true)} variant="ghost" className="w-auto px-3 py-1 text-xs">Edit</Button>
        </div>
      )}
    </div>
  );
};

export default function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getSingleUser(userId);
      setUser(res.data);
    } catch (err) {
      setError('Could not fetch user details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleUpdate = async (formData) => {
    try {
      await adminUpdateUser(userId, formData);
      setSuccess('User updated successfully.');
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update user.');
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      setError('Please select a photo to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('photo', photoFile);
    await handleUpdate(formData);
  };

  const handleResetPassword = async () => {
    const newPassword = prompt(`Enter a new temporary password for ${user.name}:`);
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

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to delete the user "${user.name}"? This action is irreversible.`)) {
      try {
        await adminDeleteUser(userId);
        navigate('/admin/users');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete user.');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <Button onClick={() => navigate('/admin/users')} variant="secondary" className="mb-4">
        &larr; Back to User Management
      </Button>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">User Details</h1>
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {user && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="flex flex-col items-center">
              <img
                src={user.photoUrl ? `http://localhost:5000${user.photoUrl}` : 'https://via.placeholder.com/128'}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
              <Input type="file" onChange={(e) => setPhotoFile(e.target.files[0])} />
              <Button onClick={handlePhotoUpload} variant="primary" className="mt-2">Upload Photo</Button>
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="space-y-2">
              <EditableField label="Name" name="name" value={user.name} onSave={handleUpdate} />
              <EditableField label="Email" name="email" value={user.email} onSave={handleUpdate} />
              <EditableField label="State" name="state" value={user.state} onSave={handleUpdate} />
              <EditableField label="City" name="city" value={user.city} onSave={handleUpdate} />
              <EditableField label="Date of Birth" name="dob" value={new Date(user.dob).toISOString().split('T')[0]} type="date" onSave={handleUpdate} />
            </div>
          </div>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Actions</h3>
            <div className="flex space-x-4">
              <Button onClick={handleResetPassword} variant="secondary">Reset Password</Button>
              <Button onClick={handleDeleteUser} variant="danger">Delete Voter</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}