import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="text-center py-16 px-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Secure, Transparent, and Reliable Online Voting</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Cast your vote from anywhere. Our platform ensures the integrity and privacy of every ballot.</p>
      <div className="mt-8">
        <Link to="/register" className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300">Get Started</Link>
      </div>
    </div>
  );
}