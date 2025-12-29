import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronRight, ChevronUp } from 'lucide-react';

export default function MobileShirtManagementView({
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
  const [showFilters, setShowFilters] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const activeFiltersCount = [
    shirtFilterAge,
    shirtFilterLocation,
    shirtFilterPayment,
    shirtFilterDistribution,
    shirtFilterSize
  ].filter(f => f !== 'All').length;

  const shirtSizes = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12', 'TS', 'XS', 'S', 'M', 'L', 'XL', '2XL'];

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
    <div className="pb-6">
      {/* Non-sticky Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{stats.paid}</div>
            <div className="text-xs text-blue-600">Paid</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-red-700">{stats.unpaid}</div>
            <div className="text-xs text-red-600">Unpaid</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-700">{stats.shirtsGiven}</div>
            <div className="text-xs text-green-600">Given</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-orange-700">{stats.shirtsPending}</div>
            <div className="text-xs text-orange-600">Pending</div>
          </div>
        </div>
      </div>

      {/* Sticky Header - Search, Filter, Counter Only */}
      <div className="sticky top-0 bg-white shadow-md z-20 p-4">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name..."
            value={shirtSearchTerm}
            onChange={(e) => setShirtSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Button & Counter */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Filter size={18} />
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
          <div className="text-sm font-semibold text-gray-700">
            {people.length} people
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Bracket</label>
                <select
                  value={shirtFilterAge}
                  onChange={(e) => setShirtFilterAge(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Ages</option>
                  <option value="Toddler">Toddlers</option>
                  <option value="Kid">Kids</option>
                  <option value="Youth">Youths</option>
                  <option value="Adult">Adults</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={shirtFilterLocation}
                  onChange={(e) => setShirtFilterLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Locations</option>
                  <option value="Main">Main</option>
                  <option value="Cobol">Cobol</option>
                  <option value="Malacañang">Malacañang</option>
                  <option value="Guest">Guest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment</label>
                <select
                  value={shirtFilterPayment}
                  onChange={(e) => setShirtFilterPayment(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Payment</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Distribution</label>
                <select
                  value={shirtFilterDistribution}
                  onChange={(e) => setShirtFilterDistribution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Distribution</option>
                  <option value="Given">Given</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shirt Size</label>
                <select
                  value={shirtFilterSize}
                  onChange={(e) => setShirtFilterSize(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Sizes</option>
                  {shirtSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    onResetFilters();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Person Modal */}
      {editingPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setEditingPerson(null)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingPerson.firstName} {editingPerson.lastName}</h3>
              <button onClick={() => setEditingPerson(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shirt Size</label>
                <select
                  value={editingPerson.shirtSize || ''}
                  onChange={(e) => {
                    updateShirtSize(editingPerson.id, e.target.value);
                    setEditingPerson({ ...editingPerson, shirtSize: e.target.value });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Size</option>
                  {shirtSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    toggleShirtPayment(editingPerson.id);
                    setEditingPerson({ ...editingPerson, paid: !editingPerson.paid });
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    editingPerson.paid
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {editingPerson.paid ? '✓ Paid' : 'Mark Paid'}
                </button>
                <button
                  onClick={() => {
                    toggleShirtGiven(editingPerson.id);
                    setEditingPerson({ ...editingPerson, shirtGiven: !editingPerson.shirtGiven });
                  }}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    editingPerson.shirtGiven
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {editingPerson.shirtGiven ? '✓ Given' : 'Mark Given'}
                </button>
              </div>

              <button
                onClick={() => setEditingPerson(null)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* People Cards */}
      <div className="p-4 space-y-3">
        {people.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No people found
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-lg shadow-md p-4"
              onClick={() => setEditingPerson(person)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {person.firstName} {person.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Age: {person.age}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {person.shirtSize || 'No size'}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      person.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {person.paid ? 'Paid' : 'Unpaid'}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      person.shirtGiven ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {person.shirtGiven ? 'Given' : 'Pending'}
                    </span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          ))
        )}
      </div>
      {showBackToTop && !editingPerson && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg z-50"
        >
          <ChevronUp />
        </button>
      )}

    </div>
  );
}