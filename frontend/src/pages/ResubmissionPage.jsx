import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resubmitUser } from '../services/api';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import AutocompleteInput from '../components/common/AutocompleteInput';
import statesData from '../data/indian-states-cities.json';

export default function ResubmissionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: initialEmail, reason } = location.state || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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
    if (password && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) {
        formData.append('password', password);
    }
    formData.append('state', state);
    formData.append('city', city);
    formData.append('dob', dob);
    if (photo) {
        formData.append('photo', photo);
    }

    try {
      const res = await resubmitUser(formData);
      setSuccess(res.data.msg);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Resubmission failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="glass-effect rounded-3xl p-8 shadow-large">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Resubmit Application</h2>
            <p className="text-gray-600">Please correct your information and resubmit.</p>
            {reason && <Alert message={`Rejection Reason: ${reason.split("Reason: ")[1]}`} type="warning" />}
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Alert message={error} />
            <Alert message={success} type="success" />
            <div className="space-y-4">
              <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" required disabled/>
              <AutocompleteInput name="state" placeholder="State" value={state} items={states} onSelect={(value) => setState(value)} required />
              <AutocompleteInput name="city" placeholder="City" value={city} items={cities} onSelect={(value) => setCity(value)} required />
              <Input type="date" value={dob} onChange={e => setDob(e.target.value)} required />
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password (optional)" isPasswordVisible={isPasswordVisible} onToggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)} />
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" isPasswordVisible={isConfirmPasswordVisible} onToggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Passport Size Photo (Optional)
                </label>
                <input type="file" onChange={e => setPhoto(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
              </div>
            </div>
            <Button type="submit" className="mt-6">Resubmit</Button>
          </form>
        </div>
      </div>
    </div>
  );
}