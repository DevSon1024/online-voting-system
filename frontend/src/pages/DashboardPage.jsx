import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { getElections, getUserVotedElections, getUserProfile } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import ElectionCard from '../components/ElectionCard';
import Button from '../components/common/Button'; // Import Button
import Toast from '../components/common/Toast';

export default function DashboardPage() {
  const [elections, setElections] = useState([]);
  const [votedElectionIds, setVotedElectionIds] = useState(new Set());
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchDashboardData = async () => {
    try {
      const [electionsRes, votedRes, profileRes] = await Promise.all([
        getElections(),
        getUserVotedElections(),
        getUserProfile()
      ]);
      
      setElections(electionsRes.data);
      setVotedElectionIds(new Set(votedRes.data.map(String)));
      setUserProfile(profileRes.data);
      
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
  
  const handleVoteSuccess = () => {
    fetchDashboardData();
    showToast('Vote submitted successfully!');
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Elections Dashboard</h1>
                <p className="text-gray-600">Participate in active elections and view your voting history</p>
                {userProfile && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold">{userProfile.name}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                      <span>{userProfile.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
               <Link to="/profile">
                 <Button className="w-full sm:w-auto">
                   Edit Profile
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Alert message={error} type="error" />
      
      {!error && elections.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Available Elections</h2>
            <p className="text-gray-600">Click on any election card to participate or view results</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map(election => (
            <ElectionCard 
              key={election._id} 
              election={election} 
              hasVoted={votedElectionIds.has(election._id)} 
              onVoteSuccess={handleVoteSuccess} 
            />
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
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Elections Available</h3>
              <p className="text-gray-600 max-w-md mx-auto">There are no elections available at the moment. Check back later for new voting opportunities.</p>
            </div>
          </div>
        )
      )}
      <Toast message={toast.message} type={toast.type} onDone={() => setToast({ message: '', type: 'success' })} />
    </div>
  );
}
