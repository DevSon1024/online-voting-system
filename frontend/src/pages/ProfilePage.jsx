import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/api';
import { useAuth } from '../hooks/AuthContext';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Reusable component for inline editing
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

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await getUserProfile();
      setUser(res.data);
    } catch (err) {
      setError('Could not fetch your profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (formData) => {
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(formData);
      setSuccess('Profile updated successfully!');
      fetchProfile(); // Re-fetch to show updated data
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
    }
  };
  
  const handleSimpleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('email', user.email);
    await handleUpdate(formData);
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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteUserProfile();
        logout();
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete your account.');
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="glass-effect rounded-3xl p-8 shadow-large">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h2>
            <p className="text-gray-600">Update your account information</p>
          </div>
          
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />

          {isAdmin && user ? (
            // Advanced view for Admins
            <div>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={user.photoUrl ? `http://localhost:5000${user.photoUrl}` : 'https://via.placeholder.com/128'}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <Input type="file" onChange={(e) => setPhotoFile(e.target.files[0])} />
                <Button onClick={handlePhotoUpload} variant="primary" className="mt-2">Upload Photo</Button>
              </div>
              <div className="space-y-4">
                <EditableField label="Name" name="name" value={user.name} onSave={handleUpdate} />
                <EditableField label="Email" name="email" value={user.email} onSave={handleUpdate} />
                <EditableField label="State" name="state" value={user.state} onSave={handleUpdate} />
                <EditableField label="City" name="city" value={user.city} onSave={handleUpdate} />
                <EditableField label="Date of Birth" name="dob" value={new Date(user.dob).toISOString().split('T')[0]} type="date" onSave={handleUpdate} />
              </div>
            </div>
          ) : (
            // Simple view for Voters
            user && (
              <form className="space-y-6" onSubmit={handleSimpleUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <Input 
                      type="text"
                      name="name"
                      value={user.name} 
                      onChange={(e) => setUser({...user, name: e.target.value})}
                      placeholder="Enter your full name" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <Input 
                      type="email"
                      name="email"
                      value={user.email} 
                      onChange={(e) => setUser({...user, email: e.target.value})}
                      placeholder="Enter your email" 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-6">Save Changes</Button>
              </form>
            )
          )}

          <div className="mt-8 border-t pt-6">
             <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
             <p className="text-sm text-gray-600 mb-4">Deleting your account is permanent and cannot be undone.</p>
             <Button onClick={handleDelete} variant="danger">
               Delete My Account
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}