import React, { useState, useEffect } from 'react';
import { formatFullName } from '../utils/formatters';
import { Search, Filter, X, ChevronRight, ChevronUp, Shirt, DollarSign, Package, AlertCircle, StickyNote, CheckSquare, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import NotesDialog from './NotesDialog';
import EditPersonDialog from './EditPersonDialog';
import { useBackHandler } from '../hooks/useBackButton';

export default function MobileShirtManagementView({
  people,
  stats,
  updateShirtSize,
  toggleShirtPayment,
  toggleShirtGiven,
  toggleShirtPrint,
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
  shirtFilterAttendance,
  setShirtFilterAttendance,
  onResetFilters,
  shirtFilterPrint,
  setShirtFilterPrint,
  peopleTaskInfo = {}
}) {
  const { profile } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);

  const [editDialogPerson, setEditDialogPerson] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  // Handle back button for filters and edit modal
  useBackHandler(showFilters, () => setShowFilters(false));
  // Don't use back handler for editing person modal - it interferes with interactions
  // useBackHandler(!!editingPerson, () => setEditingPerson(null));

  const activeFiltersCount = [
    shirtFilterAge,
    shirtFilterLocation,
    shirtFilterPayment,
    shirtFilterDistribution,
    shirtFilterSize,
    shirtFilterPrint,
    shirtFilterAttendance
  ].filter(f => f !== 'All').length;
  const hasActiveSearch = shirtSearchTerm.trim() !== '';
  const hasAnyActiveFilter = activeFiltersCount > 0 || hasActiveSearch;

  const shirtSizes = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12', 'TS', 'XS', 'S', 'M', 'L', 'XL', '2XL', 'No shirt', 'None yet'];

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

  // Manual back button handler for edit modal
  useEffect(() => {
    if (!editingPerson) return;

    const handleBackButton = (e) => {
      e.preventDefault();
      setEditingPerson(null);
      window.history.pushState(null, '', window.location.href);
    };

    // Push a state for the modal
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [editingPerson]);

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
            <p className="text-xs text-gray-500">Shirt Management</p>
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
              value={shirtSearchTerm}
              onChange={(e) => setShirtSearchTerm(e.target.value)}
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
                {people.length}
              </div>
              <div className="text-xs text-gray-500">people</div>
            </div>
          </div>

          {/* Active Filters Indicator & Reset */}
          {hasAnyActiveFilter && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-900">
                    {hasActiveSearch && activeFiltersCount > 0 
                      ? `Search + ${activeFiltersCount} ${activeFiltersCount === 1 ? 'filter' : 'filters'} active`
                      : hasActiveSearch 
                        ? 'Search active'
                        : `${activeFiltersCount} ${activeFiltersCount === 1 ? 'filter' : 'filters'} active`
                    }
                  </span>
                </div>
                <button
                  onClick={onResetFilters}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Clear All
                </button>
              </div>
              
              {/* Active Filter Tags */}
              <div className="flex flex-wrap gap-1.5">
                {hasActiveSearch && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Search: "{shirtSearchTerm}"
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtSearchTerm('')}
                    />
                  </span>
                )}
                {shirtFilterAge !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Age: {shirtFilterAge}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterAge('All')}
                    />
                  </span>
                )}
                {shirtFilterLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Location: {shirtFilterLocation}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterLocation('All')}
                    />
                  </span>
                )}
                {shirtFilterPayment !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Payment: {shirtFilterPayment}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterPayment('All')}
                    />
                  </span>
                )}
                {shirtFilterDistribution !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Distribution: {shirtFilterDistribution}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterDistribution('All')}
                    />
                  </span>
                )}
                {shirtFilterSize !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Size: {shirtFilterSize}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterSize('All')}
                    />
                  </span>
                )}
                {shirtFilterPrint !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {shirtFilterPrint === 'With Print' ? 'With Print' : 'Plain'}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterPrint('All')}
                    />
                  </span>
                )}
                {shirtFilterAttendance !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {shirtFilterAttendance === 'attending' ? 'Attending Event' : 'Shirt Only'}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setShirtFilterAttendance('All')}
                    />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Compact Stats Row */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.paid}</div>
              <div className="text-xs text-gray-500">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{stats.unpaid}</div>
              <div className="text-xs text-gray-500">Unpaid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{stats.shirtsGiven}</div>
              <div className="text-xs text-gray-500">Given</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.shirtsPending}</div>
              <div className="text-xs text-gray-500">Pending Distibution</div>
            </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Print Status</label>
                <select
                  value={shirtFilterPrint}
                  onChange={(e) => setShirtFilterPrint(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All Print Status</option>
                  <option value="With Print">With Print</option>
                  <option value="No Print">Plain (No Print)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
                <select
                  value={shirtFilterAttendance}
                  onChange={(e) => setShirtFilterAttendance(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="All">All</option>
                  <option value="attending">Attending Event</option>
                  <option value="shirt_only">Shirt Only</option>
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

      {/* Edit Person Modal */}
      {editingPerson && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in" 
          onMouseDown={(e) => {
            // Only close if clicking the backdrop
            if (e.target === e.currentTarget) {
              setEditingPerson(null);
            }
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#001740]">{editingPerson.firstName} {editingPerson.lastName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Edit shirt details</p>
                </div>
                <button 
                  onClick={() => setEditingPerson(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shirt Size</label>
                <select
                  value={editingPerson.shirtSize || ''}
                  onChange={(e) => {
                    updateShirtSize(editingPerson.id, e.target.value);
                    setEditingPerson({ ...editingPerson, shirtSize: e.target.value });
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select Size</option>
                  {shirtSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Status Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { updateAttendanceStatus } = await import('../services/api');
                      const result = await updateAttendanceStatus(editingPerson.id, 'attending');
                      if (result.success) {
                        setEditingPerson({ ...editingPerson, attendanceStatus: 'attending' });
                        window.dispatchEvent(new Event('registrationUpdated'));
                      }
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      editingPerson.attendanceStatus === 'attending'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Attending
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const { updateAttendanceStatus } = await import('../services/api');
                      const result = await updateAttendanceStatus(editingPerson.id, 'shirt_only');
                      if (result.success) {
                        setEditingPerson({ ...editingPerson, attendanceStatus: 'shirt_only' });
                        window.dispatchEvent(new Event('registrationUpdated'));
                      }
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      editingPerson.attendanceStatus === 'shirt_only'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Shirt Only
                  </button>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShirtPayment(editingPerson.id);
                      setEditingPerson({ ...editingPerson, paid: !editingPerson.paid });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      editingPerson.paid
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-red-600 text-white hover:bg-red-500'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <DollarSign size={18} />
                    <span>{editingPerson.paid ? '✓ Paid' : 'Unpaid'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleShirtGiven(editingPerson.id);
                      setEditingPerson({ ...editingPerson, shirtGiven: !editingPerson.shirtGiven });
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      editingPerson.shirtGiven
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-yellow-500 text-white hover:bg-yellow-400'
                    }`}
                    style={{ minHeight: '48px' }}
                  >
                    <Package size={18} />
                    <span>{editingPerson.shirtGiven ? '✓ Given' : 'Pending'}</span>
                  </button>
                </div>

                {/* Print Status Toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleShirtPrint(editingPerson.id);
                    setEditingPerson({ ...editingPerson, hasPrint: !editingPerson.hasPrint });
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    editingPerson.hasPrint
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-400 text-white hover:bg-gray-500'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <Shirt size={18} />
                  <span>{editingPerson.hasPrint ? '✓ With Print' : 'Plain'}</span>
                </button>
              </div>
            </div>

            {/* Done Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setEditingPerson(null)}
                className="w-full py-3.5 bg-[#001740] text-white rounded-xl font-semibold hover:bg-[#002255] transition-colors"
                style={{ minHeight: '48px' }}
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
          <div className="text-center py-16">
            <Shirt size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No people found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 transition-all"
              onClick={() => {
                if (!longPressTriggered) {
                  setEditingPerson(person);
                }
                setLongPressTriggered(false);
              }}
              onTouchStart={(e) => {
                // Only allow long press for admin and committee
                if (profile?.role !== 'admin' && profile?.role !== 'committee') return;
                
                const timer = setTimeout(() => {
                  setLongPressTriggered(true);
                  setEditDialogPerson(person);
                  // Haptic feedback if available
                  if (window.navigator.vibrate) {
                    window.navigator.vibrate(50);
                  }
                }, 500); // 500ms long press
                setLongPressTimer(timer);
              }}
              onTouchEnd={() => {
                if (longPressTimer) {
                  clearTimeout(longPressTimer);
                  setLongPressTimer(null);
                }
              }}
              onTouchMove={() => {
                if (longPressTimer) {
                  clearTimeout(longPressTimer);
                  setLongPressTimer(null);
                  setLongPressTriggered(false);
                }
              }}
              style={{ minHeight: '44px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Name with Notes/Tasks Indicator */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-gray-900 leading-tight flex-1">
                      {formatFullName(person.firstName, person.lastName)}
                    </h3>
                    
                    {/* Notes/Task Indicators */}
                    {(() => {
                      const taskInfo = peopleTaskInfo[person.id] || {};
                      
                      // Check if user is viewer
                      if (profile?.role === 'viewer') {
                        // Show locked indicator for viewers if there are notes/tasks
                        if (taskInfo?.incompleteTasksCount > 0 || taskInfo?.hasOnlyCompletedTasks || taskInfo?.hasNotes) {
                          return (
                            <div 
                              className="flex-shrink-0 p-1.5 rounded"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Lock size={18} className="text-gray-400" />
                            </div>
                          );
                        }
                        return null;
                      }
                      
                      // Show clickable icon with badge
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotesDialogPerson(person);
                          }}
                          className="flex-shrink-0 p-1.5 hover:bg-blue-50 rounded transition active:scale-95"
                          aria-label="View notes and tasks"
                        >
                          <div className="relative">
                            {taskInfo.hasTasks ? (
                              <CheckSquare 
                                size={18} 
                                className={
                                  taskInfo.incompleteTasksCount > 0
                                    ? taskInfo.highestPriority === 'High'
                                      ? 'text-red-500'
                                      : taskInfo.highestPriority === 'Medium'
                                        ? 'text-orange-500'
                                        : 'text-green-500'
                                    : 'text-gray-400'
                                }
                              />
                            ) : (
                              <StickyNote 
                                size={18} 
                                className={taskInfo.hasNotes ? 'text-blue-500' : 'text-gray-300'}
                              />
                            )}
                            {(taskInfo.notesCount > 0 || taskInfo.tasksCount > 0) && (
                              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                                {taskInfo.notesCount + taskInfo.tasksCount}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })()}
                  </div>
                  
                  {/* Age, Age Bracket, Location, Attendance, and Shirt Size */}
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-600 flex-wrap">
                    <span>{person.age} years old</span>
                    <span className="text-gray-300">•</span>
                    <span>{person.ageBracket}</span>
                    <span className="text-gray-300">•</span>
                    <span>{person.location}</span>
                    {person.attendanceStatus === 'shirt_only' && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-purple-700 font-medium">Shirt Only</span>
                      </>
                    )}
                    <span className="text-gray-300">•</span>
                    <span className="font-semibold text-[#001740]">
                      {person.shirtSize || 'No size set'}
                    </span>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {/* Payment Status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      person.paid 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      <DollarSign size={12} />
                      {person.paid ? 'Paid' : 'Unpaid'}
                    </span>
                    
                    {/* Distribution Status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      person.shirtGiven 
                        ? 'bg-green-600 text-white' 
                        : 'bg-yellow-500 text-white'
                    }`}>
                      <Package size={12} />
                      {person.shirtGiven ? 'Given' : 'Pending'}
                    </span>

                    {/* Print Status */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      person.hasPrint
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      <Shirt size={12} />
                      {person.hasPrint ? 'With Print' : 'Plain'}
                    </span>
                  </div>
                </div>
                
                {/* Chevron Icon */}
                <ChevronRight size={20} className="text-gray-400 flex-shrink-0 ml-3" />
              </div>
            </div>
          ))
        )}
      </div>
      {showBackToTop && !editingPerson && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 p-3 bg-[#001740] text-white rounded-full shadow-lg z-50 hover:bg-[#002255] transition-colors"
        >
          <ChevronUp />
        </button>
      )}

      {/* Notes Dialog */}
      <NotesDialog
        person={notesDialogPerson}
        isOpen={!!notesDialogPerson && profile?.role !== 'viewer'}
        onClose={() => setNotesDialogPerson(null)}
      />

      {/* Edit Person Dialog */}
      {editDialogPerson && (profile?.role === 'admin' || profile?.role === 'committee') && (
        <EditPersonDialog
          person={editDialogPerson}
          isOpen={!!editDialogPerson}
          onClose={() => setEditDialogPerson(null)}
        />
      )}
    </div>
  );
}