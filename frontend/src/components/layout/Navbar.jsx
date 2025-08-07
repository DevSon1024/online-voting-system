import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/AuthContext';
import VoteChainLogo from '../../assets/logo.svg';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-effect shadow-medium sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 text-2xl font-bold text-gradient hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <img src={VoteChainLogo} alt="VoteChain Logo" className="h-12 w-12 drop-shadow-lg" />
                <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-full animate-pulse"></div>
              </div>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold">
                VoteChain
              </span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to={isAdmin ? "/admin" : "/dashboard"} 
                  className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="gradient-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-indigo-600 font-medium px-3 py-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="gradient-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}