import React, { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';



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
  onOpenPerson = () => {},
  stickyTop = 60
}) {
  // debug: show stickyTop in dev console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('PeopleTable stickyTop', stickyTop);
  }
  const [openFilter, setOpenFilter] = useState(null);
  const filterRefs = useRef({});
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && filterRefs.current[openFilter] && !filterRefs.current[openFilter].contains(event.target)) {
        setOpenFilter(null);
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

  const FilterDropdown = ({ column, options, value, onChange }) => (
    <div className="relative" ref={el => filterRefs.current[column] = el}>
      <Filter 
        size={14} 
        className={`cursor-pointer transition ${value !== 'All' ? 'text-[#f4d642]' : 'text-gray-400 hover:text-gray-600'}`}
        onClick={() => setOpenFilter(openFilter === column ? null : column)}
      />
      {openFilter === column && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
          <thead>
            <tr>
              <th className="px-2 py-1 text-left border w-12 text-center">
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
                <tr key={person.id} className={`hover:bg-blue-50 transition ${index % 2 === 1 ? 'bg-slate-50' : ''}`}>
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
                    <div className="font-medium text-gray-900">
                      <button
                        onClick={() => onOpenPerson(person)}
                        className="text-left w-full text-sm text-[#001740] hover:text-blue-700 transition font-medium focus:outline-none"
                        aria-label={`Open ${person.firstName} ${person.lastName} details`}
                      >
                        {person.firstName} {person.lastName}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.age}</div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.ageBracket}</div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    <div className="text-sm text-gray-700">{person.location}</div>
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    {person.registered ? (
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-700 text-white">
                        Checked In
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-left border-r">
                    {person.registered && person.registeredAt ? (
                      <div className="text-xs text-gray-600">
                        {new Date(person.registeredAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500">
                  No people found matching your search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}