import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../Header';
import { useAuth } from '../auth/AuthProvider';
import FinanceSummary from './FinanceSummary';
import FundsTab from './FundsTab';
import ExpensesTab from './ExpensesTab';
import {
  fetchIncomeSources,
  fetchExpenseCategories,
  fetchExpenses,
  subscribeToFinanceChanges
} from '../../services/financeService';

// Shirt pricing for calculating shirt sales
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

export default function FinanceView({ people = [] }) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user can edit (admin or finance_manager)
  const canEdit = profile?.role === 'admin' || profile?.is_finance_manager === true;

  // Calculate shirt collection data from people
  const shirtCollectionData = useMemo(() => {
    const peopleWithShirts = people.filter(p =>
      p.shirtSize && p.shirtSize !== 'No shirt' && p.shirtSize !== 'Select Size' && p.shirtSize !== 'None yet' && p.shirtSize !== ''
    );

    const getShirtPrice = (size, hasPrint) => {
      if (!size) return 0;
      if (hasPrint) return SHIRT_PRICING.withPrint[size] || 0;
      return SHIRT_PRICING.plain[size] || 0;
    };

    const total = peopleWithShirts.reduce((sum, p) => sum + getShirtPrice(p.shirtSize, p.hasPrint), 0);
    const collected = peopleWithShirts.filter(p => p.paid).reduce((sum, p) => sum + getShirtPrice(p.shirtSize, p.hasPrint), 0);

    return { total, collected, pending: total - collected };
  }, [people]);

  // Load all finance data
  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [income, categories, exp] = await Promise.all([
        fetchIncomeSources(),
        fetchExpenseCategories(),
        fetchExpenses()
      ]);
      setIncomeSources(income);
      setExpenseCategories(categories);
      setExpenses(exp);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();

    // Subscribe to real-time changes
    const unsubscribe = subscribeToFinanceChanges(() => {
      loadFinanceData();
    });

    // Listen for manual refresh events
    const handleFinanceUpdate = () => loadFinanceData();
    window.addEventListener('financeUpdated', handleFinanceUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('financeUpdated', handleFinanceUpdate);
    };
  }, [loadFinanceData]);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'funds', label: 'Funds' },
    { id: 'expenses', label: 'Expenses' }
  ];

  return (
    <>
      <Header viewTitle="Finance" showSearch={false} />

      <div className="p-6 bg-[#f9fafa] min-h-screen">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#001740]">Finance Management</h1>
          <p className="text-sm text-gray-600 mt-1">Track funds, expenses, and overall event budget</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0f2a71] text-[#0f2a71]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && (
              <FinanceSummary
                incomeSources={incomeSources}
                expenses={expenses}
                expenseCategories={expenseCategories}
                shirtCollectionData={shirtCollectionData}
              />
            )}
            {activeTab === 'funds' && (
              <FundsTab
                fundSources={incomeSources}
                shirtCollectionData={shirtCollectionData}
                canEdit={canEdit}
                onRefresh={loadFinanceData}
              />
            )}
            {activeTab === 'expenses' && (
              <ExpensesTab
                expenses={expenses}
                expenseCategories={expenseCategories}
                canEdit={canEdit}
                onRefresh={loadFinanceData}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
