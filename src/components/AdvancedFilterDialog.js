import React, { useState, useEffect, useMemo } from 'react';
import { X, Filter, Sparkles, Save, Trash2 } from 'lucide-react';

export default function AdvancedFilterDialog({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  people = [],
  viewType = 'collections',
  peopleTaskInfo = {}
}) {
  // Core filter states
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [printStatus, setPrintStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  
  // Advanced filter states
  const [nameSearch, setNameSearch] = useState('');
  const [hasNotes, setHasNotes] = useState(false);
  const [hasTasks, setHasTasks] = useState(false);
  const [hasOverdueTasks, setHasOverdueTasks] = useState(false);
  const [missingContact, setMissingContact] = useState(false);
  
  // UI states
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveSection, setShowSaveSection] = useState(false);

  // Load saved filters from storage
  useEffect(() => {
    const loadSavedFilters = async () => {
      try {
        const storageKey = `advanced-filters-${viewType}`;
        const result = await window.storage.get(storageKey);
        if (result) {
          const filters = JSON.parse(result.value);
          setSavedFilters(filters);
        }
      } catch (error) {
        console.log('No saved filters found');
      }
    };
    
    if (isOpen) {
      loadSavedFilters();
    }
  }, [isOpen, viewType]);

  // Reset filters when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setPaymentStatus('All');
      setPrintStatus('All');
      setCategories([]);
      setLocations([]);
      setAmountMin('');
      setAmountMax('');
      setNameSearch('');
      setHasNotes(false);
      setHasTasks(false);
      setHasOverdueTasks(false);
      setMissingContact(false);
      setShowSaveSection(false);
      setFilterName('');
    }
  }, [isOpen]);

  // Helper functions
  const getShirtPrice = (person) => {
    if (!person.shirtSize || person.shirtSize === 'No shirt' || person.shirtSize === 'Select Size' || person.shirtSize === '') return 0;
    
    const SHIRT_PRICING = {
      plain: {
        '#4 (XS) 1-2': 86, '#6 (S) 3-4': 89, '#8 (M) 5-6': 92, '#10 (L) 7-8': 94,
        '#12 (XL) 9-10': 97, '#14 (2XL) 11-12': 99, 'TS': 105, 'XS': 109,
        'S': 115, 'M': 119, 'L': 123, 'XL': 127, '2XL': 131
      },
      withPrint: {
        '#4 (XS) 1-2': 220, '#6 (S) 3-4': 220, '#8 (M) 5-6': 220, '#10 (L) 7-8': 220,
        '#12 (XL) 9-10': 220, '#14 (2XL) 11-12': 220, 'TS': 220, 'XS': 240,
        'S': 240, 'M': 240, 'L': 240, 'XL': 240, '2XL': 240
      }
    };
    
    if (person.hasPrint) {
      return SHIRT_PRICING.withPrint[person.shirtSize] || 0;
    }
    return SHIRT_PRICING.plain[person.shirtSize] || 0;
  };

  const getSizeCategory = (size) => {
    if (!size || size === 'No shirt' || size === 'Select Size' || size === '') return 'No Order';
    const kidsSizes = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12'];
    const teenSizes = ['TS'];
    if (kidsSizes.includes(size)) return 'Kids';
    if (teenSizes.includes(size)) return 'Teen';
    return 'Adult';
  };

  // Calculate filtered results in real-time
  const filteredResults = useMemo(() => {
    return people.filter(person => {
      // Only show people with actual shirt orders for collections view
      if (!person.shirtSize || 
          person.shirtSize === 'No shirt' || 
          person.shirtSize === 'Select Size' || 
          person.shirtSize === 'None yet' ||
          person.shirtSize === '') {
        return false;
      }

      // Payment status filter
      if (paymentStatus !== 'All') {
        if (paymentStatus === 'Paid' && !person.paid) return false;
        if (paymentStatus === 'Unpaid' && person.paid) return false;
      }

      // Print status filter
      if (printStatus !== 'All') {
        if (printStatus === 'With Print' && !person.hasPrint) return false;
        if (printStatus === 'Plain' && person.hasPrint) return false;
      }

      // Category filter (Kids/Teen/Adult)
      if (categories.length > 0) {
        const category = getSizeCategory(person.shirtSize);
        if (!categories.includes(category)) return false;
      }

      // Location filter
      if (locations.length > 0) {
        if (!locations.includes(person.location)) return false;
      }

      // Amount range filter
      if (amountMin !== '' || amountMax !== '') {
        const price = getShirtPrice(person);
        const min = parseFloat(amountMin) || 0;
        const max = parseFloat(amountMax) || Infinity;
        if (price < min || price > max) return false;
      }

      // Name search
      if (nameSearch !== '') {
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
        if (!fullName.includes(nameSearch.toLowerCase())) return false;
      }

      // Task/Notes filters
      const taskInfo = peopleTaskInfo[person.id] || {};
      if (hasNotes && !taskInfo.hasNotes) return false;
      if (hasTasks && !taskInfo.hasTasks) return false;
      if (hasOverdueTasks) {
        if (!taskInfo.hasTasks || taskInfo.incompleteTasksCount === 0) return false;
      }

      // Missing contact info
      if (missingContact && person.contactNumber) return false;

      return true;
    });
  }, [people, paymentStatus, printStatus, categories, locations, amountMin, amountMax, nameSearch, hasNotes, hasTasks, hasOverdueTasks, missingContact, peopleTaskInfo]);

  // Get result count color
  const getResultColor = () => {
    const count = filteredResults.length;
    if (count <= 10) return 'text-white bg-red-600';
    if (count <= 50) return 'text-white bg-orange-500';
    return 'text-white bg-green-600';
  };

  // Quick preset functions
  const applyPreset = (preset) => {
    setPaymentStatus(preset.paymentStatus || 'All');
    setPrintStatus(preset.printStatus || 'All');
    setCategories(preset.categories || []);
    setLocations(preset.locations || []);
    setHasOverdueTasks(preset.hasOverdueTasks || false);
    setHasNotes(preset.hasNotes || false);
    setHasTasks(preset.hasTasks || false);
  };

  const quickPresets = [
    { name: 'Unpaid Orders', paymentStatus: 'Unpaid' },
    { name: 'High Priority', hasOverdueTasks: true },
    { name: 'Main Location', locations: ['Main'] },
    { name: 'With Print', printStatus: 'With Print' },
    { name: 'Has Notes/Tasks', hasNotes: true, hasTasks: true }
  ];

  // Save filter
  const handleSaveFilter = async () => {
    if (!filterName.trim()) return;
    
    const newFilter = {
      id: Date.now(),
      name: filterName.trim(),
      config: {
        paymentStatus, printStatus, categories, locations,
        amountMin, amountMax, nameSearch, hasNotes, hasTasks,
        hasOverdueTasks, missingContact
      }
    };
    
    const updatedFilters = [...savedFilters, newFilter];
    setSavedFilters(updatedFilters);
    
    try {
      const storageKey = `advanced-filters-${viewType}`;
      await window.storage.set(storageKey, JSON.stringify(updatedFilters));
      setFilterName('');
      setShowSaveSection(false);
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  // Load saved filter
  const loadSavedFilter = (filter) => {
    const config = filter.config;
    setPaymentStatus(config.paymentStatus || 'All');
    setPrintStatus(config.printStatus || 'All');
    setCategories(config.categories || []);
    setLocations(config.locations || []);
    setAmountMin(config.amountMin || '');
    setAmountMax(config.amountMax || '');
    setNameSearch(config.nameSearch || '');
    setHasNotes(config.hasNotes || false);
    setHasTasks(config.hasTasks || false);
    setHasOverdueTasks(config.hasOverdueTasks || false);
    setMissingContact(config.missingContact || false);
  };

  // Delete saved filter
  const deleteSavedFilter = async (filterId) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(updatedFilters);
    
    try {
      const storageKey = `advanced-filters-${viewType}`;
      await window.storage.set(storageKey, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPaymentStatus('All');
    setPrintStatus('All');
    setCategories([]);
    setLocations([]);
    setAmountMin('');
    setAmountMax('');
    setNameSearch('');
    setHasNotes(false);
    setHasTasks(false);
    setHasOverdueTasks(false);
    setMissingContact(false);
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters({
      paymentStatus, printStatus, categories, locations,
      amountMin, amountMax, nameSearch, hasNotes, hasTasks,
      hasOverdueTasks, missingContact
    });
  };

  // Toggle category
  const toggleCategory = (category) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle location
  const toggleLocation = (location) => {
    setLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  // Active filters count
  const activeFiltersCount = [
    paymentStatus !== 'All',
    printStatus !== 'All',
    categories.length > 0,
    locations.length > 0,
    amountMin !== '' || amountMax !== '',
    nameSearch !== '',
    hasNotes,
    hasTasks,
    hasOverdueTasks,
    missingContact
  ].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Filter size={20} className="text-purple-800" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#001740]">Advanced Filters</h2>
              <p className="text-sm text-gray-500">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active` : 'No filters applied'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Quick Presets */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-800" />
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200 hover:border-purple-300"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Core Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Core Filters</h3>
            <div className="space-y-4">
              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <div className="flex gap-2">
                  {['All', 'Paid', 'Unpaid'].map(status => (
                    <button
                      key={status}
                      onClick={() => setPaymentStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        paymentStatus === status
                          ? 'bg-sky-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Print Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Print Status</label>
                <div className="flex gap-2">
                  {['All', 'With Print', 'Plain'].map(status => (
                    <button
                      key={status}
                      onClick={() => setPrintStatus(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        printStatus === status
                          ? 'bg-purple-800 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="flex gap-2">
                  {['Kids', 'Teen', 'Adult'].map(category => (
                    <label
                      key={category}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                        categories.includes(category)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="sr-only"
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <div className="flex flex-wrap gap-2">
                  {['Main', 'Cobol', 'Malacañang', 'Guest'].map(location => (
                    <label
                      key={location}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                        locations.includes(location)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={locations.includes(location)}
                        onChange={() => toggleLocation(location)}
                        className="sr-only"
                      />
                      {location}
                    </label>
                  ))}
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min (₱)"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    placeholder="Max (₱)"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Advanced Options</h3>
            <div className="space-y-4">
              {/* Name Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name Search</label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasNotes}
                    onChange={(e) => setHasNotes(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has notes/tasks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTasks}
                    onChange={(e) => setHasTasks(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has tasks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOverdueTasks}
                    onChange={(e) => setHasOverdueTasks(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Has overdue tasks</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={missingContact}
                    onChange={(e) => setMissingContact(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                  />
                  <span className="text-sm text-gray-700">Missing contact info</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Filter Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowSaveSection(!showSaveSection)}
              className="text-sm font-semibold text-purple-800 hover:text-purple-700 flex items-center gap-2 mb-3"
            >
              <Save size={16} />
              {showSaveSection ? 'Hide' : 'Save'} This Filter
            </button>
            
            {showSaveSection && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                  className="px-4 py-2 bg-purple-800 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Saved Filters</h3>
              <div className="space-y-2">
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <button
                      onClick={() => loadSavedFilter(filter)}
                      className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-purple-600 transition"
                    >
                      {filter.name}
                    </button>
                    <button
                      onClick={() => deleteSavedFilter(filter.id)}
                      className="p-1 hover:bg-red-100 rounded transition"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {/* Live Results Counter */}
          <div className={`mb-4 p-3 rounded-lg font-semibold text-center ${getResultColor()}`}>
            <span className={'h-3 w-3 bg-white rounded-full inline-block'}/> Live Results: {filteredResults.length} {filteredResults.length === 1 ? 'person' : 'people'} found
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={clearAllFilters}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2.5 bg-purple-800 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <Filter size={18} />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}