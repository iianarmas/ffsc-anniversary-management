import React, { useState, useEffect } from 'react';
import SearchAndFilters from './SearchAndFilters';
import ActionButtons from './ActionButtons';
import PeopleTable from './PeopleTable';
import { ChevronUp, Search } from 'lucide-react';

export default function RegistrationView({ 
  searchTerm,
  setSearchTerm,
  filterAge,
  setFilterAge,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  onResetFilters,
  handleSelectAll,
  selectedPeople,
  filteredAndSortedPeople,
  handleBulkRegister,
  handleBulkRemove,
  handlePrint,
  handleSelectPerson,
  people
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
      {/* Print-only content */}
      <div className="print-content hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-2">FFSC Anniversary Management</h1>
          <h2 className="text-xl font-semibold mb-1">Registration View</h2>
          
          {/* Active Filters */}
          <div className="mb-4 text-sm text-gray-600">
            <strong>Active Filters:</strong>
            {searchTerm && ` Search: "${searchTerm}"`}
            {filterAge !== 'All' && ` | Age: ${filterAge}`}
            {filterLocation !== 'All' && ` | Location: ${filterLocation}`}
            {filterStatus !== 'All' && ` | Status: ${filterStatus === 'Registered' ? 'Checked In' : 'Pending'}`}
            {!searchTerm && filterAge === 'All' && filterLocation === 'All' && filterStatus === 'All' && ' None'}
          </div>
          
          <p className="mb-6 text-sm">Total: {filteredAndSortedPeople.length} {filteredAndSortedPeople.length === 1 ? 'person' : 'people'}</p>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age Bracket</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPeople.map((person) => (
                <tr key={person.id}>
                  <td className="border border-gray-300 px-4 py-2">{person.firstName} {person.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.ageBracket}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.location}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.registered ? 'Checked In' : 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen content */}
      <div className="no-print">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-6 py-3">
              <span className="text-2xl font-bold text-blue-700">{filteredAndSortedPeople.length}</span>
              <span className="text-sm text-blue-600 ml-2">{filteredAndSortedPeople.length === 1 ? 'Person' : 'People'}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SearchAndFilters
            filterAge={filterAge}
            setFilterAge={setFilterAge}
            filterLocation={filterLocation}
            setFilterLocation={setFilterLocation}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onResetFilters={onResetFilters}
          />
        </div>

        {/* Sticky Section - Action Buttons */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-indigo-100 pb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <ActionButtons
              handleSelectAll={handleSelectAll}
              selectedPeople={selectedPeople}
              filteredPeopleLength={filteredAndSortedPeople.length}
              handleBulkRegister={handleBulkRegister}
              handleBulkRemove={handleBulkRemove}
              handlePrint={handlePrint}
            />
          </div>
        </div>

        <PeopleTable
          filteredAndSortedPeople={filteredAndSortedPeople}
          selectedPeople={selectedPeople}
          handleSelectPerson={handleSelectPerson}
          handleSelectAll={handleSelectAll}
        />

        <div className="mt-4 text-center text-gray-600">
          Showing {filteredAndSortedPeople.length} of {people.length} people
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
      </div>
    </>
  );
}