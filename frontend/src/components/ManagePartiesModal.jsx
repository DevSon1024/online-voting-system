import { useState, useEffect } from 'react';
import { addParty, getParties, updateParty, deleteParty } from '../services/api';
import Alert from './common/Alert';
import Input from './common/Input';
import Button from './common/Button';

export default function ManagePartiesModal({ onClose }) {
  const [parties, setParties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for the form
  const [formData, setFormData] = useState({ name: '', level: 'Local' });
  const [logoFile, setLogoFile] = useState(null);
  
  // State for editing
  const [editingId, setEditingId] = useState(null);
  
  // State for messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  // Fetch all parties on component mount
  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setIsLoading(true);
      const res = await getParties();
      setParties(res.data);
    } catch (err) {
      setError('Could not fetch parties.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };
  
  const resetForm = () => {
    setFormData({ name: '', level: 'Local' });
    setLogoFile(null);
    setEditingId(null);
    document.getElementById('logo-input').value = ''; // Clear file input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('level', formData.level);
    if (logoFile) {
      formPayload.append('logo', logoFile);
    }

    try {
      if (editingId) {
        // Update existing party
        await updateParty(editingId, formPayload);
        setSuccess(`Party "${formData.name}" updated successfully!`);
      } else {
        // Create new party
        await addParty(formPayload);
        setSuccess(`Party "${formData.name}" added successfully!`);
      }
      resetForm();
      fetchParties(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.msg || `Failed to ${editingId ? 'update' : 'add'} party.`);
    }
  };
  
  const handleEdit = (party) => {
    setEditingId(party._id);
    setFormData({ name: party.name, level: party.level });
    setSuccess('');
    setError('');
  };

  const handleDelete = async (party) => {
    if (window.confirm(`Are you sure you want to delete the party "${party.name}"? This cannot be undone.`)) {
      try {
        await deleteParty(party._id);
        setSuccess(`Party "${party.name}" deleted.`);
        fetchParties(); // Refresh the list
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to delete party.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Manage Parties</h2>
        
        {/* Form for Add/Edit */}
        <form onSubmit={handleSubmit} className="space-y-4 border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold">{editingId ? 'Edit Party' : 'Add New Party'}</h3>
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="name" placeholder="Party Name" value={formData.name} onChange={handleInputChange} required />
            <select name="level" value={formData.level} onChange={handleInputChange} required className="w-full px-4 py-3 bg-white/80 border-2 border-gray-200 rounded-xl">
              <option value="Local">Local</option>
              <option value="National">National</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Party Logo</label>
            <input type="file" id="logo-input" name="logo" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>

          <div className="flex justify-end space-x-4">
            {editingId && <Button onClick={resetForm} type="button" variant="secondary" className="w-auto">Cancel Edit</Button>}
            <Button type="submit" className="w-auto">{editingId ? 'Update Party' : 'Add Party'}</Button>
          </div>
        </form>

        {/* List of Existing Parties */}
        <div className="flex-grow overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Existing Parties</h3>
          {isLoading ? <p>Loading parties...</p> : (
            <div className="space-y-2">
              {parties.map(party => (
                <div key={party._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    {party.logoUrl && <img src={`${API_BASE_URL}${party.logoUrl}`} alt={party.name} className="w-10 h-10 rounded-md object-contain" />}
                    <div>
                      <p className="font-semibold">{party.name}</p>
                      <p className="text-sm text-gray-500">{party.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleEdit(party)} variant="ghost" className="w-auto px-3 py-1 text-sm">Edit</Button>
                    <Button onClick={() => handleDelete(party)} variant="danger" className="w-auto px-3 py-1 text-sm">Delete</Button>
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