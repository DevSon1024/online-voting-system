import { useState } from 'react';
import { addElection, addCandidate } from '../services/api';
import Alert from './common/Alert';
import Input from './common/Input';
import Button from './common/Button';

// This is a generic modal for forms.
export default function VoteModal({ title, onClose, onSave, electionId = null, isCandidateModal = false }) {
  const [formData, setFormData] = useState(
    isCandidateModal ? { name: '', party: '', electionId } : { title: '', description: '', startDate: '', endDate: '' }
  );
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isCandidateModal) {
        await addCandidate(formData);
      } else {
        await addElection(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert message={error} />
          {isCandidateModal ? (
            <>
              <Input name="name" placeholder="Candidate Name" value={formData.name} onChange={handleChange} required />
              <Input name="party" placeholder="Candidate Party" value={formData.party} onChange={handleChange} required />
            </>
          ) : (
            <>
              <Input name="title" placeholder="Election Title" value={formData.title} onChange={handleChange} required />
              <Input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
              </div>
            </>
          )}
          <div className="flex justify-end space-x-4 pt-4">
            <Button onClick={onClose} type="button" variant="secondary" className="w-auto">Cancel</Button>
            <Button type="submit" className="w-auto">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}