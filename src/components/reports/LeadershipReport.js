import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AGE_COLORS = {
  Adult: '#3b82f6',
  Youth: '#10b981',
  Kid: '#f59e0b',
  Toddler: '#ec4899',
  Unknown: '#94a3b8'
};

const LOCATION_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{data.name || data.payload.name}</p>
        <p className="text-sm text-gray-700">
          Count: <span className="font-semibold">{data.value}</span>
        </p>
        {data.payload.percentage && (
          <p className="text-sm text-gray-500">
            {data.payload.percentage}% of total
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function LeadershipReport({ data, stats }) {
  const { ageBrackets, genderBreakdown, locationBreakdown, attendanceType, totalPeople } = data;

  // Add percentage to age brackets
  const ageBracketsWithPercentage = ageBrackets.map(item => ({
    ...item,
    percentage: totalPeople > 0 ? ((item.value / totalPeople) * 100).toFixed(1) : 0
  }));

  // Format gender data for bar chart
  const genderChartData = genderBreakdown.map(item => ({
    name: item.gender,
    registered: item.registered,
    pending: item.preRegistered,
    total: item.total
  }));

  // Format location data for chart
  const locationChartData = locationBreakdown.map((item, index) => ({
    name: item.location,
    registered: item.registered,
    pending: item.preRegistered,
    total: item.total,
    color: LOCATION_COLORS[index % LOCATION_COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#001740] mb-2">Leadership Report</h2>
        <p className="text-sm text-gray-600">
          Demographics, attendance patterns, and location distribution for church leadership
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Registered</p>
          <p className="text-2xl font-bold text-gray-900">{totalPeople}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600">Attending Event</p>
          <p className="text-2xl font-bold text-blue-600">{attendanceType.attending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600">Shirt Only</p>
          <p className="text-2xl font-bold text-purple-600">{attendanceType.shirtOnly}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <p className="text-sm text-gray-600">Capacity Used</p>
          <p className="text-2xl font-bold text-green-600">{stats.capacityPercentage}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Age Distribution</h3>
          {ageBracketsWithPercentage.filter(b => b.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={ageBracketsWithPercentage.filter(b => b.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  labelLine={true}
                >
                  {ageBracketsWithPercentage.filter(b => b.value > 0).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={AGE_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {ageBracketsWithPercentage.filter(b => b.value > 0).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: AGE_COLORS[item.name] || '#94a3b8' }}
                />
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gender & Attendance Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Gender & Attendance Status</h3>
          {genderChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genderChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registered" name="Checked In" fill="#10b981" stackId="a" />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Location Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#001740] mb-4">Location Distribution</h3>
        {locationChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="registered" name="Checked In" fill="#10b981" stackId="a" />
              <Bar dataKey="pending" name="Pending" fill="#f59e0b" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Bracket Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Age Bracket Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Age Bracket</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Count</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {ageBracketsWithPercentage.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: AGE_COLORS[item.name] || '#94a3b8' }}
                      />
                      {item.name}
                    </td>
                    <td className="text-right py-2 font-medium">{item.value}</td>
                    <td className="text-right py-2 text-gray-500">{item.percentage}%</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-200 font-semibold">
                  <td className="py-2">Total</td>
                  <td className="text-right py-2">{totalPeople}</td>
                  <td className="text-right py-2">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Location Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Location Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">Location</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Total</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Checked In</th>
                  <th className="text-right py-2 font-semibold text-gray-700">Pending</th>
                </tr>
              </thead>
              <tbody>
                {locationBreakdown.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-2">{item.location}</td>
                    <td className="text-right py-2 font-medium">{item.total}</td>
                    <td className="text-right py-2 text-green-600">{item.registered}</td>
                    <td className="text-right py-2 text-yellow-600">{item.preRegistered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
