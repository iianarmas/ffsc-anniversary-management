import React from 'react';
import Header from './Header';
import StatCard from './StatCard';
import { Users, CheckCircle, Clock, DollarSign, Package, BarChart3 } from 'lucide-react';

export default function Dashboard({ people = [], stats = {}, searchTerm, setSearchTerm }) {
  return (
    <>
      <Header viewTitle="Dashboard" searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchPlaceholder="Search dashboard..." />
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of registration and shirt metrics</p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-sm text-gray-500">
            <BarChart3 />
            <span>Updated automatically</span>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total People" value={stats.total || people.length} Icon={Users} variant="expanded" ariaLabel={`Total people ${stats.total || people.length}`} />
          <StatCard title="Checked In" value={stats.registered || 0} Icon={CheckCircle} variant="expanded" ariaLabel={`Checked in ${stats.registered || 0} people`} />
          <StatCard title="Pending Check-in" value={stats.preRegistered || 0} Icon={Clock} variant="expanded" ariaLabel={`Pending check-in ${stats.preRegistered || 0} people`} />
          <StatCard title="Paid" value={stats.paid || 0} Icon={DollarSign} variant="expanded" ariaLabel={`Paid ${stats.paid || 0} people`} />
          <StatCard title="Unpaid" value={stats.unpaid || 0} Icon={DollarSign} variant="expanded" ariaLabel={`Unpaid ${stats.unpaid || 0} people`} />
          <StatCard title="Shirts Given" value={stats.shirtsGiven || 0} Icon={Package} variant="expanded" ariaLabel={`Shirts given ${stats.shirtsGiven || 0} people`} />
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700">Attendance trend (placeholder)</h3>
          <div className="mt-4 h-32 bg-gradient-to-r from-gray-100 to-gray-50 rounded-md flex items-center justify-center text-gray-400">
            <span>Mini chart / sparkline goes here</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">This area can be replaced with a lightweight chart (e.g., SVG sparkline or static image).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700">Recent Registrations</h3>
          <div className="mt-3 text-sm text-gray-600">
            {people.slice(0,5).length === 0 ? (
              <div className="text-gray-400">No registrations yet</div>
            ) : (
              <ul className="space-y-2">
                {people.slice(0,5).map(p => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div className="text-gray-900">{p.firstName} {p.lastName}</div>
                    <div className="text-xs text-gray-500">{p.registered ? 'Checked In' : 'Pending'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700">Quick Actions</h3>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <button className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">View registration list</button>
            <button className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">View shirt distribution</button>
            <button className="w-full text-left px-3 py-2 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">Export CSV</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
