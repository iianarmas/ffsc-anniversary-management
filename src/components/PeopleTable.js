import React, { useState, useRef, useEffect } from 'react';
import { formatFullName } from '../utils/formatters';
import { createPortal } from 'react-dom';
import { Filter, StickyNote, CheckSquare, CheckCircle, Lock, RotateCcw } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';

const formatPhilippineTime = (utcTimestamp) => {
  if (!utcTimestamp) return '—';
  
  // Ensure the timestamp has a timezone indicator
  let timestamp = utcTimestamp;
  if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('T00:00:00')) {
    timestamp = timestamp + 'Z'; // Add UTC indicator if missing
  }
  
  const date = new Date(timestamp);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  return formatter.format(date);
};

const formatContactNumber = (number) => {
  if (!number) return '—';
  // Remove any non-digit characters
  const cleaned = String(number).replace(/\D/g, '');
  
  // If it starts with 9 and is 10 digits, add 0 in front
  let formatted = cleaned;
  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    formatted = '0' + cleaned;
  }
  
  // Format as (09xx) xxx-xxxx
  if (formatted.length === 11) {
    return `(${formatted.substring(0, 4)}) ${formatted.substring(4, 7)}-${formatted.substring(7)}`;
  }
  
  // Return original if format doesn't match
  return number;
};

export default function PeopleTable({ 
  filteredAndSortedPeople, 
  pagePeople,
  selectedPeople, 
  handleSelectPerson, 
  filterAge,
  setFilterAge,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  filterAttendance,
  setFilterAttendance,
  onOpenPerson = () => {},
  onOpenNotes = () => {},
  peopleWithNotes = [],
  peopleTaskInfo = {},
  stickyTop = 60
}) {
  const { profile } = useAuth();
  // debug: show stickyTop in dev console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('PeopleTable stickyTop', stickyTop);
  }
  const [openFilter, setOpenFilter] = useState(null);
  const filterRefs = useRef({});
  const selectAllCheckboxRef = useRef(null);
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter) {
        const filterButton = filterRefs.current[openFilter];
        const dropdown = dropdownRefs.current[openFilter];
        
        // Check if click is inside the filter button OR the dropdown
        const clickedInsideButton = filterButton && filterButton.contains(event.target);
        const clickedInsideDropdown = dropdown && dropdown.contains(event.target);
        
        if (!clickedInsideButton && !clickedInsideDropdown) {
          setOpenFilter(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

  // Control the select-all checkbox appearance
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // Check if any or all VISIBLE items on current page are selected
      const visibleIds = pagePeople.map(p => p.id);
      const selectedVisibleIds = selectedPeople.filter(id => visibleIds.includes(id));
      const allVisibleSelected = selectedVisibleIds.length === pagePeople.length && pagePeople.length > 0;
      const anyVisibleSelected = selectedVisibleIds.length > 0;
      selectAllCheckboxRef.current.indeterminate = false;
      selectAllCheckboxRef.current.checked = anyVisibleSelected;
    }
  }, [selectedPeople, pagePeople]);

  const FilterDropdown = ({ column, options, value, onChange }) => {
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (openFilter === column && filterRefs.current[column]) {
        const updatePosition = () => {
          const rect = filterRefs.current[column].getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.right - 192 // 192px = w-48
          });
        };
        updatePosition();
        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);
        return () => {
          window.removeEventListener('scroll', updatePosition, true);
          window.removeEventListener('resize', updatePosition);
        };
      }
    }, [openFilter, column]);

    return (
      <div className="relative" ref={el => filterRefs.current[column] = el}>
        <div className="relative">
          <Filter 
            size={14} 
            className="cursor-pointer transition text-gray-400 hover:text-gray-600"
            onClick={() => setOpenFilter(openFilter === column ? null : column)}
          />
          {value !== 'All' && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
        </div>
        {openFilter === column && createPortal(
          <div 
            ref={el => dropdownRefs.current[column] = el}
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              zIndex: 99999,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpenFilter(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition ${
                    value === option.value ? 'bg-blue-100 text-[#001740] font-semibold' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  };

  return (
    <>
      <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead className="sticky bg-white z-30" style={{ top: `${stickyTop}px`, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            <tr className="border-b border-gray-200">
              <th className="px-2 py-1 text-left border border-gray-200 w-12 text-center bg-white">
                <input
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  onChange={(e) => {
                    e.stopPropagation();
                    // Check if all visible items on current page are selected
                    const visibleIds = pagePeople.map(p => p.id);
                    const selectedVisibleIds = selectedPeople.filter(id => visibleIds.includes(id));
                    const allVisibleSelected = selectedVisibleIds.length === pagePeople.length;
                    if (allVisibleSelected) {
                      // Deselect all visible items on this page
                      const idsToDeselect = pagePeople
                        .filter(person => selectedPeople.includes(person.id))
                        .map(person => person.id);
                      idsToDeselect.forEach(id => handleSelectPerson(id));
                    } else {
                      // Select all visible items on this page
                      pagePeople.forEach(person => {
                        if (!selectedPeople.includes(person.id)) {
                          handleSelectPerson(person.id);
                        }
                      });
                    }
                  }}
                  className="w-4 h-4 rounded accent-[#0f2a71] cursor-pointer"
                  style={{ accentColor: '#0f2a71' }}
                />
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center">
                  <span>Name</span>
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center">
                  <span>Age</span>
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center justify-between">
                  <span>Age Bracket</span>
                  <FilterDropdown 
                    column="ageBracket"
                    options={[
                      { value: 'All', label: 'All Ages' },
                      { value: 'Toddler', label: 'Toddlers' },
                      { value: 'Kid', label: 'Kids' },
                      { value: 'Youth', label: 'Youths' },
                      { value: 'Adult', label: 'Adults' }
                    ]}
                    value={filterAge}
                    onChange={setFilterAge}
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center">
                  <span>Gender</span>
                </div>
              </th>
              {profile?.role !== 'viewer' && (
                <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                  <div className="flex items-center">
                    <span>Contact Number</span>
                  </div>
                </th>
              )}
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center justify-between">
                  <span>Location</span>
                  <FilterDropdown 
                    column="location"
                    options={[
                      { value: 'All', label: 'All Locations' },
                      { value: 'Main', label: 'Main' },
                      { value: 'Cobol', label: 'Cobol' },
                      { value: 'Malacañang', label: 'Malacañang' },
                      { value: 'Guest', label: 'Guest' }
                    ]}
                    value={filterLocation}
                    onChange={setFilterLocation}
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center justify-between">
                  <span>Attendance</span>
                  <FilterDropdown 
                    column="attendance"
                    options={[
                      { value: 'All', label: 'All' },
                      { value: 'attending', label: 'Attending Event' },
                      { value: 'shirt_only', label: 'Shirt Only' }
                    ]}
                    value={filterAttendance}
                    onChange={setFilterAttendance}
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <FilterDropdown 
                    column="status"
                    options={[
                      { value: 'All', label: 'All Status' },
                      { value: 'Registered', label: 'Checked In' },
                      { value: 'PreRegistered', label: 'Pending' }
                    ]}
                    value={filterStatus}
                    onChange={setFilterStatus}
                  />
                </div>
              </th>
              <th className="px-4 py-2 text-left border text-sm font-semibold text-gray-700 bg-white">
                <div className="flex items-center justify-center">
                  <span>Timestamp</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagePeople.length > 0 ? (
              pagePeople.map((person, index) => (
                <tr key={person.id} className={`
                  transition-colors
                  ${selectedPeople.includes(person.id)
                    ? 'bg-[#e8edf7] border-l-4 border-l-[#0f2a71]'
                    : index % 2 === 1 ? 'bg-slate-50' : ''
                  }
                  hover:bg-blue-50
                  border-t-0
                `}>
                  <td className="px-3 py-3 border-r border-l text-center w-30">
                    <input
                      type="checkbox"
                      checked={selectedPeople.includes(person.id)}
                      onChange={() => handleSelectPerson(person.id)}
                      className="w-4 h-4 rounded accent-[#0f2a71] cursor-pointer"
                      style={{ accentColor: '#0f2a71' }}
                    />
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="font-medium text-gray-900 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenPerson(person)}
                        className="text-left text-sm text-[#001740] hover:text-blue-700 transition font-medium focus:outline-none"
                        aria-label={`Open ${formatFullName(person.firstName, person.lastName)} details`}
                      >
                        {formatFullName(person.firstName, person.lastName)}
                      </button>
                      {/* Notes/Task Indicators */}
                      {(() => {
                        const taskInfo = peopleTaskInfo[person.id] || {};
                        
                        // Check if user is viewer
                        if (profile?.role === 'viewer') {
                          // Show locked indicator for viewers if there are notes/tasks
                          if (taskInfo?.incompleteTasksCount > 0 || taskInfo?.hasOnlyCompletedTasks || taskInfo?.hasNotes) {
                            return (
                              <div className="p-1 rounded transition group relative">
                                <Lock size={14} className="text-gray-400" />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                  Contact admin to view notes/tasks
                                </span>
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
                              onOpenNotes(person);
                            }}
                            className="p-1 hover:bg-blue-50 rounded transition relative"
                            aria-label="View notes and tasks"
                          >
                            <div className="relative">
                              {taskInfo.hasTasks ? (
                                <CheckSquare 
                                  size={16} 
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
                                  size={16} 
                                  className={taskInfo.hasNotes ? 'text-blue-500' : 'text-gray-300'}
                                />
                              )}
                              {(taskInfo.notesCount > 0 || taskInfo.tasksCount > 0) && (
                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center">
                                  {taskInfo.notesCount + taskInfo.tasksCount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.age}</div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.ageBracket}</div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.gender}</div>
                  </td>
                  {profile?.role !== 'viewer' && (
                    <td className="px-4 py-3 text-left border-r">
                      <div className="text-sm text-gray-700">{formatContactNumber(person.contactNumber)}</div>
                    </td>
                  )}
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.location}</div>
                  </td>
                  <td className="px-4 py-3 text-center border-r">
                    <div className="text-sm text-gray-700">
                      {person.attendanceStatus === 'shirt_only' ? 'Shirt Only' : 'Attending'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center border-r">
                    <div className="flex items-center justify-center gap-2">
                      {/* Status Badge (visual indicator only) */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                        person.registered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          person.registered ? 'bg-green-600' : 'bg-yellow-600'
                        }`} />
                        {person.registered ? 'Checked In' : 'Pending'}
                      </span>

                      {/* Action Button (toggle status) */}
                      {profile?.role !== 'viewer' && (
                        <button
                          onClick={async () => {
                            if (person.registered) {
                              const { removeCheckIn } = await import('../services/api');
                              await removeCheckIn(person.id, profile?.id);
                            } else {
                              const { checkInPerson } = await import('../services/api');
                              await checkInPerson(person.id, profile?.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition active:scale-95"
                          title={person.registered ? 'Remove check-in' : 'Check in'}
                        >
                          <RotateCcw size={14} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    {person.registered && person.registeredAt ? (
                      <div className="text-xs text-gray-600">
                        {formatPhilippineTime(person.registeredAt)}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={profile?.role !== 'viewer' ? 10 : 9} className="text-center py-12 text-gray-500">
                  No people found matching your search criteria
                </td>
              </tr>
            )}
            </tbody>
        </table>
    </>
  );
}