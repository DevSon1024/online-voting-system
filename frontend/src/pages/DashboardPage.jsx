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
  const API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
        <div className="elevated-card rounded-2xl p-8 shadow-large hover-lift">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <div className="flex-shrink-0">
                {userProfile && userProfile.photoUrl ? (
                  <img 
                    src={`${API_BASE_URL}${userProfile.photoUrl}`} 
                    alt="Profile" 
                    className="w-48 h-48 rounded-2xl object-cover shadow-large border-4 border-white/50" 
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-large border-4 border-white/50">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-grow text-center lg:text-left">
                <h1 className="text-5xl font-bold text-gradient mb-3">Elections Dashboard</h1>
                <p className="text-gray-600 text-lg mb-6">Participate in active elections and view your voting history</p>
                {userProfile && (
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Voter Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{userProfile.name}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{userProfile.email}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{new Date(userProfile.dob).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Age</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{calculateAge(userProfile.dob)} years</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">State</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{userProfile.state}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">City</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{userProfile.city}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
               <Link to="/profile">
                 <Button variant="primary" size="lg" fullWidth className="justify-center">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                   Edit Profile
                 </Button>
               </Link>
               <Button variant="glass" size="lg" fullWidth className="justify-center">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 </svg>
                 Voting History
               </Button>
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