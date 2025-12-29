import React, { useState, useEffect } from 'react';
import ShirtSearchAndFilters from './ShirtSearchAndFilters';
import { ChevronUp, Search } from 'lucide-react';

export default function ShirtManagementView({ 
  people, 
  stats, 
  updateShirtSize, 
  toggleShirtPayment, 
  toggleShirtGiven,
  shirtSearchTerm,
  setShirtSearchTerm,
  shirtFilterAge,
  setShirtFilterAge,
  shirtFilterLocation,
  setShirtFilterLocation,
  shirtFilterPayment,
  setShirtFilterPayment,
  shirtFilterDistribution,
  setShirtFilterDistribution,
  shirtFilterSize,
  setShirtFilterSize,
  onResetFilters
}) {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
        {/* Non-sticky Title, Counter, Stats, and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Anniversary Shirt Management</h2>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-6 py-3">
              <span className="text-2xl font-bold text-blue-700">{people.length}</span>
              <span className="text-sm text-blue-600 ml-2">{people.length === 1 ? 'Person' : 'People'}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={shirtSearchTerm}
              onChange={(e) => setShirtSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-xl font-bold text-blue-700">{stats.paid}</div>
              <div className="text-sm text-blue-600">Paid</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-xl font-bold text-red-700">{stats.unpaid}</div>
              <div className="text-sm text-red-600">Unpaid</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-xl font-bold text-green-700">{stats.shirtsGiven}</div>
              <div className="text-sm text-green-600">Shirts Given</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-xl font-bold text-orange-700">{stats.shirtsPending}</div>
              <div className="text-sm text-orange-600">Pending Distribution</div>
            </div>
          </div>
        </div>

        {/* Sticky Section - Filters Only */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100 pb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ShirtSearchAndFilters
              filterAge={shirtFilterAge}
              setFilterAge={setShirtFilterAge}
              filterLocation={shirtFilterLocation}
              setFilterLocation={setShirtFilterLocation}
              filterPayment={shirtFilterPayment}
              setFilterPayment={setShirtFilterPayment}
              filterDistribution={shirtFilterDistribution}
              setFilterDistribution={setShirtFilterDistribution}
              filterShirtSize={shirtFilterSize}
              setFilterShirtSize={setShirtFilterSize}
              onResetFilters={onResetFilters}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          {people.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No people found matching your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Shirt Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Shirt Given</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {people.map((person) => (
                    <tr key={person.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age: {person.age}
                        </div>
                      </div>
                    </td>
                      <td className="px-4 py-3">
                        <select
                          value={person.shirtSize || ''}
                          onChange={(e) => updateShirtSize(person.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Size</option>
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
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleShirtPayment(person.id)}
                          className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                            person.paid
                              ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 border border-red-300 hover:bg-red-200'
                          }`}
                        >
                          {person.paid ? 'Paid' : 'Unpaid'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleShirtGiven(person.id)}
                          className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                            person.shirtGiven
                              ? 'bg-green-100 text-green-800 border border-green-300 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
                          }`}
                        >
                          {person.shirtGiven ? 'Given' : 'Pending'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
            aria-label="Back to top"
          >
            <ChevronUp size={24} />
          </button>
        )}
    </>
  );
}