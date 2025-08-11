import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, deleteUserProfile } from '../services/api';
import { useAuth } from '../hooks/AuthContext';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile();
        setUser({ name: res.data.name, email: res.data.email });
      } catch (err) {
        setError('Could not fetch your profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateUserProfile(user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
    }
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
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Alert message={error} type="error" />
            <Alert message={success} type="success" />
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <Input 
                  type="text"
                  name="name"
                  value={user.name} 
                  onChange={handleChange} 
                  placeholder="Enter your full name" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <Input 
                  type="email"
                  name="email"
                  value={user.email} 
                  onChange={handleChange} 
                  placeholder="Enter your email" 
                  required 
                />
              </div>
            </div>
            
            <Button type="submit" className="mt-6">
              Save Changes
            </Button>
          </form>

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
