import { useState, useEffect } from 'react';
import { getElections } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AdminPanel from '../components/AdminPanel';
import VoteModal from '../components/VoteModal'; // Re-using for elections

export default function AdminDashboardPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showElectionModal, setShowElectionModal] = useState(false);

  const fetchElectionsData = async () => {
    setLoading(true);
    try {
      const res = await getElections();
      setElections(res.data);
    } catch (err) {
      setError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionsData();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowElectionModal(true)} className="w-auto">Add New Election</Button>
      </div>
      <Alert message={error} />
      <div className="space-y-6">
        {!error && elections.length > 0 ? (
          elections.map(election => (
            <AdminPanel key={election._id} election={election} onDataChange={fetchElectionsData} />
          ))
        ) : (
          !loading && !error && <p className="text-gray-500 text-center mt-8">No elections found. Add one to get started.</p>
        )}
      </div>
      {showElectionModal && (
        <VoteModal
          title="Add New Election"
          onClose={() => setShowElectionModal(false)}
          onSave={fetchElectionsData}
        />
      )}
    </div>
  );
}