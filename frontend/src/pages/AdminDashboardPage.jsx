import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getElections, getUserProfile } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AdminPanel from '../components/AdminPanel';
import VoteModal from '../components/VoteModal';
import ManagePartiesModal from '../components/ManagePartiesModal';

export default function AdminDashboardPage() {
  const [elections, setElections] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [electionsRes, profileRes] = await Promise.all([
        getElections(),
        getUserProfile()
      ]);
      setElections(electionsRes.data);
      setAdminProfile(profileRes.data);
    } catch (err) {
      setError('Could not connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdate = () => {
    fetchDashboardData();
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="glass-effect rounded-2xl p-8 shadow-medium">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="gradient-primary rounded-2xl p-3 shadow-soft">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                <p className="text-gray-600">Manage elections, candidates, parties, and users.</p>
                {adminProfile && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="font-semibold">{adminProfile.name} (Admin)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span>{adminProfile.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button onClick={() => setShowElectionModal(true)} className="w-full sm:w-auto">Add Election</Button>
              <Button onClick={() => setShowPartyModal(true)} className="w-full sm:w-auto" variant="secondary">Manage Parties</Button>
              <Link to="/admin/users">
                <Button className="w-full sm:w-auto" variant="secondary">Manage Users</Button>
              </Link>
              <Link to="/profile">
                <Button className="w-full sm:w-auto" variant="ghost">Edit Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Alert message={error} type="error" />
      
      {!error && elections.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Election Management</h2>
            <p className="text-gray-600">Manage your elections, add candidates, and view detailed results</p>
          </div>
          <div className="space-y-6">
            {elections.map(election => (
              <AdminPanel key={election._id} election={election} onDataChange={handleUpdate} />
            ))}
          </div>
        </div>
      ) : (
        !loading && !error && (
          <div className="text-center py-16">
            <div className="glass-effect rounded-2xl p-12 shadow-medium">
               <h3 className="text-2xl font-bold text-gray-900 mb-3">No Elections Created</h3>
               <p className="text-gray-600 max-w-md mx-auto mb-6">Get started by creating your first election.</p>
               <Button onClick={() => setShowElectionModal(true)}>Create First Election</Button>
            </div>
          </div>
        )
      )}
      
      {showPartyModal && <ManagePartiesModal onClose={() => setShowPartyModal(false)} />}
      {showElectionModal && <VoteModal title="Add New Election" onClose={() => setShowElectionModal(false)} onSave={handleUpdate} />}
    </div>
  );
}
