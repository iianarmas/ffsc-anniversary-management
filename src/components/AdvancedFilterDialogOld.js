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
  // ===== VIEW-SPECIFIC CONFIGURATIONS =====
  const isShirtView = viewType === 'shirts';
  const isRegistrationView = viewType === 'registration';
  // Core filter states
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [printStatus, setPrintStatus] = useState('All');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  
  // Shirt-specific states
  const [shirtSize, setShirtSize] = useState('All');
  const [distributionStatus, setDistributionStatus] = useState('All');
  const [ageBracket, setAgeBracket] = useState('All');
  const [registrationStatus, setRegistrationStatus] = useState('All');
  const [attendanceStatus, setAttendanceStatus] = useState('All');
  const [missingSize, setMissingSize] = useState(false);

  // Registration-specific states
  const [checkInStatus, setCheckInStatus] = useState('All');
  const [registrationDateFrom, setRegistrationDateFrom] = useState('');
  const [registrationDateTo, setRegistrationDateTo] = useState('');
  const [registeredBy, setRegisteredBy] = useState('All');
  const [missingInfo, setMissingInfo] = useState(false);
  const [hasShirtOrder, setHasShirtOrder] = useState('All');
  
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
        // No saved filters found
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
      // Reset shirt-specific filters
      setShirtSize('All');
      setDistributionStatus('All');
      setAgeBracket('All');
      setRegistrationStatus('All');
      setAttendanceStatus('All');
      setMissingSize(false);
      // Reset registration-specific filters
      setCheckInStatus('All');
      setRegistrationDateFrom('');
      setRegistrationDateTo('');
      setRegisteredBy('All');
      setMissingInfo(false);
      setHasShirtOrder('All');
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
      // For collections view: Only show people with actual shirt orders
      // For shirts view: Show all people (including those without sizes)
      if (!isShirtView) {
        if (!person.shirtSize || 
            person.shirtSize === 'No shirt' || 
            person.shirtSize === 'Select Size' || 
            person.shirtSize === 'None yet' ||
            person.shirtSize === '') {
          return false;
        }
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

      // === SHIRT-SPECIFIC FILTERS ===
      if (isShirtView) {
        // Shirt size filter
        if (shirtSize !== 'All' && person.shirtSize !== shirtSize) return false;
        
        // Distribution status filter
        if (distributionStatus !== 'All') {
          if (distributionStatus === 'Given' && !person.shirtGiven) return false;
          if (distributionStatus === 'Pending' && person.shirtGiven) return false;
        }
        
        // Age bracket filter
        if (ageBracket !== 'All' && person.ageBracket !== ageBracket) return false;
        
        // Registration status filter
        if (registrationStatus !== 'All') {
          const hasRegistration = person.registrationStatus === 'Registered' || person.checkInStatus === 'Checked In';
          if (registrationStatus === 'Registered' && !hasRegistration) return false;
          if (registrationStatus === 'Not Registered' && hasRegistration) return false;
        }
        
        // Attendance status filter
        if (attendanceStatus !== 'All') {
          if (attendanceStatus === 'attending' && person.attendanceStatus !== 'attending') return false;
          if (attendanceStatus === 'shirt_only' && person.attendanceStatus !== 'shirt_only') return false;
        }
        
        // Missing size filter
        if (missingSize) {
          const hasMissingSize = !person.shirtSize || 
                                 person.shirtSize === '' || 
                                 person.shirtSize === 'Select Size' || 
                                 person.shirtSize === 'None yet';
          if (!hasMissingSize) return false;
        }
      }

      // === REGISTRATION-SPECIFIC FILTERS ===
      if (isRegistrationView) {
        // Check-in status filter
        if (checkInStatus !== 'All') {
          if (checkInStatus === 'Checked In' && !person.registered) return false;
          if (checkInStatus === 'Pending' && person.registered) return false;
        }
        
        // Age bracket filter
        if (ageBracket !== 'All' && person.ageBracket !== ageBracket) return false;
        
        // Attendance status filter
        if (attendanceStatus !== 'All') {
          if (attendanceStatus === 'attending' && person.attendanceStatus !== 'attending') return false;
          if (attendanceStatus === 'shirt_only' && person.attendanceStatus !== 'shirt_only') return false;
        }
        
        // Registration date range filter
        if (registrationDateFrom || registrationDateTo) {
          if (person.registeredAt) {
            const regDate = new Date(person.registeredAt);
            if (registrationDateFrom && regDate < new Date(registrationDateFrom)) return false;
            if (registrationDateTo && regDate > new Date(registrationDateTo + 'T23:59:59')) return false;
          } else if (registrationDateFrom || registrationDateTo) {
            return false; // Exclude if no registration date when date filter is active
          }
        }
        
        // Has shirt order filter
        if (hasShirtOrder !== 'All') {
          const hasOrder = person.shirtSize && 
                          person.shirtSize !== '' && 
                          person.shirtSize !== 'No shirt' && 
                          person.shirtSize !== 'Select Size' &&
                          person.shirtSize !== 'None yet';
          if (hasShirtOrder === 'Yes' && !hasOrder) return false;
          if (hasShirtOrder === 'No' && hasOrder) return false;
        }
        
        // Missing info filter
        if (missingInfo) {
          const isMissing = !person.contactNumber || person.contactNumber === '';
          if (!isMissing) return false;
        }
      }

      return true;
    });
  }, [people, paymentStatus, printStatus, categories, locations, amountMin, amountMax, nameSearch, hasNotes, hasTasks, hasOverdueTasks, missingContact, peopleTaskInfo, isShirtView, shirtSize, distributionStatus, ageBracket, registrationStatus, attendanceStatus, missingSize, isRegistrationView, checkInStatus, registrationDateFrom, registrationDateTo, registeredBy, missingInfo, hasShirtOrder]);

  // Get result count color
  const getResultColor = () => {
    const count = filteredResults.length;
    if (count <= 10) return 'text-white bg-red-600';
    if (count <= 50) return 'text-white bg-[#db8916]';
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
    // Shirt-specific presets
    setDistributionStatus(preset.distributionStatus || 'All');
    setMissingSize(preset.missingSize || false);
    // Registration-specific presets
    setCheckInStatus(preset.checkInStatus || 'All');
    setAgeBracket(preset.ageBracket || 'All');
  };

  const quickPresets = isShirtView ? [
    { name: 'Pending Distribution', distributionStatus: 'Pending' },
    { name: 'Unpaid', paymentStatus: 'Unpaid' },
    { name: 'Missing Size', missingSize: true },
    { name: 'Main Location', locations: ['Main'] },
    { name: 'With Print', printStatus: 'With Print' }
  ] : isRegistrationView ? [
    { name: 'Checked In Today', checkInStatus: 'Checked In' },
    { name: 'Pending Check-in', checkInStatus: 'Pending' },
    { name: 'Kids & Youth', ageBracket: 'Kid' },
    { name: 'Main Location', locations: ['Main'] },
    { name: 'Has Tasks', hasTasks: true }
  ] : [
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
        hasOverdueTasks, missingContact,
        // Shirt-specific
        ...(isShirtView && {
          shirtSize, distributionStatus, ageBracket,
          registrationStatus, attendanceStatus, missingSize
        }),
        // Registration-specific
        ...(isRegistrationView && {
          checkInStatus, registrationDateFrom, registrationDateTo,
          registeredBy, missingInfo, hasShirtOrder, ageBracket, attendanceStatus
        })
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
    // Shirt-specific
    if (isShirtView) {
      setShirtSize(config.shirtSize || 'All');
      setDistributionStatus(config.distributionStatus || 'All');
      setAgeBracket(config.ageBracket || 'All');
      setRegistrationStatus(config.registrationStatus || 'All');
      setAttendanceStatus(config.attendanceStatus || 'All');
      setMissingSize(config.missingSize || false);
    }
    // Registration-specific
    if (isRegistrationView) {
      setCheckInStatus(config.checkInStatus || 'All');
      setRegistrationDateFrom(config.registrationDateFrom || '');
      setRegistrationDateTo(config.registrationDateTo || '');
      setRegisteredBy(config.registeredBy || 'All');
      setMissingInfo(config.missingInfo || false);
      setHasShirtOrder(config.hasShirtOrder || 'All');
      setAgeBracket(config.ageBracket || 'All');
      setAttendanceStatus(config.attendanceStatus || 'All');
    }
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
    // Shirt-specific
    if (isShirtView) {
      setShirtSize('All');
      setDistributionStatus('All');
      setAgeBracket('All');
      setRegistrationStatus('All');
      setAttendanceStatus('All');
      setMissingSize(false);
    }
    // Registration-specific
    if (isRegistrationView) {
      setCheckInStatus('All');
      setRegistrationDateFrom('');
      setRegistrationDateTo('');
      setRegisteredBy('All');
      setMissingInfo(false);
      setHasShirtOrder('All');
      setAgeBracket('All');
      setAttendanceStatus('All');
    }
  };

  // Apply filters
  const handleApplyFilters = () => {
    onApplyFilters({
      paymentStatus, printStatus, categories, locations,
      amountMin, amountMax, nameSearch, hasNotes, hasTasks,
      hasOverdueTasks, missingContact,
      // Shirt-specific
      ...(isShirtView && {
        shirtSize, distributionStatus, ageBracket,
        registrationStatus, attendanceStatus, missingSize
      }),
      // Registration-specific
      ...(isRegistrationView && {
        checkInStatus, registrationDateFrom, registrationDateTo,
        registeredBy, missingInfo, hasShirtOrder, ageBracket, attendanceStatus
      })
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
    missingContact,
    // Shirt-specific
    ...(isShirtView ? [
      shirtSize !== 'All',
      distributionStatus !== 'All',
      ageBracket !== 'All',
      registrationStatus !== 'All',
      attendanceStatus !== 'All',
      missingSize
    ] : []),
    // Registration-specific
    ...(isRegistrationView ? [
      checkInStatus !== 'All',
      registrationDateFrom !== '' || registrationDateTo !== '',
      registeredBy !== 'All',
      missingInfo,
      hasShirtOrder !== 'All',
      ageBracket !== 'All',
      attendanceStatus !== 'All'
    ] : [])
  ].filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal-backdrop flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-scale-in z-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e8edf7] rounded-lg">
              <Filter size={20} className="text-[#0f2a71]" />
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
              <Sparkles size={16} className="text-[#0f2a71]" />
              Quick Filters
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-[#e8edf7] hover:text-[#0f2a71] text-gray-700 rounded-lg text-sm font-medium transition border border-gray-200 hover:border-[#0f2a71]"
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
                          ? 'bg-[#0f2a71] text-white'
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
                          ? 'bg-[#0f2a71] text-white'
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
                          ? 'bg-[#0f2a71] text-white'
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
                          ? 'bg-[#0f2a71] text-white'
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

              {/* === SHIRT-SPECIFIC FILTERS === */}
              {isShirtView && (
                <>
                  {/* Shirt Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shirt Size</label>
                    <select
                      value={shirtSize}
                      onChange={(e) => setShirtSize(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="All">All Sizes</option>
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
                      <option value="No shirt">No shirt</option>
                      <option value="None yet">None yet</option>
                    </select>
                  </div>

                  {/* Distribution Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Status</label>
                    <div className="flex gap-2">
                      {['All', 'Given', 'Pending'].map(status => (
                        <button
                          key={status}
                          onClick={() => setDistributionStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            distributionStatus === status
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Bracket */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Bracket</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Toddler', 'Kid', 'Youth', 'Adult'].map(bracket => (
                        <button
                          key={bracket}
                          onClick={() => setAgeBracket(bracket)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            ageBracket === bracket
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {bracket}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registration Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Status</label>
                    <div className="flex gap-2">
                      {['All', 'Registered', 'Not Registered'].map(status => (
                        <button
                          key={status}
                          onClick={() => setRegistrationStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            registrationStatus === status
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Status</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'All', label: 'All' },
                        { value: 'attending', label: 'Attending Event' },
                        { value: 'shirt_only', label: 'Shirt Only' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setAttendanceStatus(option.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            attendanceStatus === option.value
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* === REGISTRATION-SPECIFIC FILTERS === */}
              {isRegistrationView && (
                <>
                  {/* Check-in Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Status</label>
                    <div className="flex gap-2">
                      {['All', 'Checked In', 'Pending'].map(status => (
                        <button
                          key={status}
                          onClick={() => setCheckInStatus(status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            checkInStatus === status
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Bracket */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age Bracket</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Toddler', 'Kid', 'Youth', 'Adult'].map(bracket => (
                        <button
                          key={bracket}
                          onClick={() => setAgeBracket(bracket)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            ageBracket === bracket
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {bracket}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attendance Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Status</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'All', label: 'All' },
                        { value: 'attending', label: 'Attending Event' },
                        { value: 'shirt_only', label: 'Shirt Only' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => setAttendanceStatus(option.value)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            attendanceStatus === option.value
                              ? 'bg-[#0f2a71] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Registration Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date Range</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={registrationDateFrom}
                        onChange={(e) => setRegistrationDateFrom(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="date"
                        value={registrationDateTo}
                        onChange={(e) => setRegistrationDateTo(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Has Shirt Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Has Shirt Order</label>
                    <div className="flex gap-2">
                      {['All', 'Yes', 'No'].map(option => (
                        <button
                          key={option}
                          onClick={() => setHasShirtOrder(option)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            hasShirtOrder === option
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
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
                
                {/* Shirt-specific checkbox */}
                {isShirtView && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingSize}
                      onChange={(e) => setMissingSize(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Missing shirt size</span>
                  </label>
                )}
                
                {/* Registration-specific checkbox */}
                {isRegistrationView && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={missingInfo}
                      onChange={(e) => setMissingInfo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-blue-500"
                    />
                    <span className="text-sm text-gray-700">Missing contact info</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Save Filter Section */}
          <div className="mb-6">
            <button
              onClick={() => setShowSaveSection(!showSaveSection)}
              className="text-sm font-semibold text-[#0f2a71] hover:text-[#1c3b8d] flex items-center gap-2 mb-3"
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0f2a71]"
                />
                <button
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim()}
                  className="px-4 py-2 bg-[#0f2a71] text-white rounded-lg text-sm font-medium hover:bg-[#1c3b8d] transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex-1 text-left text-sm font-medium text-gray-700 hover:text-[#0f2a71] transition"
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
              className="flex-1 px-4 py-2.5 bg-[#0f2a71] text-white rounded-lg font-medium hover:bg-[#1c3b8d] transition flex items-center justify-center gap-2"
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