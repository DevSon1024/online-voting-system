import { useState, useEffect } from 'react';
import { getElections, getUserVotedElections } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import ElectionCard from '../components/ElectionCard';

export default function DashboardPage() {
  const [elections, setElections] = useState([]);
  const [votedElectionIds, setVotedElectionIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      // Use Promise.all to fetch elections and user's vote history concurrently
      const [electionsRes, votedRes] = await Promise.all([
        getElections(),
        getUserVotedElections()
      ]);
      
      setElections(electionsRes.data);
      setVotedElectionIds(new Set(votedRes.data.map(String))); // Store IDs as strings for easy comparison
      
    } catch (err) {
      setError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, []);
  
  // This function will now just refetch all data to get the latest state
  const handleVoteSuccess = () => {
    fetchDashboardData(); 
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Elections Dashboard</h1>
      <Alert message={error} type="error" />
      {!error && elections.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {elections.map(election => (
            <ElectionCard 
              key={election._id} 
              election={election} 
              hasVoted={votedElectionIds.has(election._id)} 
              onVoteSuccess={handleVoteSuccess} 
            />
          ))}
        </div>
      ) : (
        !loading && !error && <p className="text-center text-gray-500 mt-8">No elections are available at the moment.</p>
      )}
    </div>
  );
}