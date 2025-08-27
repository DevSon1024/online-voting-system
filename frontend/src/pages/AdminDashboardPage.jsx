// frontend/src/pages/AdminDashboardPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getElections, getUserProfile, getUnvalidatedUsers } from '../services/api';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import AdminPanel from '../components/AdminPanel';
import VoteModal from '../components/VoteModal';
import ManagePartiesModal from '../components/ManagePartiesModal';
import ValidationNotification from '../components/common/ValidationNotification';

export default function AdminDashboardPage() {
  const [elections, setElections] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const [unvalidatedUsers, setUnvalidatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showElectionModal, setShowElectionModal] = useState(false);
  const [showPartyModal, setShowPartyModal] = useState(false);
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

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
    setLoading(true);
    try {
      const [electionsRes, profileRes, unvalidatedRes] = await Promise.all([
        getElections(),
        getUserProfile(),
        getUnvalidatedUsers(),
      ]);
      setElections(electionsRes.data);
      setAdminProfile(profileRes.data);
      setUnvalidatedUsers(unvalidatedRes.data);
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

  const handleRedirectToValidation = () => {
    navigate('/admin/voters', { state: { activeTab: 'unvalidated' } });
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto">
      <ValidationNotification
        userCount={unvalidatedUsers.length}
        onRedirect={handleRedirectToValidation}
      />
      <div className="mb-8">
        <div className="elevated-card rounded-2xl p-8 shadow-large hover-lift">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
              <div className="flex-shrink-0">
                {adminProfile && adminProfile.photoUrl ? (
                  <img 
                    src={`${API_BASE_URL}${adminProfile.photoUrl}`} 
                    alt="Admin Profile" 
                    className="w-48 h-48 rounded-2xl object-cover shadow-large border-4 border-white/50" 
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-large border-4 border-white/50">
                    <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-grow text-center lg:text-left">
                <h1 className="text-5xl font-bold text-gradient mb-3">Admin Dashboard</h1>
                <p className="text-gray-600 text-lg mb-6">Manage elections, candidates, parties, and users.</p>
                {adminProfile && (
                  <div className="glass-card rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Administrator Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.name}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.email}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{new Date(adminProfile.dob).toLocaleDateString()}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Age</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{calculateAge(adminProfile.dob)} years</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">State</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.state}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-4 hover:bg-white/70 transition-all duration-200">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">City</span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{adminProfile.city}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button 
                onClick={() => setShowElectionModal(true)} 
                variant="primary" 
                size="lg" 
                fullWidth
                className="justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Election
              </Button>
              <Button 
                onClick={() => setShowPartyModal(true)} 
                variant="glass" 
                size="lg" 
                fullWidth
                className="justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Manage Parties
              </Button>
              <Link to="/admin/voters">
                <Button variant="outline" size="lg" fullWidth className="justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Voter Management
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" size="lg" fullWidth className="justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
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