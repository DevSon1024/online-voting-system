import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your connection or credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Alert message={error} />
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <Button type="submit">Sign in</Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Not a member?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
}