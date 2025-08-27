import { useState, useEffect } from 'react';
import { registerUser } from '../services/api';
import Alert from './common/Alert';
import Input from './common/Input';
import Button from './common/Button';
import AutocompleteInput from './common/AutocompleteInput';
import statesData from '../data/indian-states-cities.json';

export default function AddVoterModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    state: '',
    dob: '',
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    setStates(statesData.states.map(s => s.name));
  }, []);

  useEffect(() => {
    if (formData.state) {
      const selectedState = statesData.states.find(s => s.name === formData.state);
      setCities(selectedState ? selectedState.cities : []);
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAutocompleteSelect = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const formPayload = new FormData();
    for (const key in formData) {
      formPayload.append(key, formData[key]);
    }
    if (photo) {
      formPayload.append('photo', photo);
    }

    try {
      await registerUser(formPayload);
      setSuccess(`Voter "${formData.name}" added successfully!`);
      onSave();
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add voter.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Voter</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert message={error} type="error" />
          <Alert message={success} type="success" />
          <Input name="name" placeholder="Voter Name" value={formData.name} onChange={handleInputChange} required />
          <Input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
          <Input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
          <AutocompleteInput name="state" placeholder="State" value={formData.state} items={states} onSelect={(value) => handleAutocompleteSelect('state', value)} required />
          <AutocompleteInput name="city" placeholder="City" value={formData.city} items={cities} onSelect={(value) => handleAutocompleteSelect('city', value)} required />
          <Input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleInputChange} required />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voter Photo (Optional)
            </label>
            <input type="file" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <Button onClick={onClose} type="button" variant="secondary" className="w-auto">Cancel</Button>
            <Button type="submit" className="w-auto">Add Voter</Button>
          </div>
        </form>
      </div>
    </div>
  );
}