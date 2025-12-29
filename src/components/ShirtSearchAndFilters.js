import React from 'react';

export default function ShirtSearchAndFilters({ 
  filterAge, 
  setFilterAge, 
  filterLocation, 
  setFilterLocation,
  filterPayment,
  setFilterPayment,
  filterDistribution,
  setFilterDistribution,
  filterShirtSize,
  setFilterShirtSize,
  onResetFilters
}) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Payment</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distribution Status</label>
          <select
            value={filterDistribution}
            onChange={(e) => setFilterDistribution(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Distribution</option>
            <option value="Given">Given</option>
            <option value="Pending">Pending</option>
          </select>
          
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shirt Size</label>
          <select
            value={filterShirtSize}
            onChange={(e) => setFilterShirtSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Sizes</option>
            <option value="#4 (XS) 1-2">#4 (XS) 1-2</option>
            <option value="#6 (S) 3-4">#6 (S) 3-4</option>
            <option value="#8 (M) 5-6">#8 (M) 5-6</option>
            <option value="#10 (L) 7-8">#10 (L) 7-8</option>
            <option value="#12 (XL) 9-10">#12 (XL) 9-10</option>
            <option value="#14 (2XL) 11-12">#14 (2XL) 11-12</option>
            <option value="TS">TS</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="2XL">2XL</option>
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