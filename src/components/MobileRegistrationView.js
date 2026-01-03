import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronRight, Check, ChevronUp, Users, CheckCircle, Clock } from 'lucide-react';

const formatPhilippineTime = (utcTimestamp) => {
  if (!utcTimestamp) return '—';
  
  let timestamp = utcTimestamp;
  if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('T00:00:00')) {
    timestamp = timestamp + 'Z';
  }
  
  const date = new Date(timestamp);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return formatter.format(date);
};

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
    <div className="pb-24 bg-[#f9fafa]">
      {/* Fixed Header with Branding */}
      <div className="sticky top-0 bg-white shadow-md z-20">
        {/* Logo and Brand Section */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <img 
            src="/church-logo.svg" 
            alt="FFSC Logo" 
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div>
            <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-lg font-bold text-[#001740]">
              FFSC20
            </h1>
            <p className="text-xs text-gray-500">Registration</p>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="px-4 pb-3 pt-2">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeFiltersCount > 0 
                  ? 'bg-[#001740] text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Filter size={18} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-[#f4d642] text-[#001740] px-2 py-0.5 rounded-full text-xs font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <div className="flex-1 text-right">
              <div className="text-sm font-semibold text-gray-900">
                {filteredAndSortedPeople.length}
              </div>
              <div className="text-xs text-gray-500">people</div>
            </div>
          </div>

          {/* Active Filters Indicator & Reset */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-blue-600" />
                <span className="text-xs font-medium text-blue-900">
                  {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
                </span>
              </div>
              <button
                onClick={onResetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Stats Row */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-[#001740]">{people.length}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {people.filter(p => p.registered).length}
            </div>
            <div className="text-xs text-gray-500">Checked</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-600">
              {people.filter(p => !p.registered).length}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.round((people.filter(p => p.registered && p.ageBracket !== 'Toddler').length / 230) * 100)}%
            </div>
            <div className="text-xs text-gray-500">Capacity</div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in" onClick={() => setShowFilters(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-[#001740]">Filters</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Refine your search</p>
                </div>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Filter Content */}
            <div className="p-6">
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
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onResetFilters();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-3 bg-[#001740] text-white rounded-xl font-medium hover:bg-[#002255] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>

      {/* People Cards */}
      <div className="p-4 space-y-3">
        {filteredAndSortedPeople.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No people found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredAndSortedPeople.map((person) => {
            const isSelected = selectedPeople.includes(person.id);
            return (
              <div
                key={person.id}
                className={`bg-white rounded-xl shadow-sm p-4 transition-all duration-200 border-2 ${
                  isSelected 
                    ? 'border-[#001740] shadow-md' 
                    : 'border-transparent'
                }`}
                onClick={() => handleSelectPerson(person.id)}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-[#001740] border-[#001740]' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3 className="text-base font-bold text-gray-900 leading-tight">
                      {person.firstName} {person.lastName}
                    </h3>
                    
                    {/* Age */}
                    <p className="text-sm text-gray-600 mt-1">
                      {person.age} years old
                    </p>
                    
                    {/* Check-in timestamp */}
                    {person.registered && person.registeredAt && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                        <CheckCircle size={12} />
                        <span>Checked in: {formatPhilippineTime(person.registeredAt)}</span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {/* Age Bracket Badge */}
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${ageColors[person.ageBracket]}`}>
                        {person.ageBracket}
                      </span>
                      
                      {/* Location Badge */}
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${locationColors[person.location]}`}>
                        {person.location}
                      </span>
                      
                      {/* Status Badge */}
                      {person.registered ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          <CheckCircle size={12} />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Clock size={12} />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
        <div className="p-4">
          {selectedPeople.length === 0 ? (
            <button
              onClick={() => {
                const allIds = filteredAndSortedPeople.map(p => p.id);
                allIds.forEach(id => handleSelectPerson(id));
              }}
              className="w-full py-3.5 bg-[#001740] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#002255] transition-colors"
              style={{ minHeight: '48px' }}
            >
              <Users size={20} />
              <span>Select All ({filteredAndSortedPeople.length})</span>
            </button>
          ) : (
            <div className="space-y-2">
              {/* Selection Count */}
              <div className="text-center pb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} selected
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleBulkRegister}
                  className="flex-1 py-3.5 bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  style={{ minHeight: '48px' }}
                >
                  <CheckCircle size={20} />
                  <span>Check In</span>
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                  style={{ minHeight: '48px' }}
                >
                  <X size={20} />
                  <span>Remove</span>
                </button>
              </div>
              
              {/* Deselect Button */}
              <button
                onClick={() => selectedPeople.forEach(id => handleSelectPerson(id))}
                className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Deselect All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && selectedPeople.length === 0 && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-36 right-4 p-3 bg-[#001740] text-white rounded-full shadow-lg z-50 hover:bg-[#002255] transition-colors"
        >
          <ChevronUp />
        </button>
      )}
    </div>
  );
}