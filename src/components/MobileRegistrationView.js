import React, { useState, useEffect } from 'react';
import { formatFullName } from '../utils/formatters';
import { Search, Filter, X, ChevronRight, Check, ChevronUp, Users, CheckCircle, Clock, StickyNote, CheckSquare, Lock, Plus } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import NotesDialog from './NotesDialog';
import EditPersonDialog from './EditPersonDialog';
import { useBackHandler } from '../hooks/useBackButton';
import Avatar from './Avatar';

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
  filterAttendance,
  setFilterAttendance,
  onResetFilters,
  filteredAndSortedPeople,
  handleBulkRegister,
  handleBulkRemove,
  selectedPeople,
  handleSelectPerson,
  people,
  peopleTaskInfo = {}
}) {
  const { profile } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  // Handle back button for filters
  useBackHandler(showFilters, () => setShowFilters(false));
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);

  const [editDialogPerson, setEditDialogPerson] = useState(null);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);


  const activeFiltersCount = [filterAge, filterLocation, filterStatus, filterAttendance].filter(f => f !== 'All').length;
  const hasActiveSearch = searchTerm.trim() !== '';
  const hasAnyActiveFilter = activeFiltersCount > 0 || hasActiveSearch;

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
      <div className="fixed top-0 left-0 right-0 bg-[#f9fafa] border-b border-gray-200 shadow-sm z-20">
        {/* Logo and Brand Section */}
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <div className="flex items-center gap-3">
            <img 
              src="/church-logo.svg" 
              alt="FFSC Logo" 
              className="w-8 h-8 object-contain flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const event = new CustomEvent('navigate-to-home');
                window.dispatchEvent(event);
              }}
            />
            <div>
              <h1 
                style={{ fontFamily: 'Moderniz, sans-serif' }} 
                className="text-sm text-[#001740] cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  const event = new CustomEvent('navigate-to-home');
                  window.dispatchEvent(event);
                }}
              >
                FFSC20
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile?.role !== 'viewer' && (
              <button
                onClick={() => {
                  const event = new CustomEvent('open-add-person');
                  window.dispatchEvent(event);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 active:scale-95"
                aria-label="Add person"
              >
                <Plus size={20} className="text-gray-400" />
              </button>
            )}
            <div
              onClick={() => {
                const event = new CustomEvent('navigate-to-profile');
                window.dispatchEvent(event);
              }}
              className="cursor-pointer"
            >
              <Avatar 
                src={profile?.avatar_url} 
                name={profile?.full_name}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>
        
        <div className="pt-14">
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
                    Search: "{searchTerm}"
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setSearchTerm('')}
                    />
                  </span>
                )}
                {filterAge !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Age: {filterAge}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setFilterAge('All')}
                    />
                  </span>
                )}
                {filterLocation !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Location: {filterLocation}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setFilterLocation('All')}
                    />
                  </span>
                )}
                {filterStatus !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    Status: {filterStatus === 'Registered' ? 'Checked In' : 'Pending'}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setFilterStatus('All')}
                    />
                  </span>
                )}
                {filterAttendance !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {filterAttendance === 'attending' ? 'Attending Event' : 'Shirt Only'}
                    <X 
                      size={12} 
                      className="cursor-pointer hover:text-blue-900" 
                      onClick={() => setFilterAttendance('All')}
                    />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Compact Stats Row - Now inside sticky header */}
        <div className="bg-white px-4 py-3 border-b border-gray-100">
          <div className="grid grid-cols-5 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-[#001740]">{people.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {people.filter(p => p.registered && p.attendanceStatus === 'attending' && p.ageBracket !== 'Toddler').length}
              </div>
              <div className="text-xs text-gray-500">Checked</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">
                {people.length - people.filter(p => p.ageBracket === 'Toddler').length - people.filter(p => p.attendanceStatus === 'shirt_only').length}
              </div>
              <div className="text-xs text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round((people.filter(p => p.attendanceStatus === 'attending' && p.ageBracket !== 'Toddler').length / 230) * 100)}%
              </div>
              <div className="text-xs text-gray-500">Full</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {230 - people.filter(p => p.attendanceStatus === 'attending' && p.ageBracket !== 'Toddler').length}
              </div>
              <div className="text-xs text-gray-500">Slots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in" 
          onClick={(e) => {
            // Only close if clicking the backdrop itself
            if (e.target === e.currentTarget) {
              setShowFilters(false);
            }
          }}
        >
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
                  <select
                    value={filterAttendance}
                    onChange={(e) => setFilterAttendance(e.target.value)}
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
                onClick={() => {
                  if (!longPressTriggered) {
                    handleSelectPerson(person.id);
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
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <div 
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-[#001740] border-[#001740]' 
                        : 'border-gray-300'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPerson(person.id);
                    }}
                  >
                    {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
                  </div>
                  
                  {/* Content */}
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
                            <div className="flex-shrink-0 p-1.5 rounded">
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
                    
                    {/* Age, Location, and Attendance */}
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5 flex-wrap">
                      <span>{person.age} years old</span>
                      <span className="text-gray-400">•</span>
                      <span>{person.ageBracket}</span>
                      <span className="text-gray-400">•</span>
                      <span>{person.location}</span>
                      {person.attendanceStatus === 'shirt_only' && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-purple-700 font-medium">Shirt Only</span>
                        </>
                      )}
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
                      {/* Status Badge */}
                      {person.registered ? (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-700 text-white">
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
                          Pending
                        </span>
                      )}
                      {/* Attendance Status - Only show if shirt only */}
                      {person.attendanceStatus === 'shirt_only' && (
                        <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                          Shirt Only
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