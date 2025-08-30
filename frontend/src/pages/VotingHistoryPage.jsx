import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getElections, getUserVotedElections } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';

export default function VotingHistoryPage() {
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [electionsRes, votedRes] = await Promise.all([
          getElections(),
          getUserVotedElections(),
        ]);

        const votedIds = new Set(votedRes.data.map(String));
        const filteredElections = electionsRes.data.filter(election => votedIds.has(election._id));
        setVotedElections(filteredElections);
      } catch (err) {
        setError('Could not fetch your voting history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="elevated-card rounded-2xl p-8 mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Voting History</h1>
        <p className="text-gray-600">A record of all elections you've participated in.</p>
      </div>

      <Alert message={error} type="error" />

      {votedElections.length > 0 ? (
        <div className="space-y-4">
          {votedElections.map(election => (
            <div key={election._id} className="professional-card p-5 flex items-center justify-between hover-lift">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{election.title}</h3>
                <p className="text-sm text-gray-600">Ended on: {new Date(election.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                {election.resultsDeclared ? (
                  <Link to={`/results/${election._id}`}>
                    <Button variant="primary" size="sm">View Results</Button>
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Results Pending</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <div className="glass-effect rounded-2xl p-12 shadow-medium">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Voting History Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">You have not voted in any elections yet. Your voting history will appear here once you participate.</p>
              <Link to="/dashboard" className="mt-4 inline-block">
                <Button>Back to Dashboard</Button>
              </Link>
            </div>
        </div>
      )}
    </div>
  );
}