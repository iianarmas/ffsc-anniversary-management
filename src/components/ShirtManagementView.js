import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './auth/AuthProvider';
import { canManageShirts } from '../utils/permissions';
import { ChevronUp, Search, Filter, DollarSign, Package, Clock, Users, StickyNote, CheckSquare, CheckCircle } from 'lucide-react';
import Header from './Header';
import StatsBar from './StatsBar';
import ShirtActionButtons from './ShirtActionButtons';
import Pagination from './Pagination';
import AccountSidebar from './AccountSidebar';
import NotesDialog from './NotesDialog';
import { getAllPeopleTaskInfo } from '../services/api';

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

  const { profile } = useAuth();
  const canManage = canManageShirts(profile);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Pagination measurement for fixed pagination layout
  const paginationRef = useRef(null);
  const [paginationHeight, setPaginationHeight] = useState(0);

  // Action bar ref & measured height (so table header top can match)
  const actionBarRef = useRef(null);
  const [actionBarHeight, setActionBarHeight] = useState(60);


  // Sidebar state for account view
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notes dialog state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesDialogPerson, setNotesDialogPerson] = useState(null);
  const [peopleWithNotes, setPeopleWithNotes] = useState([]);
  const [peopleTaskInfo, setPeopleTaskInfo] = useState({}); // NEW: Task info for all people

  const handleOpenPerson = (person) => {
    setSelectedPerson(person);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setTimeout(() => setSelectedPerson(null), 300);
  };

  const handleOpenNotes = (person) => {
    setNotesDialogPerson(person);
    setNotesDialogOpen(true);
  };

  const handleCloseNotes = () => {
    setNotesDialogOpen(false);
    setTimeout(() => setNotesDialogPerson(null), 300);
  };

  // Function to load people task info
  const loadPeopleTaskInfo = async () => {
    const taskInfo = await getAllPeopleTaskInfo();
    setPeopleTaskInfo(taskInfo);
    
    // Also maintain backward compatibility with peopleWithNotes
    const withNotes = Object.keys(taskInfo).filter(
      id => taskInfo[id].hasNotes || taskInfo[id].hasTasks
    );
    setPeopleWithNotes(withNotes);
  };

  // Load people with notes and tasks
  useEffect(() => {
    if (people.length > 0) {
      loadPeopleTaskInfo();
    }
  }, [people]);

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

  const [openFilter, setOpenFilter] = useState(null);
  const filterRefs = useRef({});
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
        <Filter 
          size={14} 
          className={`cursor-pointer transition ${value !== 'All' ? 'text-[#f4d642]' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={() => setOpenFilter(openFilter === column ? null : column)}
        />
        {openFilter === column && createPortal(
          <div 
            ref={el => dropdownRefs.current[column] = el}
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`
            }}
          >
            <div className="py-1">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setOpenFilter(null);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    value === option.value ? 'bg-[#fffdf0] text-[#001740] font-semibold' : 'text-gray-700'
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = people.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Table container ref and pagination behavior
  const tableContainerRef = useRef(null);
  const [useFixedPagination, setUseFixedPagination] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = tableContainerRef.current;
      if (!el) return setUseFixedPagination(false);
      setUseFixedPagination(el.scrollHeight > el.clientHeight);
    };

    const t = setTimeout(check, 0);
    window.addEventListener('resize', check);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', check);
    };
  }, [people.length, itemsPerPage, currentPage]);

  // Observe pagination height changes (so scroller can subtract exact height)
  useEffect(() => {
    const el = paginationRef.current;
    if (!el) return;

    const measure = () => {
      const h = Math.ceil(el.getBoundingClientRect().height || 0);
      setPaginationHeight(h);
    };

    measure();

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        measure();
        // re-check overflow after pagination size change
        setTimeout(() => {
          const t = tableContainerRef.current;
          if (t) setUseFixedPagination(t.scrollHeight > t.clientHeight);
        }, 0);
      });
      ro.observe(el);
    } else {
      const handler = () => {
        measure();
        setTimeout(() => {
          const t = tableContainerRef.current;
          if (t) setUseFixedPagination(t.scrollHeight > t.clientHeight);
        }, 0);
      };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }

    return () => ro && ro.disconnect();
  }, [useFixedPagination]);

  // Measure action bar height so table headers can align exactly below it
  useEffect(() => {
    const el = actionBarRef.current;
    if (!el) return;

    const measure = () => {
      const h = Math.ceil(el.getBoundingClientRect().height || 0);
      setActionBarHeight(h);
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug('ShirtManagement actionBarHeight', h);
      }
    };

    measure();

    let ro;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(() => {
        measure();
        // re-check overflow after action bar size change
        setTimeout(() => {
          const t = tableContainerRef.current;
          if (t) setUseFixedPagination(t.scrollHeight > t.clientHeight);
        }, 0);
      });
      ro.observe(el);
    } else {
      const handler = () => {
        measure();
        setTimeout(() => {
          const t = tableContainerRef.current;
          if (t) setUseFixedPagination(t.scrollHeight > t.clientHeight);
        }, 0);
      };
      window.addEventListener('resize', handler);
      return () => window.removeEventListener('resize', handler);
    }

    return () => ro && ro.disconnect();
  }, []);

  return (
    <>
      {/* Print-only content */}
      <div className="print-content hidden" style={{ boxShadow: 'none', background: 'white' }}>
        <div className="p-8" style={{ boxShadow: 'none', background: 'white' }}>
          <h1 className="text-3xl font-bold mb-2">FFSC Anniversary Management</h1>
          <h2 className="text-xl font-semibold mb-1">Shirt Management View</h2>
          
          {/* Active Filters */}
          <div className="mb-4 text-sm text-gray-600">
            <strong>Active Filters:</strong>
            {shirtSearchTerm && ` Search: "${shirtSearchTerm}"`}
            {shirtFilterAge !== 'All' && ` | Age: ${shirtFilterAge}`}
            {shirtFilterLocation !== 'All' && ` | Location: ${shirtFilterLocation}`}
            {shirtFilterSize !== 'All' && ` | Size: ${shirtFilterSize}`}
            {shirtFilterPayment !== 'All' && ` | Payment: ${shirtFilterPayment}`}
            {shirtFilterDistribution !== 'All' && ` | Distribution: ${shirtFilterDistribution}`}
            {!shirtSearchTerm && shirtFilterAge === 'All' && shirtFilterLocation === 'All' && shirtFilterSize === 'All' && shirtFilterPayment === 'All' && shirtFilterDistribution === 'All' && ' None'}
          </div>
          
          <p className="mb-6 text-sm">Total: {people.length} {people.length === 1 ? 'person' : 'people'}</p>
          
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Age Bracket</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Shirt Size</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Payment</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td className="border border-gray-300 px-4 py-2">{person.firstName} {person.lastName}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.age}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.ageBracket}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.location}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.shirtSize || '—'}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.paid ? 'Paid' : 'Unpaid'}</td>
                  <td className="border border-gray-300 px-4 py-2">{person.shirtGiven ? 'Given' : 'Pending'}</td>
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
          viewTitle="Anniversary Shirt Management"
          searchTerm={shirtSearchTerm}
          setSearchTerm={setShirtSearchTerm}
          searchPlaceholder="Search by name..."
          onOpenPersonNotes={(personId) => {
            const person = people.find(p => p.id === personId);
            if (person) {
              handleOpenNotes(person);
            }
          }}
        />

        <div className="p-4 bg-white">
          <div className="sticky top-16 z-20 py-2 border-b border-gray-100 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Anniversary Shirt Management</h2>
                <p className="text-sm text-gray-600 mt-1">Track shirt payments, sizes, and distribution status</p>
              </div>
              <div className="text-sm text-gray-500 flex items-baseline gap-2">
                <Users size={18} className="text-gray-400" />
                <span className="font-semibold text-gray-900 text-lg">{people.length}</span>
                <span className="text-gray-500">{people.length === 1 ? 'person' : 'people'}</span>
              </div>
            </div>
          </div>



        {/* Table Section (fixed area) — scrollable content inside */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div
            className="relative overflow-y-auto"
            ref={tableContainerRef}
            style={{ maxHeight: 'calc(100vh - 12.7rem)' }}
          >
            <div ref={actionBarRef} className="sticky top-0 z-20 bg-white">
              <ShirtActionButtons
                hasActiveFilters={
                  shirtSearchTerm !== '' ||
                  shirtFilterAge !== 'All' || 
                  shirtFilterLocation !== 'All' || 
                  shirtFilterPayment !== 'All' || 
                  shirtFilterDistribution !== 'All' || 
                  shirtFilterSize !== 'All'
                }
                onResetFilters={onResetFilters}
                stats={[
                  { Icon: DollarSign, label: 'Paid', value: stats.paid },
                  { Icon: DollarSign, label: 'Unpaid', value: stats.unpaid },
                  { Icon: Package, label: 'Given', value: stats.shirtsGiven },
                  { Icon: Clock, label: 'Pending', value: stats.shirtsPending }
                ]}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border">
                  <tr>
                    <th className="px-4 py-1 border-r text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center">
                        <span>Name</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 border-r text-left text-sm font-semibold text-gray-700 sticky z-10">
                      <div className="flex items-center">
                        <span>Age</span>
                      </div>
                    </th>
                    <th className="px-4 py-2 border-r text-left text-sm font-semibold text-gray-700 sticky z-10">
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
                          value={shirtFilterAge}
                          onChange={setShirtFilterAge}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border-r text-left text-sm font-semibold text-gray-700">
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
                          value={shirtFilterLocation}
                          onChange={setShirtFilterLocation}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border-r text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Shirt Size</span>
                        <FilterDropdown 
                          column="shirtSize"
                          options={[
                            { value: 'All', label: 'All Sizes' },
                            { value: '#4 (XS) 1-2', label: '#4 (XS) 1-2' },
                            { value: '#6 (S) 3-4', label: '#6 (S) 3-4' },
                            { value: '#8 (M) 5-6', label: '#8 (M) 5-6' },
                            { value: '#10 (L) 7-8', label: '#10 (L) 7-8' },
                            { value: '#12 (XL) 9-10', label: '#12 (XL) 9-10' },
                            { value: '#14 (2XL) 11-12', label: '#14 (2XL) 11-12' },
                            { value: 'TS', label: 'TS' },
                            { value: 'XS', label: 'XS' },
                            { value: 'S', label: 'S' },
                            { value: 'M', label: 'M' },
                            { value: 'L', label: 'L' },
                            { value: 'XL', label: 'XL' },
                            { value: '2XL', label: '2XL' },
                            { value: 'None yet', label: 'None yet' }
                          ]}
                          value={shirtFilterSize}
                          onChange={setShirtFilterSize}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 border-r text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Payment Status</span>
                        <FilterDropdown 
                          column="payment"
                          options={[
                            { value: 'All', label: 'All Payment' },
                            { value: 'Paid', label: 'Paid' },
                            { value: 'Unpaid', label: 'Unpaid' }
                          ]}
                          value={shirtFilterPayment}
                          onChange={setShirtFilterPayment}
                        />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center justify-between">
                        <span>Distribution Status</span>
                        <FilterDropdown 
                          column="distribution"
                          options={[
                            { value: 'All', label: 'All Distribution' },
                            { value: 'Given', label: 'Given' },
                            { value: 'Pending', label: 'Pending' }
                          ]}
                          value={shirtFilterDistribution}
                          onChange={setShirtFilterDistribution}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((person, index) => (
                      <tr key={person.id} className={`hover:bg-blue-50 transition ${index % 2 === 1 ? 'bg-slate-50' : ''}`}>
                        <td className="px-4 py-3 text-left">
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPerson(person)}
                              className="text-left text-sm text-[#001740] hover:text-blue-700 transition font-medium focus:outline-none"
                              aria-label={`Open ${person.firstName} ${person.lastName} details`}
                            >
                              {person.firstName} {person.lastName}
                            </button>
                            {/* Notes/Task Indicators */}
                            {(() => {
                              const taskInfo = peopleTaskInfo[person.id];
                              
                              // Show task indicator if person has incomplete tasks
                              if (taskInfo?.incompleteTasksCount > 0) {
                                const priorityColor = 
                                  taskInfo.highestPriority === 'High' ? 'text-red-600' :
                                  taskInfo.highestPriority === 'Medium' ? 'text-yellow-600' :
                                  'text-green-600';
                                
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenNotes(person);
                                    }}
                                    className="p-1 hover:bg-blue-50 rounded transition group relative"
                                    aria-label="View tasks"
                                  >
                                    <CheckSquare size={14} className={`${priorityColor} hover:opacity-80 transition`} />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                      {taskInfo.incompleteTasksCount} incomplete task{taskInfo.incompleteTasksCount > 1 ? 's' : ''} ({taskInfo.highestPriority} priority)
                                      {taskInfo.notesCount > 0 && `, ${taskInfo.notesCount} note${taskInfo.notesCount > 1 ? 's' : ''}`}
                                    </span>
                                  </button>
                                );
                              }
                              
                              // Show completed task indicator if person has only completed tasks
                              if (taskInfo?.hasOnlyCompletedTasks) {
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenNotes(person);
                                    }}
                                    className="p-1 hover:bg-blue-50 rounded transition group relative"
                                    aria-label="View completed tasks"
                                  >
                                    <CheckCircle size={14} className="text-gray-400 hover:text-gray-600 transition" />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                      {taskInfo.completedTasksCount} completed task{taskInfo.completedTasksCount > 1 ? 's' : ''}
                                      {taskInfo.notesCount > 0 && `, ${taskInfo.notesCount} note${taskInfo.notesCount > 1 ? 's' : ''}`}
                                    </span>
                                  </button>
                                );
                              }
                              
                              // Show note indicator if person has only notes (no tasks)
                              if (taskInfo?.hasNotes) {
                                return (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenNotes(person);
                                    }}
                                    className="p-1 hover:bg-blue-50 rounded transition group relative"
                                    aria-label="View notes"
                                  >
                                    <StickyNote size={14} className="text-gray-400 hover:text-[#0f2a71] transition" />
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-50">
                                      {taskInfo.notesCount} note{taskInfo.notesCount > 1 ? 's' : ''}
                                    </span>
                                  </button>
                                );
                              }
                              
                              return null;
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{person.age}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{person.ageBracket}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{person.location}</div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={person.shirtSize || ''}
                            onChange={(e) => canManage && updateShirtSize(person.id, e.target.value)}
                            disabled={!canManage}
                            className={`px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${!canManage ? 'bg-gray-100 cursor-not-allowed' : ''}`}
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
                            onClick={() => canManage && toggleShirtPayment(person.id)}
                            disabled={!canManage}
                            className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                              person.paid
                                ? 'bg-green-600 text-white hover:bg-green-500'
                                : 'bg-red-600 text-white hover:bg-red-500'
                            } ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {person.paid ? 'Paid' : 'Unpaid'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => canManage && toggleShirtGiven(person.id)}
                            disabled={!canManage}
                            className={`px-4 py-1 rounded-full text-xs font-semibold transition ${
                              person.shirtGiven
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-yellow-500 text-white hover:bg-yellow-400'
                            } ${!canManage ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {person.shirtGiven ? 'Given' : 'Pending'}
                          </button>
                        </td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500">
                        No people found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
          </div>
        </div>


          {/* Inline pagination when table doesn't overflow */}
          {!useFixedPagination && (
            <div className="mt-4 px-4">
              <Pagination
                totalItems={people.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}

          {/* Fixed pagination when table overflows */}
          {useFixedPagination && (
            <div ref={paginationRef} className="absolute bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
              <Pagination
                totalItems={people.length}
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
        
        {/* Bottom padding for pagination visibility (only when pagination is inline) */}
        </div>
        {!useFixedPagination && <div className="h-16"></div>}
      </div>

      {/* Account details sidebar */}
      <div className="no-print">
        {sidebarOpen && (
          <AccountSidebar 
            person={selectedPerson} 
            open={sidebarOpen} 
            onClose={handleCloseSidebar}
            onNotesUpdate={loadPeopleTaskInfo}
          />
        )}
      </div>
      
      {/* Notes Dialog */}
      <div className="no-print">
        {notesDialogOpen && (
          <NotesDialog 
            person={notesDialogPerson} 
            isOpen={notesDialogOpen} 
            onClose={handleCloseNotes} 
          />
        )}
      </div>
    </>
  );
}