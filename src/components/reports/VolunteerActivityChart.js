import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Award, Medal, Trophy } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
        <p className="text-sm text-gray-700">
          Registrations: <span className="font-semibold">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function VolunteerActivityChart({ data }) {
  // Get top 3 volunteers
  const topVolunteers = data.slice(0, 3);
  const totalRegistrations = data.reduce((sum, v) => sum + v.count, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-semibold text-[#001740]">Volunteer Activity</h3>
          <p className="text-xs text-gray-500 mt-1">Registrations processed by each committee member</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{totalRegistrations}</span> registrations
        </div>
      </div>

      {/* Top Performers */}
      {topVolunteers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {topVolunteers.map((volunteer, index) => {
            const icons = [Trophy, Medal, Award];
            const colors = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
            const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-amber-50'];
            const borderColors = ['border-yellow-200', 'border-gray-200', 'border-amber-200'];
            const Icon = icons[index];

            return (
              <div
                key={volunteer.userId}
                className={`${bgColors[index]} border ${borderColors[index]} rounded-lg p-4 text-center`}
              >
                <div className="flex justify-center mb-2">
                  <Icon size={24} className={colors[index]} />
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{volunteer.name}</p>
                <p className="text-2xl font-bold text-gray-900">{volunteer.count}</p>
                <p className="text-xs text-gray-500">registrations</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Bar Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Registrations" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-gray-500">
          No volunteer activity recorded
        </div>
      )}

      {/* Detailed Table */}
      {data.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-semibold text-gray-700">Rank</th>
                <th className="text-left py-2 font-semibold text-gray-700">Volunteer</th>
                <th className="text-right py-2 font-semibold text-gray-700">Registrations</th>
                <th className="text-right py-2 font-semibold text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((volunteer, index) => (
                <tr key={volunteer.userId} className="border-b border-gray-100 last:border-0">
                  <td className="py-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-2 font-medium">{volunteer.name}</td>
                  <td className="text-right py-2">{volunteer.count}</td>
                  <td className="text-right py-2 text-gray-500">
                    {totalRegistrations > 0
                      ? ((volunteer.count / totalRegistrations) * 100).toFixed(1)
                      : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
