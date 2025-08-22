// frontend/src/components/ElectionCard.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { castVote, getUserVoteDetails } from '../services/api';
import Alert from './common/Alert';
import Button from './common/Button';

export default function ElectionCard({ election, hasVoted, onVoteSuccess }) {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [error, setError] = useState('');
  const [voteDetails, setVoteDetails] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', ''); // Get base URL like http://localhost:5000


  const isElectionActive = () => {
    const now = new Date();
    return new Date(election.startDate) <= now && new Date(election.endDate) >= now;
  };
  
  const isVotingEnded = () => new Date() > new Date(election.endDate);

  // Fetch vote details if user has voted
  useEffect(() => {
    const fetchVoteDetails = async () => {
      if (hasVoted) {
        try {
          const response = await getUserVoteDetails(election._id);
          setVoteDetails(response.data);
        } catch (err) {
          console.error('Error fetching vote details:', err);
        }
      }
    };
    fetchVoteDetails();
  }, [hasVoted, election._id]);

  const handleSubmitVote = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedCandidate) {
      setError('Please select a candidate before casting your vote.');
      return;
    }
    try {
      await castVote(election._id, selectedCandidate);
      onVoteSuccess(); // This will trigger a refetch in DashboardPage
      // And now, you can also show a toast from the parent.
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while voting.');
    }
  };

  // If the user has already voted in this election
  if (hasVoted) {
    return (
      <div className="glass-effect rounded-2xl p-6 shadow-medium hover:shadow-large transition-all duration-300 flex flex-col h-full border border-white/20">
        <div className="flex items-start justify-between mb-4">

          <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Voted
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold">{election.city}, {election.state}</span>
        </div>
        
        <div className="flex-grow flex flex-col items-center justify-center my-6">
          <div className="gradient-success rounded-full p-6 mb-4 shadow-medium">
            <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 text-center mb-2">Your vote has been recorded</p>
          <p className="text-sm text-gray-600 text-center mb-4">Thank you for participating in this election</p>
          
          {/* Show frozen vote details */}
          {voteDetails && (
            <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Your Vote (Frozen)</span>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-xs font-semibold">LOCKED</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="font-semibold text-gray-900">{voteDetails.candidateName}</div>
                <div className="text-sm text-gray-600">({voteDetails.candidateParty})</div>
                <div className="text-xs text-gray-500 mt-1">
                  Voted on {new Date(voteDetails.votedAt).toLocaleDateString()} at {new Date(voteDetails.votedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {election.resultsDeclared ? (
            <Link 
              to={`/results/${election._id}`} 
              className="w-full text-center bg-white/80 backdrop-blur-sm text-gray-700 font-semibold py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:shadow-medium hover:scale-105 transition-all duration-200"
            >
              View Results
            </Link>
          ) : (
            <div className="text-center text-gray-600 font-semibold py-3 px-4">
              Election result will be declared soon.
            </div>
          )}
      </div>
    );
  }

  // If the user has NOT voted yet
  return (
    <div className="glass-effect rounded-2xl p-6 shadow-medium hover:shadow-large transition-all duration-300 flex flex-col h-full border border-white/20">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900">{election.title}</h3>
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isElectionActive() ? 'Active' : isVotingEnded() ? 'Ended' : 'Upcoming'}
          </div>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{election.description}</p>
         <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="font-semibold">{election.city}, {election.state}</span>
        </div>
      </div>
      
      {isElectionActive() ? (
        <form onSubmit={handleSubmitVote} className="flex-grow flex flex-col">
          <Alert message={error} type="error" />
          
          <div className="flex-grow">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Select your candidate:</h4>
            <div className="space-y-3 mb-6">
              {election.candidates.length > 0 ? election.candidates.map(candidate => (
                <label 
                  key={candidate._id} 
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                    selectedCandidate === candidate._id 
                      ? 'bg-indigo-50 border-indigo-300 shadow-soft' 
                      : 'bg-white/60 border-gray-200 hover:border-gray-300 hover:bg-white/80'
                  }`}
                >
                  <input 
                    type="radio" 
                    name={`election-${election._id}`} 
                    value={candidate._id} 
                    checked={selectedCandidate === candidate._id} 
                    onChange={() => setSelectedCandidate(candidate._id)} 
                    className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 focus:ring-2"
                  />

                  {/* Logo and Candidate Info */}
                  <div className="ml-4 flex-grow flex items-center gap-4">
                    {candidate.party.logoUrl && (
                      <img 
                        src={`${API_BASE_URL}${candidate.party.logoUrl}`} 
                        alt={`${candidate.party.name} logo`}
                        className="w-10 h-10 object-contain rounded-md"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{candidate.name}</div>
                      <div className="text-sm text-gray-600">({candidate.party.name})</div>
                    </div>
                  </div>
                  
                  {selectedCandidate === candidate._id && (
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              )) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm text-gray-500">No candidates have been added yet</p>
                </div>
              )}
            </div>
          </div>
          
          <Button type="submit" variant="primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cast Your Vote
          </Button>
        </form>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-white/40 backdrop-blur-sm rounded-xl border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-secondary rounded-full mb-4 shadow-soft">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-800 mb-2">
            {isVotingEnded() ? 'Voting has ended' : `Voting starts on ${new Date(election.startDate).toLocaleDateString()}`}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            {isVotingEnded() ? 'Check out the final results below' : 'Come back when voting begins'}
          </p>
          {isVotingEnded() && election.resultsDeclared ? (
            <Link 
              to={`/results/${election._id}`} 
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-semibold transition-colors duration-200"
            >
              View Final Results
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ) : isVotingEnded() && !election.resultsDeclared ? (
            <div className="text-center text-gray-600 font-semibold">
              Election result will be declared soon.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}