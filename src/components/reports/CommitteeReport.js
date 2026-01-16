import React from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import { Clock, TrendingUp, Users, Award } from 'lucide-react';
import VolunteerActivityChart from './VolunteerActivityChart';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-700">
            {entry.name}: <span className="font-semibold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function CommitteeReport({ data, volunteerData, selectedDate, onDateChange }) {
  const { hourlyData, peakHour, totalRegistrations } = data;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#001740] mb-2">Committee Report</h2>
        <p className="text-sm text-gray-600">
          Check-in timeline, peak hours, and volunteer activity metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Hour</p>
              <p className="text-2xl font-bold text-gray-900">{peakHour.hour || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Peak Count</p>
              <p className="text-2xl font-bold text-gray-900">{peakHour.count || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Volunteers</p>
              <p className="text-2xl font-bold text-gray-900">{volunteerData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Check-in Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold text-[#001740]">Check-in Timeline</h3>
            <p className="text-xs text-gray-500 mt-1">Hour-by-hour registration activity</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {hourlyData.length > 0 && totalRegistrations > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="colorCheckedIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="checkedIn"
                name="Check-ins"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCheckedIn)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No registrations on this date
          </div>
        )}

        {/* Hourly Breakdown Table */}
        {totalRegistrations > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Hour</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Check-ins</th>
                  <th className="text-right py-2 font-semibold text-gray-700">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {hourlyData.filter(h => h.checkedIn > 0).map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      {item.time === peakHour.hour && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Peak</span>
                      )}
                      {item.time}
                    </td>
                    <td className="text-right py-2 font-medium">{item.checkedIn}</td>
                    <td className="text-right py-2 text-gray-500">
                      {totalRegistrations > 0
                        ? ((item.checkedIn / totalRegistrations) * 100).toFixed(1)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Volunteer Activity Section */}
      <VolunteerActivityChart data={volunteerData} />
    </div>
  );
}
