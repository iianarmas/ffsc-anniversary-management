import React from 'react';
import { Shirt } from 'lucide-react';

export default function Header({ currentView, setCurrentView, stats, handleStatCardClick }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">FFSC Anniversary Management</h1>
      <p className="text-gray-600">Registration Management</p>
      
      <div className="flex gap-2 mt-6 mb-6 border-b border-gray-200">
        <button
          onClick={() => setCurrentView('registration')}
          className={`px-4 py-2 font-medium transition ${
            currentView === 'registration' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Registration
        </button>
        <button
          onClick={() => setCurrentView('shirts')}
          className={`px-4 py-2 font-medium transition flex items-center gap-2 ${
            currentView === 'shirts' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Shirt size={18} />
          Shirt Management
        </button>
      </div>
      
      {/* Only show stat cards in Registration view */}
      {currentView === 'registration' && (
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleStatCardClick('total')}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition text-left cursor-pointer"
          >
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Pre-registered</div>
          </button>
          <button
            onClick={() => handleStatCardClick('registered')}
            className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition text-left cursor-pointer"
          >
            <div className="text-2xl font-bold text-green-700">{stats.registered}</div>
            <div className="text-sm text-green-600">Checked In</div>
          </button>
          <button
            onClick={() => handleStatCardClick('preRegistered')}
            className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:bg-orange-100 transition text-left cursor-pointer"
          >
            <div className="text-2xl font-bold text-orange-700">{stats.preRegistered}</div>
            <div className="text-sm text-orange-600">Pending Check-in</div>
          </button>
        </div>
      )}
    </div>
  );
}