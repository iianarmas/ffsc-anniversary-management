import React, { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Download, Search, Filter, X } from 'lucide-react';
import Header from './Header';
import Avatar from './Avatar';
import { useAuth } from './auth/AuthProvider';

const SHIRT_PRICING = {
  plain: {
    '#4 (XS) 1-2': 86,
    '#6 (S) 3-4': 89,
    '#8 (M) 5-6': 92,
    '#10 (L) 7-8': 94,
    '#12 (XL) 9-10': 97,
    '#14 (2XL) 11-12': 99,
    'TS': 105,
    'XS': 109,
    'S': 115,
    'M': 119,
    'L': 123,
    'XL': 127,
    '2XL': 131
  },
  withPrint: {
    '#4 (XS) 1-2': 220,
    '#6 (S) 3-4': 220,
    '#8 (M) 5-6': 220,
    '#10 (L) 7-8': 220,
    '#12 (XL) 9-10': 220,
    '#14 (2XL) 11-12': 220,
    'TS': 220,
    'XS': 240,
    'S': 240,
    'M': 240,
    'L': 240,
    'XL': 240,
    '2XL': 240
  }
};

export default function MobileCollectionsView({ people }) {
  const { profile } = useAuth();
  const getShirtPrice = (size, hasPrint, isPaid) => {
    if (!size || size === 'No shirt' || size === 'Select Size' || size === 'None yet' || size === '') return 0;
    
    if (hasPrint) {
      return SHIRT_PRICING.withPrint[size] || 0;
    }
    return SHIRT_PRICING.plain[size] || 0;
  };
  
  const getSizeCategory = (size) => {
    if (!size || size === 'No shirt' || size === 'Select Size' || size === 'None yet' || size === '') return 'No Order';
    
    const kidsSizes = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12'];
    const teenSizes = ['TS'];
    const adultSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    
    if (kidsSizes.includes(size)) return 'Kids';
    if (teenSizes.includes(size)) return 'Teen';
    if (adultSizes.includes(size)) return 'Adult';
    
    return 'Adult';
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('All');
  const [filterPrint, setFilterPrint] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate collection statistics
  const collectionStats = useMemo(() => {
    const peopleWithShirts = people.filter(p => 
      p.shirtSize && 
      p.shirtSize !== 'No shirt' && 
      p.shirtSize !== 'Select Size' && 
      p.shirtSize !== 'None yet'
    );

    const totalToCollect = peopleWithShirts.reduce((sum, person) => {
      const price = getShirtPrice(person.shirtSize, person.hasPrint, false);
      return sum + price;
    }, 0);

    const collected = peopleWithShirts
      .filter(p => p.paid)
      .reduce((sum, person) => {
        const price = getShirtPrice(person.shirtSize, person.hasPrint, true);
        return sum + price;
      }, 0);

    const outstanding = totalToCollect - collected;
    const collectionProgress = totalToCollect > 0 ? (collected / totalToCollect) * 100 : 0;

    const totalOrders = peopleWithShirts.length;
    const paidOrders = peopleWithShirts.filter(p => p.paid).length;
    const unpaidOrders = totalOrders - paidOrders;

    return {
      totalToCollect,
      collected,
      outstanding,
      collectionProgress,
      totalOrders,
      paidOrders,
      unpaidOrders
    };
  }, [people]);

  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      if (!person.shirtSize || 
          person.shirtSize === 'No shirt' || 
          person.shirtSize === 'Select Size' || 
          person.shirtSize === 'None yet') {
        return false;
      }

      const matchesSearch = searchTerm === '' || 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPayment = filterPayment === 'All' || 
        (filterPayment === 'Paid' ? person.paid : !person.paid);
      
      const matchesPrint = filterPrint === 'All' || 
        (filterPrint === 'With Print' ? person.hasPrint : !person.hasPrint);
      
      const category = getSizeCategory(person.shirtSize);
      const matchesCategory = filterCategory === 'All' || category === filterCategory;

      return matchesSearch && matchesPayment && matchesPrint && matchesCategory;
    }).sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [people, searchTerm, filterPayment, filterPrint, filterCategory]);

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleExport = () => {
    const headers = ['Name', 'Size', 'Category', 'Print', 'Amount', 'Status'];
    const rows = filteredPeople.map(person => [
      `${person.firstName} ${person.lastName}`,
      person.shirtSize,
      getSizeCategory(person.shirtSize),
      person.hasPrint ? 'With Print' : 'Plain',
      `₱${getShirtPrice(person.shirtSize, person.hasPrint, person.paid)}`,
      person.paid ? 'Paid' : 'Unpaid'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shirt-collections-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const activeFilterCount = [filterPayment, filterPrint, filterCategory].filter(f => f !== 'All').length;

  return (
    <>
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
              <p className="text-xs text-gray-500 mt-0.5">Collections</p>
            </div>
          </div>
          <Avatar 
            src={profile?.avatar_url} 
            name={profile?.full_name}
            size="md"
          />
        </div>
        </div>

      <div className="pt-14 pb-20">

      {/* Stats Cards */}
      <div className="p-4 space-y-3">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              <span className="text-sm text-gray-600">Total to Collect</span>
            </div>
            <span className="text-xs text-gray-500">{collectionStats.totalOrders} orders</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(collectionStats.totalToCollect)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-gray-600">Collected</span>
            </div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(collectionStats.collected)}</div>
            <div className="text-xs text-gray-500 mt-1">{collectionStats.paidOrders} paid</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-orange-500" />
              <span className="text-xs text-gray-600">Outstanding</span>
            </div>
            <div className="text-lg font-bold text-orange-600">{formatCurrency(collectionStats.outstanding)}</div>
            <div className="text-xs text-gray-500 mt-1">{collectionStats.unpaidOrders} unpaid</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Collection Progress</span>
            <span className="text-lg font-bold text-blue-600">{collectionStats.collectionProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${collectionStats.collectionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="px-4 pb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm font-medium ${
              activeFilterCount > 0
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <Filter size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium text-sm flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-900">Filters</span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Print Status</label>
              <select
                value={filterPrint}
                onChange={(e) => setFilterPrint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="All">All Print Status</option>
                <option value="With Print">With Print</option>
                <option value="Plain">Plain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="All">All Categories</option>
                <option value="Kids">Kids</option>
                <option value="Teen">Teen</option>
                <option value="Adult">Adult</option>
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setFilterPayment('All');
                  setFilterPrint('All');
                  setFilterCategory('All');
                }}
                className="w-full px-4 py-2 text-sm text-blue-600 font-medium"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Payment List */}
      <div className="px-4 space-y-2 pb-4">
        {filteredPeople.map((person) => {
          const price = getShirtPrice(person.shirtSize, person.hasPrint, person.paid);
          const category = getSizeCategory(person.shirtSize);
          
          return (
            <div key={person.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {person.firstName} {person.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                    <span>{person.shirtSize}</span>
                    <span>•</span>
                    <span>{category}</span>
                    <span>•</span>
                    <span>{person.hasPrint ? 'With Print' : 'Plain'}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  person.paid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {person.paid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(price)}</div>
            </div>
          );
        })}

        {filteredPeople.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No shirt orders found</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}