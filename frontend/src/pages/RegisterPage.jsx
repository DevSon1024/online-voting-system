import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    try {
      await register({ name, email, password });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Alert message={error} />
          <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <Button type="submit">Register</Button>
        </form>
         <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}