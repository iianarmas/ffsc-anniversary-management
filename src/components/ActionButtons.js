import React from 'react';
import { UserPlus, UserMinus, Printer } from 'lucide-react';

export default function ActionButtons({ 
  handleSelectAll, 
  selectedPeople, 
  filteredPeopleLength, 
  handleBulkRegister, 
  handleBulkRemove, 
  handlePrint 
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleSelectAll}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
      >
        {selectedPeople.length === filteredPeopleLength ? 'Deselect All' : 'Select All'}
      </button>
      <button
        onClick={handleBulkRegister}
        disabled={selectedPeople.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
      >
        <UserPlus size={18} />
        Add to Registered ({selectedPeople.length})
      </button>
      <button
        onClick={handleBulkRemove}
        disabled={selectedPeople.length === 0}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
      >
        <UserMinus size={18} />
        Remove ({selectedPeople.length})
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition ml-auto"
      >
        <Printer size={18} />
        Print List
      </button>
    </div>
  );
}