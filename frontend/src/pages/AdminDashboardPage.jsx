import { useState, useEffect } from 'react';
import { getElections, getUserProfile } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AdminPanel from '../components/AdminPanel';
import VoteModal from '../components/VoteModal'; // Re-using for elections

export default function AdminDashboardPage() {
  const [elections, setElections] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showElectionModal, setShowElectionModal] = useState(false);

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

  const handleElectionUpdate = () => {
    fetchDashboardData();
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
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
                <p className="text-gray-600">Manage elections, candidates, and view detailed results</p>
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
            
            {/* Stats and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{elections.length}</div>
                  <div className="text-sm text-gray-500">Total Elections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {elections.filter(e => new Date(e.endDate) < new Date()).length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
              <Button 
                onClick={() => setShowElectionModal(true)} 
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Election
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert */}
      <Alert message={error} type="error" />
      
      {/* Elections Management */}
      {!error && elections.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Election Management</h2>
            <p className="text-gray-600">Manage your elections, add candidates, and view detailed results</p>
          </div>
          <div className="space-y-6">
            {elections.map(election => (
              <AdminPanel key={election._id} election={election} onDataChange={handleElectionUpdate} />
            ))}
          </div>
        </div>
      ) : (
        !loading && !error && (
          <div className="text-center py-16">
            <div className="glass-effect rounded-2xl p-12 shadow-medium">
              <div className="inline-flex items-center justify-center w-20 h-20 gradient-secondary rounded-full mb-6 shadow-soft">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Elections Created</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">Get started by creating your first election. You can add candidates and manage the voting process.</p>
              <Button 
                onClick={() => setShowElectionModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-medium hover:shadow-large transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Election
              </Button>
            </div>
          </div>
        )
      )}
      
      {/* Election Modal */}
      {showElectionModal && (
        <VoteModal
          title="Add New Election"
          onClose={() => setShowElectionModal(false)}
          onSave={handleElectionUpdate}
        />
      )}
    </div>
  );
}