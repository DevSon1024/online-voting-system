import { useState, useEffect } from 'react';
import { getAllUsers, adminDeleteUser, registerUser } from '../services/api';
import Alert from './common/Alert';
import Input from './common/Input';
import Button from './common/Button';

export default function ManageVotersModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', city: '', state: '', dob: '' });
  
  const [editingId, setEditingId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Could not fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', city: '', state: '', dob: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('email', formData.email);
    formPayload.append('password', formData.password);
    formPayload.append('city', formData.city);
    formPayload.append('state', formData.state);
    formPayload.append('dob', formData.dob);

    try {
      if (editingId) {
        // Update existing user (API endpoint for updating user needs to be created)
        // await updateUser(editingId, formPayload);
        // setSuccess(`User "${formData.name}" updated successfully!`);
      } else {
        // Create new user
        await registerUser(formPayload);
        setSuccess(`User "${formData.name}" added successfully!`);
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${editingId ? 'update' : 'add'} user.`);
    }
  };
  
  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete the user "${user.name}"? This cannot be undone.`)) {
      try {
        await adminDeleteUser(user._id);
        setSuccess(`User "${user.name}" deleted.`);
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Manage Voters</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Voter' : 'Add New Voter'}</h3>
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" placeholder="Voter Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            <Input name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
            <Input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} required />
            <Input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} required />
            <Input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} required />
          </div>

          <div className="flex justify-end space-x-4">
            {editingId && <Button onClick={resetForm} type="button" variant="secondary" className="w-auto">Cancel Edit</Button>}
            <Button type="submit" className="w-auto">{editingId ? 'Update Voter' : 'Add Voter'}</Button>
          </div>
        </form>

        <div className="flex-grow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Existing Voters</h3>
          {isLoading ? <p>Loading voters...</p> : (
            <div className="space-y-2">
              {users.map(user => (
                <div key={user._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleDelete(user)} variant="danger" className="w-auto px-3 py-1 text-sm">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}