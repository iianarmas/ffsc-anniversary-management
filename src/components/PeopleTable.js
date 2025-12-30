import React, { useState, useRef, useEffect } from 'react';
import { Filter } from 'lucide-react';



export default function PeopleTable({ 
  filteredAndSortedPeople, 
  selectedPeople, 
  handleSelectPerson, 
  handleSelectAll,
  filterAge,
  setFilterAge,
  filterLocation,
  setFilterLocation,
  filterStatus,
  setFilterStatus,
  stickyTop = 60
}) {
  // debug: show stickyTop in dev console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('PeopleTable stickyTop', stickyTop);
  }
  const [openFilter, setOpenFilter] = useState(null);
  const filterRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openFilter && filterRefs.current[openFilter] && !filterRefs.current[openFilter].contains(event.target)) {
        setOpenFilter(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilter]);

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
                  type="checkbox"
                  checked={selectedPeople.length === filteredAndSortedPeople.length && filteredAndSortedPeople.length > 0}
                  onChange={() => {
                    if (selectedPeople.length === filteredAndSortedPeople.length) {
                      // If all selected, deselect all
                      filteredAndSortedPeople.forEach(person => handleSelectPerson(person.id));
                    } else {
                      // Otherwise, select all
                      handleSelectAll();
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
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
            {filteredAndSortedPeople.map((person, index) => (
              <tr key={person.id} className={`hover:bg-blue-50 transition ${index % 2 === 1 ? 'bg-slate-50' : ''}`}>
                <td className="px-3 py-3 border-r border-l text-center w-30">
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person.id)}
                    onChange={() => handleSelectPerson(person.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-left border-r">
                  <div className="font-medium text-gray-900">
                    {person.firstName} {person.lastName}
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
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedPeople.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No people found matching your search criteria
        </div>
      )}
    </>
  );
}