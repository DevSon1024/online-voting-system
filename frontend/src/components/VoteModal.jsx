import { useState, useEffect } from 'react';
import { addElection, addCandidate, getParties } from '../services/api'; // Import getParties
import Alert from './common/Alert';
import Input from './common/Input';
import Button from './common/Button';

// Election types based on level
const electionTypesByLevel = {
  "National Level": ["Lok Sabha (General Elections)", "Rajya Sabha"],
  "State Level": ["Vidhan Sabha (State Legislative Assembly)", "Vidhan Parishad"],
  "Local Level": ["Municipal Elections (Urban)", "Panchayat Elections (Rural)"],
  "Other Elections": ["Presidential Election", "Vice Presidential Election", "By-Elections"]
};

export default function VoteModal({ title, onClose, onSave, electionId = null, isCandidateModal = false }) {
  const [formData, setFormData] = useState(
    isCandidateModal
      ? { name: '', partyId: '', electionId }
      : { title: '', description: '', electionLevel: '', electionType: '', state: '', city: '', startDate: '', endDate: '' }
  );
  const [error, setError] = useState('');
  const [parties, setParties] = useState([]); // State for parties

  useEffect(() => {
    if (isCandidateModal) {
      const fetchParties = async () => {
        try {
          const res = await getParties();
          setParties(res.data);
        } catch (err) {
          console.error("Failed to fetch parties:", err);
        }
      };
      fetchParties();
    }
  }, [isCandidateModal]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      // Reset electionType if electionLevel changes
      if (name === 'electionLevel') {
        newState.electionType = '';
      }
      return newState;
    });
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
              {/* Party Dropdown */}
              <select name="partyId" value={formData.partyId} onChange={handleChange} required className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl">
                <option value="" disabled>Select a Party</option>
                {parties.map(party => (
                  <option key={party._id} value={party._id}>{party.name} ({party.level})</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <Input name="title" placeholder="Election Title" value={formData.title} onChange={handleChange} required />
              <Input name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
              {/* Election Level Dropdown */}
              <select name="electionLevel" value={formData.electionLevel} onChange={handleChange} required className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl">
                <option value="" disabled>Select Election Level</option>
                {Object.keys(electionTypesByLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {/* Election Type Dropdown (conditional) */}
              {formData.electionLevel && (
                <select name="electionType" value={formData.electionType} onChange={handleChange} required className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl">
                  <option value="" disabled>Select Election Type</option>
                  {electionTypesByLevel[formData.electionLevel].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              )}
               {/* Location Inputs */}
              <Input name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
              <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} required />

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