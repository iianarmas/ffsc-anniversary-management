import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronRight, Check, ChevronUp } from 'lucide-react';

export default function MobileRegistrationView({
  searchTerm,
  setSearchTerm,
  filterAge,
  setFilterAge,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  onResetFilters,
  filteredAndSortedPeople,
  handleBulkRegister,
  handleBulkRemove,
  selectedPeople,
  handleSelectPerson,
  people
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);


  const ageColors = {
    Toddler: 'bg-pink-100 text-pink-800',
    Kid: 'bg-blue-100 text-blue-800',
    Youth: 'bg-purple-100 text-purple-800',
    Adult: 'bg-green-100 text-green-800'
  };

  const locationColors = {
    Main: 'bg-orange-100 text-orange-800',
    Cobol: 'bg-teal-100 text-teal-800',
    Malacañang: 'bg-pink-100 text-pink-800',
    Guest: 'bg-gray-100 text-gray-800'
  };

  const activeFiltersCount = [filterAge, filterLocation, filterStatus].filter(f => f !== 'All').length;

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
    <div className="pb-20">
      {/* Fixed Header */}
      <div className="sticky top-0 bg-white shadow-md z-20 p-4">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredAndSortedPeople.length} / {people.length}
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
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
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
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Status</option>
                  <option value="Registered">Checked In</option>
                  <option value="PreRegistered">Pending</option>
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

      {/* People Cards */}
      <div className="p-4 space-y-3">
        {filteredAndSortedPeople.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No people found
          </div>
        ) : (
          filteredAndSortedPeople.map((person) => (
            <div
              key={person.id}
              className={`bg-white rounded-lg shadow-md p-4 border-2 ${
                selectedPeople.includes(person.id) ? 'border-blue-500' : 'border-transparent'
              }`}
              onClick={() => handleSelectPerson(person.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {person.firstName} {person.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Age: {person.age}</p>
                  {person.registered && person.registeredAt && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Checked in: {new Date(person.registeredAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ageColors[person.ageBracket]}`}>
                      {person.ageBracket}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${locationColors[person.location]}`}>
                      {person.location}
                    </span>
                    {person.registered ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Checked In
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  {selectedPeople.includes(person.id) && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check size={16} className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fixed Bottom Actions - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
        {selectedPeople.length === 0 ? (
          <button
            onClick={() => {
              const allIds = filteredAndSortedPeople.map(p => p.id);
              allIds.forEach(id => handleSelectPerson(id));
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium"
          >
            Select All ({filteredAndSortedPeople.length})
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-3">
              <button
                onClick={handleBulkRegister}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Check In ({selectedPeople.length})
              </button>
              <button
                onClick={handleBulkRemove}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium"
              >
                Remove ({selectedPeople.length})
              </button>
            </div>
            <button
              onClick={() => selectedPeople.forEach(id => handleSelectPerson(id))}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm"
            >
              Deselect All
            </button>
          </div>
        )}
      </div>
      {showBackToTop && selectedPeople.length === 0 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 p-3 bg-blue-500 text-white rounded-full shadow-lg z-50"
        >
          <ChevronUp />
        </button>
      )}



    </div>
  );
}