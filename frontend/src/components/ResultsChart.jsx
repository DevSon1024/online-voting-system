import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

export default function ResultsChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-8">No votes have been cast in this election yet.</p>;
  }

  const totalVotes = data.reduce((sum, item) => sum + item.votes, 0);

  return (
    <div className="grid md:grid-cols-2 gap-8 items-center">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="votes" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => `${value} votes`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-4">
        {data.sort((a, b) => b.votes - a.votes).map((item, index) => (
          <div key={item.candidateId}>
            <div className="flex justify-between text-md font-semibold">
              <span>{item.name} ({item.party})</span>
              <span>{item.votes} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-1">
              <div className="h-4 rounded-full" style={{ width: `${totalVotes > 0 ? (item.votes / totalVotes) * 100 : 0}%`, backgroundColor: COLORS[index % COLORS.length] }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}