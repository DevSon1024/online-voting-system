import { useState } from 'react';
import { deleteElection, deleteCandidate, getAdminElectionResults } from '../services/api';
import Button from './common/Button';
import VoteModal from './VoteModal'; // Using VoteModal as a generic modal
import AdminElectionResults from './AdminElectionResults';

export default function AdminPanel({ election, onDataChange }) {
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

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

  const handleViewResults = async () => {
    setLoadingResults(true);
    try {
      const response = await getAdminElectionResults(election._id);
      setResults(response.data);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Error fetching election results. Please try again.');
    } finally {
      setLoadingResults(false);
    }
  };

  const isElectionActive = () => {
    const now = new Date();
    return new Date(election.startDate) <= now && new Date(election.endDate) >= now;
  };
  
  const isElectionEnded = () => new Date() > new Date(election.endDate);
  const isElectionUpcoming = () => new Date() < new Date(election.startDate);

  const getElectionStatus = () => {
    if (isElectionActive()) return { text: 'Active', color: 'bg-green-100 text-green-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
    if (isElectionEnded()) return { text: 'Ended', color: 'bg-gray-100 text-gray-700', icon: 'M5 13l4 4L19 7' };
    return { text: 'Upcoming', color: 'bg-blue-100 text-blue-700', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
  };

  const status = getElectionStatus();

  return (
    <div className="glass-effect rounded-2xl p-6 shadow-medium hover:shadow-large transition-all duration-300 border border-white/20">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-grow">
          <div className="flex items-start gap-3 mb-3">
            <h2 className="text-2xl font-bold text-gray-900 flex-grow">{election.title}</h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={status.icon} />
              </svg>
              {status.text}
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{election.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              <span>{new Date(election.startDate).toLocaleDateString()}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              <span>{new Date(election.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:flex-col sm:w-auto">
          <Button 
            onClick={handleViewResults}
            disabled={loadingResults}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {loadingResults ? 'Loading...' : 'View Results'}
          </Button>
          <Button 
            onClick={() => setShowCandidateModal(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 px-4 rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Candidate
          </Button>
          <Button 
            onClick={handleDeleteElection}
            className="flex-1 sm:flex-none bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>
      
      {/* Candidates Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Candidates ({election.candidates.length})
          </h3>
        </div>
        {election.candidates.length > 0 ? (
          <div className="grid gap-2">
            {election.candidates.map(c => (
              <div key={c._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{c.name}</div>
                    <div className="text-sm text-gray-600">({c.party.name})</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteCandidate(c._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                  title="Remove candidate"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-sm">No candidates added yet</p>
            <p className="text-gray-400 text-xs mt-1">Click "Add Candidate" to get started</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showCandidateModal && (
        <VoteModal
          title="Add Candidate"
          electionId={election._id}
          onClose={() => setShowCandidateModal(false)}
          onSave={onDataChange}
          isCandidateModal={true}
        />
      )}
      
      {showResultsModal && results && (
        <AdminElectionResults
          results={results}
          onClose={() => setShowResultsModal(false)}
        />
      )}
    </div>
  );
}