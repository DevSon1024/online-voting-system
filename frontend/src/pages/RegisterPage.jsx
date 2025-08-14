import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AutocompleteInput from '../components/common/AutocompleteInput';
import statesData from '../data/indian-states-cities.json';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

    useEffect(() => {
    setStates(statesData.states.map(s => s.name));
  }, []);

  useEffect(() => {
    if (state) {
      const selectedState = statesData.states.find(s => s.name === state);
      setCities(selectedState ? selectedState.cities : []);
    } else {
      setCities([]);
    }
  }, [state]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('state', state);
    formData.append('city', city);
    formData.append('dob', dob);
    if (photo) {
        formData.append('photo', photo);
    }

    try {
      await register(formData);
      setSuccess('Registration successful! Please wait for an administrator to validate your account.');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="glass-effect rounded-3xl p-8 shadow-large">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Join VoteChain</h2>
            <p className="text-gray-600">Create your account to start participating in elections</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Alert message={error} />
            <Alert message={success} type="success" />
            <div className="space-y-4">
              <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required />
              <AutocompleteInput name="state" placeholder="State" value={state} items={states} onSelect={(value) => setState(value)} required />
              <AutocompleteInput name="city" placeholder="City" value={city} items={cities} onSelect={(value) => setCity(value)} required />
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a secure password" required isPasswordVisible={isPasswordVisible} onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} />
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required isPasswordVisible={isConfirmPasswordVisible} onToggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passport Size Photo (Optional)
                </label>
                <input type="file" onChange={e => setPhoto(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
              </div>
            </div>
            <Button type="submit" className="mt-6">Create Account</Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-gray-500">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}