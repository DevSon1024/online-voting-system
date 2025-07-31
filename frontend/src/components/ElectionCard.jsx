import { useState } from 'react';
import { Link } from 'react-router-dom';
import { castVote } from '../services/api';
import Alert from './common/Alert';
import Button from './common/Button';

export default function ElectionCard({ election, hasVoted, onVoteSuccess }) {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');

  const isElectionActive = () => {
    const now = new Date();
    return new Date(election.startDate) <= now && new Date(election.endDate) >= now;
  };
  
  const isVotingEnded = () => new Date() > new Date(election.endDate);

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCandidate) {
      setError('Please select a candidate before casting your vote.');
      return;
    }
    try {
      await castVote(election._id, selectedCandidate);
      onVoteSuccess(); // Trigger refetch in the parent component
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while voting.');
    }
  };

  // If the user has already voted in this election
  if (hasVoted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
        <h3 className="text-xl font-bold">{election.title}</h3>
        <div className="flex-grow flex flex-col items-center justify-center my-4">
            <div className="bg-green-100 text-green-800 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <p className="font-semibold text-green-800">Your vote has been recorded.</p>
        </div>
        <Link to={`/results/${election._id}`} className="w-full text-center bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-300">View Results</Link>
      </div>
    );
  }

  // If the user has NOT voted yet
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <h3 className="text-xl font-bold">{election.title}</h3>
      <p className="text-gray-600 mb-4 flex-grow">{election.description}</p>
      
      {isElectionActive() ? (
        <form onSubmit={handleSubmitVote}>
          <Alert message={error} type="error" />
          <div className="space-y-2 mb-4">
            {election.candidates.length > 0 ? election.candidates.map(candidate => (
              <label key={candidate._id} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                <input type="radio" name={`election-${election._id}`} value={candidate._id} checked={selectedCandidate === candidate._id} onChange={() => setSelectedCandidate(candidate._id)} className="form-radio h-5 w-5 text-indigo-600"/>
                <span className="ml-3 text-gray-700">{candidate.name} <span className="text-sm text-gray-500">({candidate.party})</span></span>
              </label>
            )) : <p className="text-sm text-gray-500">No candidates have been added to this election yet.</p>}
          </div>
          <Button type="submit">Cast Your Vote</Button>
        </form>
      ) : (
        <div className="text-center p-4 bg-gray-100 rounded-md mt-auto">
          <p className="font-semibold text-gray-700">
            {isVotingEnded() ? 'Voting has ended.' : `Voting starts on ${new Date(election.startDate).toLocaleDateString()}`}
          </p>
          {isVotingEnded() && (
            <Link to={`/results/${election._id}`} className="mt-2 inline-block text-indigo-600 hover:underline">View Final Results</Link>
          )}
        </div>
      )}
    </div>
  );
}