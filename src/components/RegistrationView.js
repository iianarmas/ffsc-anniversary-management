import React, { useState, useEffect } from 'react';
import ActionButtons from './ActionButtons';
import PeopleTable from './PeopleTable';
import { ChevronUp, Search, Users, CheckCircle, Clock } from 'lucide-react';
import Header from './Header';
import StatsBar from './StatsBar';
import Pagination from './Pagination';

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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  // Pagination logic
  const totalItems = filteredAndSortedPeople.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSortedPeople.slice(indexOfFirstItem, indexOfLastItem);

// Ensure current page is within bounds
useEffect(() => {
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }
}, [totalPages]);


  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(filteredAndSortedPeople.length / itemsPerPage)) return;
    setCurrentPage(pageNumber);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // always reset page to 1 when items per page changes
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };


  // Refs
  const tableContainerRef = React.useRef(null);
  const paginationRefEl = React.useRef(null);
  const actionBarRef = React.useRef(null);

  // Heights and fixed pagination state
  const [paginationHeight, setPaginationHeight] = useState(0);
  const [actionBarHeight, setActionBarHeight] = useState(0);
  const [useFixedPagination, setUseFixedPagination] = useState(false);

  // Measure elements and determine overflow
  const measureHeights = () => {
    const tableEl = tableContainerRef.current;
    const paginationEl = paginationRefEl.current;
    const actionEl = actionBarRef.current;

    const tableHeight = tableEl ? tableEl.scrollHeight : 0;
    const containerHeight = tableEl ? tableEl.clientHeight : 0;
    setUseFixedPagination(tableHeight > containerHeight);

    setPaginationHeight(paginationEl ? paginationEl.offsetHeight : 0);
    setActionBarHeight(actionEl ? actionEl.offsetHeight : 0);
  };

  // Single ResizeObserver for all relevant elements
  useEffect(() => {
    measureHeights();

    const resizeObserver = new ResizeObserver(() => {
      measureHeights();
    });

    if (tableContainerRef.current) resizeObserver.observe(tableContainerRef.current);
    if (paginationRefEl.current) resizeObserver.observe(paginationRefEl.current);
    if (actionBarRef.current) resizeObserver.observe(actionBarRef.current);

    window.addEventListener('resize', measureHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureHeights);
    };
  }, [filteredAndSortedPeople.length, itemsPerPage, currentPage]);

  

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
                <th className="border border-gray-300 px-4 py-2 text-left">Age</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age Bracket</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPeople.map((person) => (
                <tr key={person.id}>
                  <td className="border border-gray-300 px-4 py-2">{person.firstName} {person.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.age}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.ageBracket}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.location}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.registered ? 'Checked In' : 'Pending'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {person.registered && person.registeredAt 
                      ? new Date(person.registeredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Screen content */}
      <div className="no-print">
        {/* Header */}
        <Header 
          viewTitle="Registration Management"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          searchPlaceholder="Search by name..."
        />

        <div className="p-4">
            <div className="py-2 border-b border-gray-100 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Registration Management</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage check-ins, filters, and bulk actions for registrants</p>
                </div>
                <div className="text-sm text-gray-500 flex items-baseline gap-2">
                  <Users size={18} className="text-gray-400" />
                  <span className="font-semibold text-gray-900 text-lg">{filteredAndSortedPeople.length}</span>
                  <span className="text-gray-500">{filteredAndSortedPeople.length === 1 ? 'person' : 'people'}</span>
                </div>
              </div>
            </div>

            {/* Table area (fixed height) — scrollable content inside */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div
                className="relative overflow-y-auto"
                ref={tableContainerRef}
                style={{
                  maxHeight: `calc(100vh - 12.7rem)`
                }}
              >
              <div ref={actionBarRef} className="sticky top-0 z-30 bg-white">
                <ActionButtons
                  handleSelectAll={handleSelectAll}
                  selectedPeople={selectedPeople}
                  filteredPeopleLength={filteredAndSortedPeople.length}
                  handleBulkRegister={handleBulkRegister}
                  handleBulkRemove={handleBulkRemove}
                  handlePrint={handlePrint}
                  handleDeselectAll={() => selectedPeople.forEach(id => handleSelectPerson(id))}
                  hasActiveFilters={filterAge !== 'All' || filterLocation !== 'All' || filterStatus !== 'All'}
                  onResetFilters={onResetFilters}
                  stats={[
                    { Icon: Users, label: 'Total', value: people.length },
                    { Icon: CheckCircle, label: 'Checked In', value: people.filter(p => p.registered).length },
                    { Icon: Clock, label: 'Pending', value: people.filter(p => !p.registered).length }
                  ]}
                />
              </div>

              <div className="overflow-x-auto">
                <PeopleTable
                  filteredAndSortedPeople={currentItems}
                  selectedPeople={selectedPeople}
                  handleSelectPerson={handleSelectPerson}
                  handleSelectAll={handleSelectAll}
                  filterAge={filterAge}
                  setFilterAge={setFilterAge}
                  filterLocation={filterLocation}
                  setFilterLocation={setFilterLocation}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  stickyTop={actionBarHeight}
                />
              </div>
            </div>

            {/* Fixed pagination when table overflows */}
            {useFixedPagination && (
              <div ref={paginationRefEl} className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
                <Pagination
                  totalItems={filteredAndSortedPeople.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>
            )}
          </div>

          {/* Inline pagination when table doesn't overflow */}
          {!useFixedPagination && (
            <div className="mt-4">
              <Pagination
                totalItems={filteredAndSortedPeople.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-20 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
              aria-label="Back to top"
            >
              <ChevronUp size={24} />
            </button>
          )}
          
          {/* Bottom padding for pagination visibility */}
          {!useFixedPagination && <div className="h-16"></div>}
        </div>
      </div>
    </>
  );
}