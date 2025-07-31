import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getElectionResults, getElections } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import ResultsChart from '../components/ResultsChart';

export default function ResultsPage() {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both results and the specific election details
        const [resultsRes, electionsRes] = await Promise.all([
          getElectionResults(electionId),
          getElections() // We fetch all to find the title, could be optimized with a dedicated backend route
        ]);
        setResults(resultsRes.data);
        const currentElection = electionsRes.data.find(e => e._id === electionId);
        setElection(currentElection);
      } catch (err) {
        setError('Could not fetch election results. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId]);

  if (loading) return <Spinner />;
  if (error) return <Alert message={error} />;
  if (!election) return <Alert message="Election not found." />;

  const totalVotes = results.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Results for: {election.title}</h1>
      <p className="text-lg text-gray-600 mb-6">Total Votes Cast: {totalVotes}</p>
      
      <ResultsChart data={results} />

      <div className="mt-8 text-center">
        <Link to="/dashboard" className="text-indigo-600 hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );
}