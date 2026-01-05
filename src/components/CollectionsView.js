import React, { useMemo, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, Download, Filter, Search } from 'lucide-react';

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

export default function CollectionsView({ people }) {
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

  // Calculate collection statistics
  const collectionStats = useMemo(() => {
    // Only include people with actual shirt sizes (not "No shirt", "Select Size", etc.)
    const peopleWithShirts = people.filter(p => 
      p.shirtSize && 
      p.shirtSize !== 'No shirt' && 
      p.shirtSize !== 'Select Size' && 
      p.shirtSize !== 'None yet'
    );

    // Debug: Log first person to see data structure
    if (peopleWithShirts.length > 0) {
      console.log('First person with shirt:', peopleWithShirts[0]);
      console.log('Shirt size:', peopleWithShirts[0].shirtSize);
      console.log('Has print:', peopleWithShirts[0].hasPrint);
      console.log('Is paid:', peopleWithShirts[0].paid);
      console.log('Calculated price:', getShirtPrice(peopleWithShirts[0].shirtSize, peopleWithShirts[0].hasPrint, peopleWithShirts[0].paid));
    }

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

    // Breakdown by category
    const byCategory = { Kids: 0, Teen: 0, Adult: 0 };
    const byCategoryCollected = { Kids: 0, Teen: 0, Adult: 0 };
    
    peopleWithShirts.forEach(person => {
      const category = getSizeCategory(person.shirtSize);
      const price = getShirtPrice(person.shirtSize, person.hasPrint, false);
      byCategory[category] += price;
      if (person.paid) {
        const paidPrice = getShirtPrice(person.shirtSize, person.hasPrint, true);
        byCategoryCollected[category] += paidPrice;
      }
    });

    // Breakdown by print status
    const withPrint = peopleWithShirts.filter(p => p.hasPrint).reduce((sum, p) => 
      sum + getShirtPrice(p.shirtSize, p.hasPrint, false), 0);
    const withPrintCollected = peopleWithShirts.filter(p => p.hasPrint && p.paid).reduce((sum, p) => 
      sum + getShirtPrice(p.shirtSize, p.hasPrint, true), 0);
    
    const plain = peopleWithShirts.filter(p => !p.hasPrint).reduce((sum, p) => 
      sum + getShirtPrice(p.shirtSize, p.hasPrint, false), 0);
    const plainCollected = peopleWithShirts.filter(p => !p.hasPrint && p.paid).reduce((sum, p) => 
      sum + getShirtPrice(p.shirtSize, p.hasPrint, true), 0);

    // Count orders
    const totalOrders = peopleWithShirts.length;
    const paidOrders = peopleWithShirts.filter(p => p.paid).length;
    const unpaidOrders = totalOrders - paidOrders;

    return {
      totalToCollect,
      collected,
      outstanding,
      collectionProgress,
      byCategory,
      byCategoryCollected,
      withPrint,
      withPrintCollected,
      plain,
      plainCollected,
      totalOrders,
      paidOrders,
      unpaidOrders
    };
  }, [people]);

  // Filtered people for the table
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      // Only show people with actual shirt orders
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

  // Export to CSV
  const handleExport = () => {
    const headers = ['Name', 'Size', 'Category', 'Print Status', 'Amount', 'Payment Status'];
    const rows = filteredPeople.map(person => [
      `${person.firstName} ${person.lastName}`,
      person.shirtSize,
      getSizeCategory(person.shirtSize),
      person.hasPrint ? 'With Print' : 'Plain',
      `₱${getShirtPrice(person.shirtSize, person.hasPrint)}`,
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

  const formatCurrency = (amount) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <>
      {/* Header with Logo */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <img 
            src="/church-logo.svg" 
            alt="FFSC Logo" 
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <div>
            <h1 style={{ fontFamily: 'Moderniz, sans-serif' }} className="text-2xl font-bold text-[#001740]">
              FFSC20
            </h1>
            <p className="text-sm text-gray-600">Payment Collections</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Collections</h2>
          <p className="text-sm text-gray-500">Track shirt order payments and collections for the supplier</p>
        </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total to Collect</span>
            <DollarSign size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(collectionStats.totalToCollect)}</div>
          <div className="text-xs text-gray-500 mt-1">{collectionStats.totalOrders} orders</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Amount Collected</span>
            <TrendingUp size={18} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(collectionStats.collected)}</div>
          <div className="text-xs text-gray-500 mt-1">{collectionStats.paidOrders} paid</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Outstanding</span>
            <AlertCircle size={18} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(collectionStats.outstanding)}</div>
          <div className="text-xs text-gray-500 mt-1">{collectionStats.unpaidOrders} unpaid</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Collection Progress</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{collectionStats.collectionProgress.toFixed(1)}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${collectionStats.collectionProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* By Category */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Collection by Category</h3>
          <div className="space-y-3">
            {['Kids', 'Teen', 'Adult'].map(category => (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{category}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(collectionStats.byCategoryCollected[category])} / {formatCurrency(collectionStats.byCategory[category])}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${collectionStats.byCategory[category] > 0 
                        ? (collectionStats.byCategoryCollected[category] / collectionStats.byCategory[category]) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Print Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Collection by Print Status</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">With Print</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(collectionStats.withPrintCollected)} / {formatCurrency(collectionStats.withPrint)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${collectionStats.withPrint > 0 
                      ? (collectionStats.withPrintCollected / collectionStats.withPrint) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">Plain</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(collectionStats.plainCollected)} / {formatCurrency(collectionStats.plain)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${collectionStats.plain > 0 
                      ? (collectionStats.plainCollected / collectionStats.plain) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select
            value={filterPrint}
            onChange={(e) => setFilterPrint(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Print Status</option>
            <option value="With Print">With Print</option>
            <option value="Plain">Plain</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Categories</option>
            <option value="Kids">Kids</option>
            <option value="Teen">Teen</option>
            <option value="Adult">Adult</option>
          </select>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Payment Details Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Print</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPeople.map((person) => {
                const price = getShirtPrice(person.shirtSize, person.hasPrint, person.paid);
                const category = getSizeCategory(person.shirtSize);
                
                return (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {person.firstName} {person.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{person.shirtSize}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{category}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {person.hasPrint ? 'With Print' : 'Plain'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(price)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        person.paid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {person.paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredPeople.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No shirt orders found
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}