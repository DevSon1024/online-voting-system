import { useState } from 'react';
import { deleteElection, deleteCandidate } from '../services/api';
import Button from './common/Button';
import VoteModal from './VoteModal'; // Using VoteModal as a generic modal

export default function AdminPanel({ election, onDataChange }) {
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const handleDeleteElection = async () => {
    if (window.confirm('Are you sure? This will delete the election and all related data.')) {
      await deleteElection(election._id);
      onDataChange();
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      await deleteCandidate(id);
      onDataChange();
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{election.title}</h2>
          <p className="text-gray-500 text-sm">{new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <Button onClick={() => setShowCandidateModal(true)} variant="secondary" className="w-auto text-sm !bg-green-500 !text-white hover:!bg-green-600">Add Candidate</Button>
          <Button onClick={handleDeleteElection} variant="danger" className="w-auto text-sm">Delete</Button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Candidates:</h3>
        {election.candidates.length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {election.candidates.map(c => (
              <li key={c._id} className="flex justify-between items-center">
                <span>{c.name} ({c.party})</span>
                <button onClick={() => handleDeleteCandidate(c._id)} className="text-xs text-red-500 hover:underline">Remove</button>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500">No candidates added.</p>}
      </div>
      {showCandidateModal && (
        <VoteModal
          title="Add Candidate"
          electionId={election._id}
          onClose={() => setShowCandidateModal(false)}
          onSave={onDataChange}
          isCandidateModal={true}
        />
      )}
    </div>
  );
}