import React from 'react';

const ageColors = {
  Toddler: 'bg-pink-100 text-pink-800 border-pink-300',
  Kid: 'bg-blue-100 text-blue-800 border-blue-300',
  Youth: 'bg-purple-100 text-purple-800 border-purple-300',
  Adult: 'bg-green-100 text-green-800 border-green-300'
};

const locationColors = {
  Main: 'bg-orange-100 text-orange-800 border-orange-300',
  Cobol: 'bg-teal-100 text-teal-800 border-teal-300',
  Malacañang: 'bg-pink-100 text-pink-800 border-pink-300',
  Guest: 'bg-gray-100 text-gray-800 border-gray-300'
};

export default function PeopleTable({ 
  filteredAndSortedPeople, 
  selectedPeople, 
  handleSelectPerson, 
  handleSelectAll 
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedPeople.length === filteredAndSortedPeople.length && filteredAndSortedPeople.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Age Bracket</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedPeople.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedPeople.includes(person.id)}
                    onChange={() => handleSelectPerson(person.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {person.firstName} {person.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              Age: {person.age}
                            </div>
                            {person.registered && person.registeredAt && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ Checked in: {new Date(person.registeredAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${ageColors[person.ageBracket]}`}>
                    {person.ageBracket}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${locationColors[person.location]}`}>
                    {person.location}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {person.registered ? (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-300">
                      Checked In
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                      Pending
                    </span>
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
    </div>
  );
}