import React from 'react';

export default function SearchAndFilters({ 
  filterAge,
  setFilterAge, 
  filterLocation, 
  setFilterLocation, 
  filterStatus, 
  setFilterStatus,
  onResetFilters
}) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age Bracket</label>
          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Ages</option>
            <option value="Toddler">Toddlers</option>
            <option value="Kid">Kids</option>
            <option value="Youth">Youths</option>
            <option value="Adult">Adults</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Locations</option>
            <option value="Main">Main</option>
            <option value="Cobol">Cobol</option>
            <option value="Malacañang">Malacañang</option>
            <option value="Guest">Guest</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Registered">Checked In</option>
            <option value="PreRegistered">Pending</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={onResetFilters}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
        >
          Reset Filters
        </button>
      </div>
    </>
  );
}