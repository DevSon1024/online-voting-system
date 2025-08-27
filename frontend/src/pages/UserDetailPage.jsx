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
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Button onClick={() => navigate('/admin/users')} variant="outline" size="md" className="mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Voter Management
      </Button>
      
      <div className="elevated-card rounded-2xl p-8 mb-6">
        <h1 className="text-4xl font-bold text-gradient mb-2">Voter Details</h1>
        <p className="text-gray-600">Manage voter information and account settings</p>
      </div>
      
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />

      {user && (
        <div className="elevated-card rounded-2xl p-8 hover-lift">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 mb-8">
            <div className="flex-shrink-0 text-center lg:text-left">
              <img
                src={user.photoUrl ? `http://localhost:5000${user.photoUrl}` : 'https://via.placeholder.com/192'}
                alt={user.name}
                className="w-48 h-48 rounded-2xl object-cover shadow-large border-4 border-white/50 mx-auto lg:mx-0 mb-4"
              />
              <div className="space-y-3">
                <Input 
                  type="file" 
                  onChange={(e) => setPhotoFile(e.target.files[0])} 
                  className="text-sm"
                />
                <Button 
                  onClick={handlePhotoUpload} 
                  variant="primary" 
                  size="md" 
                  fullWidth
                  className="justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Photo
                </Button>
              </div>
            </div>
            <div className="flex-grow">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h2>
                <p className="text-gray-600 text-lg mb-4">{user.email}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Registration Status</span>
                    <p className="text-lg font-semibold text-green-600 mt-1">Validated Voter</p>
                  </div>
                  <div className="bg-white/50 rounded-lg p-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Type</span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">Standard User</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editable Voter Information
            </h3>
            <div className="space-y-4">
              <EditableField label="Name" name="name" value={user.name} onSave={handleUpdate} />
              <EditableField label="Email" name="email" value={user.email} onSave={handleUpdate} />
              <EditableField label="State" name="state" value={user.state} onSave={handleUpdate} />
              <EditableField label="City" name="city" value={user.city} onSave={handleUpdate} />
              <EditableField label="Date of Birth" name="dob" value={new Date(user.dob).toISOString().split('T')[0]} type="date" onSave={handleUpdate} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Administrative Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleResetPassword} 
                variant="warning" 
                size="lg" 
                fullWidth
                className="justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Reset Password
              </Button>
              <Button 
                onClick={handleDeleteUser} 
                variant="danger" 
                size="lg" 
                fullWidth
                className="justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Voter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}