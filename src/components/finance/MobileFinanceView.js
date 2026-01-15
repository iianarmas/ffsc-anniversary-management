import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Receipt, Plus, ChevronRight, Shirt, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import FundsForm from './FundsForm';
import ExpenseForm from './ExpenseForm';
import CategoryManager from './CategoryManager';
import {
  fetchIncomeSources,
  fetchExpenseCategories,
  fetchExpenses,
  deleteIncomeSource,
  deleteExpense,
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

const SOURCE_TYPE_LABELS = {
  pledge: 'Pledge',
  offering: 'Offering',
  donation: 'Donation',
  other: 'Other'
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800' },
  fulfilled: { label: 'Fulfilled', color: 'bg-green-100 text-green-800' }
};

export default function MobileFinanceView({ people = [] }) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('summary');
  const [incomeSources, setIncomeSources] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFundsFormOpen, setIsFundsFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const canEdit = profile?.role === 'admin' || profile?.is_finance_manager === true;

  // Calculate shirt collection data
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

  // Load finance data
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
    const unsubscribe = subscribeToFinanceChanges(() => loadFinanceData());
    window.addEventListener('financeUpdated', loadFinanceData);
    return () => {
      unsubscribe();
      window.removeEventListener('financeUpdated', loadFinanceData);
    };
  }, [loadFinanceData]);

  // Separate planned vs actual expenses
  const { plannedExpenses, actualExpenses } = useMemo(() => {
    const planned = expenses.filter(e => e.is_planned);
    const actual = expenses.filter(e => !e.is_planned);
    return { plannedExpenses: planned, actualExpenses: actual };
  }, [expenses]);

  // Calculate totals
  const totals = useMemo(() => {
    // Fund sources only (pledges, offerings, donations, others - excluding shirts)
    const sourcesExpected = incomeSources.reduce((sum, i) => sum + parseFloat(i.pledged_amount || 0), 0);
    const sourcesReceived = incomeSources.reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);
    const sourcesPending = sourcesExpected - sourcesReceived;

    // Total funds including shirts (for overall balance calculations)
    const fundsReceived = sourcesReceived + (shirtCollectionData?.collected || 0);

    // Pledge-specific stats (for fulfillment percentage)
    const pledgeTotal = incomeSources.filter(i => i.source_type === 'pledge').reduce((sum, i) => sum + parseFloat(i.pledged_amount || 0), 0);
    const pledgeReceived = incomeSources.filter(i => i.source_type === 'pledge').reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    // Calculate expense totals from actual expenses only
    const expenseTotals = actualExpenses.reduce((acc, e) => {
      const totalAmount = parseFloat(e.total_amount || e.amount || 0);
      const paidAmount = parseFloat(e.paid_amount || e.amount || 0);
      return {
        totalCost: acc.totalCost + totalAmount,
        totalPaid: acc.totalPaid + paidAmount,
        balance: acc.balance + (totalAmount - paidAmount)
      };
    }, { totalCost: 0, totalPaid: 0, balance: 0 });

    // Calculate planned budget total
    const plannedTotal = plannedExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount || e.amount || 0), 0);

    // Current net balance (funds received - expenses paid)
    const netBalance = fundsReceived - expenseTotals.totalPaid;

    // Projected balance = current balance - remaining expense balance - planned budget
    // This shows what's left after paying all outstanding expenses and planned items
    const projectedBalance = netBalance - expenseTotals.balance - plannedTotal;

    return {
      // Fund sources only (excluding shirts)
      sourcesExpected,
      sourcesReceived,
      sourcesPending,
      // Overall totals (including shirts)
      fundsReceived,
      totalExpenses: expenseTotals.totalPaid, // Use paid amount for net balance calculation
      expenseTotalCost: expenseTotals.totalCost,
      expenseTotalPaid: expenseTotals.totalPaid,
      expenseBalance: expenseTotals.balance,
      plannedTotal,
      plannedCount: plannedExpenses.length,
      netBalance,
      projectedBalance,
      pledgeTotal,
      pledgeReceived,
      pledgeFulfillment: pledgeTotal > 0 ? ((pledgeReceived / pledgeTotal) * 100).toFixed(0) : 0
    };
  }, [incomeSources, actualExpenses, plannedExpenses, shirtCollectionData]);

  // Get items with balance (only actual expenses)
  const itemsWithBalance = useMemo(() => {
    return actualExpenses.filter(e => {
      const totalAmount = parseFloat(e.total_amount || e.amount || 0);
      const paidAmount = parseFloat(e.paid_amount || e.amount || 0);
      return totalAmount > paidAmount;
    });
  }, [actualExpenses]);

  const handleEditFund = (fund) => {
    setEditingFund(fund);
    setIsFundsFormOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFundsFormOpen(false);
    setIsExpenseFormOpen(false);
    setEditingFund(null);
    setEditingExpense(null);
    loadFinanceData();
  };

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'funds', label: 'Funds' },
    { id: 'expenses', label: 'Expenses' }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#f9fafa] pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-[#001740]">Finance</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 sticky top-[52px] z-10">
        <div className="flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#0f2a71] text-[#0f2a71]'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="text-xs text-gray-500">Total Funds</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    PHP {totals.fundsReceived.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt size={16} className="text-red-600" />
                    <span className="text-xs text-gray-500">Total Expenses</span>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    PHP {totals.totalExpenses.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={16} className={totals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'} />
                    <span className="text-xs text-gray-500">Net Balance</span>
                  </div>
                  <p className={`text-lg font-bold ${totals.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    PHP {Math.abs(totals.netBalance).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{totals.netBalance >= 0 ? 'Surplus' : 'Deficit'}</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-500">Pledges</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{totals.pledgeFulfillment}%</p>
                  <p className="text-xs text-gray-500">fulfilled</p>
                </div>
              </div>

              {/* Fund Sources Summary Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank size={18} className="text-blue-600" />
                  <span className="font-semibold text-blue-800">Fund Sources</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Expected</p>
                    <p className="text-sm font-bold">PHP {totals.sourcesExpected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Received</p>
                    <p className="text-sm font-bold text-green-600">PHP {totals.sourcesReceived.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-sm font-bold text-yellow-600">PHP {totals.sourcesPending.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Collected Shirt Payments Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shirt size={18} className="text-green-600" />
                  <span className="font-semibold text-green-800">Collected Shirt Payments</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Expected</p>
                    <p className="text-sm font-bold">PHP {shirtCollectionData.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Collected</p>
                    <p className="text-sm font-bold text-green-600">PHP {shirtCollectionData.collected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-sm font-bold text-yellow-600">PHP {shirtCollectionData.pending.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Expenses Summary Card */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Receipt size={18} className="text-red-600" />
                  <span className="font-semibold text-red-800">Expenses Summary</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Total Cost</p>
                    <p className="text-sm font-bold">PHP {totals.expenseTotalCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Paid</p>
                    <p className="text-sm font-bold text-green-600">PHP {totals.expenseTotalPaid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Balance</p>
                    <p className={`text-sm font-bold ${totals.expenseBalance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                      PHP {totals.expenseBalance.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Planned Budget Card */}
              {totals.plannedTotal > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} className="text-purple-600" />
                    <span className="font-semibold text-purple-800">Planned Budget</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-purple-600">PHP {totals.plannedTotal.toLocaleString()}</p>
                      <p className="text-xs text-purple-500">{totals.plannedCount} item{totals.plannedCount > 1 ? 's' : ''} not yet purchased</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Projected Balance Card - shows when there are outstanding payments or planned items */}
              {(totals.expenseBalance > 0 || totals.plannedTotal > 0) && (
                <div className={`rounded-lg border p-4 ${
                  totals.projectedBalance >= 0
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown size={18} className={totals.projectedBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
                    <span className={`font-semibold ${totals.projectedBalance >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                      Projected Balance
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${totals.projectedBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    PHP {Math.abs(totals.projectedBalance).toLocaleString()}
                    {totals.projectedBalance < 0 && <span className="text-sm font-normal ml-1">(shortfall)</span>}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    After paying all outstanding balances and planned purchases
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Current balance:</span>
                      <span className="font-medium">PHP {totals.netBalance.toLocaleString()}</span>
                    </div>
                    {totals.expenseBalance > 0 && (
                      <div className="flex justify-between text-yellow-700">
                        <span>− Outstanding payments:</span>
                        <span className="font-medium">PHP {totals.expenseBalance.toLocaleString()}</span>
                      </div>
                    )}
                    {totals.plannedTotal > 0 && (
                      <div className="flex justify-between text-purple-700">
                        <span>− Planned budget:</span>
                        <span className="font-medium">PHP {totals.plannedTotal.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Funds Tab */}
          {activeTab === 'funds' && (
            <>
              {canEdit && (
                <button
                  onClick={() => setIsFundsFormOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-[#0f2a71] text-white rounded-lg"
                >
                  <Plus size={18} />
                  Add Fund Source
                </button>
              )}

              {/* Fund Sources Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="text-sm font-bold text-gray-900">
                    PHP {totals.sourcesExpected.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="text-sm font-bold text-green-600">
                    PHP {totals.sourcesReceived.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-lg border p-3 text-center ${totals.sourcesPending > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className={`text-sm font-bold ${totals.sourcesPending > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    PHP {totals.sourcesPending.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Collected Shirt Payments Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt size={16} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Collected Shirt Payments</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Expected</p>
                    <p className="text-xs font-bold">PHP {shirtCollectionData.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Collected</p>
                    <p className="text-xs font-bold text-green-600">PHP {shirtCollectionData.collected.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-xs font-bold text-yellow-600">PHP {shirtCollectionData.pending.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Funds List */}
              <div className="space-y-2">
                {incomeSources.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    No fund sources yet
                  </div>
                ) : (
                  incomeSources.map(fund => (
                    <button
                      key={fund.id}
                      onClick={() => canEdit && handleEditFund(fund)}
                      className="w-full bg-white rounded-lg border border-gray-200 p-4 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_CONFIG[fund.status]?.color}`}>
                              {STATUS_CONFIG[fund.status]?.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              {SOURCE_TYPE_LABELS[fund.source_type]}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 truncate">{fund.source_name}</p>
                          <p className="text-sm text-gray-500">
                            Received: <span className="text-green-600 font-medium">PHP {parseFloat(fund.received_amount || 0).toLocaleString()}</span>
                            {' / '}PHP {parseFloat(fund.pledged_amount || 0).toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <>
              {canEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsExpenseFormOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0f2a71] text-white rounded-lg"
                  >
                    <Plus size={18} />
                    Add Expense
                  </button>
                  <button
                    onClick={() => setIsCategoryManagerOpen(true)}
                    className="p-3 border border-gray-300 rounded-lg text-gray-700"
                  >
                    Categories
                  </button>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Actual Expenses</p>
                  <p className="text-sm font-bold text-gray-900">
                    PHP {totals.expenseTotalCost.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="text-sm font-bold text-green-600">
                    PHP {totals.expenseTotalPaid.toLocaleString()}
                  </p>
                </div>
                <div className={`rounded-lg border p-3 text-center ${totals.expenseBalance > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                  <p className="text-xs text-gray-500">Balance</p>
                  <p className={`text-sm font-bold ${totals.expenseBalance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                    PHP {totals.expenseBalance.toLocaleString()}
                  </p>
                </div>
                {totals.plannedTotal > 0 && (
                  <div className="bg-purple-50 rounded-lg border border-purple-200 p-3 text-center">
                    <p className="text-xs text-gray-500">Planned</p>
                    <p className="text-sm font-bold text-purple-600">
                      PHP {totals.plannedTotal.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Unpaid Items Warning */}
              {itemsWithBalance.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={16} className="text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-800">
                      {itemsWithBalance.length} item{itemsWithBalance.length > 1 ? 's' : ''} with unpaid balance
                    </span>
                  </div>
                  <div className="space-y-1">
                    {itemsWithBalance.slice(0, 3).map(expense => {
                      const total = parseFloat(expense.total_amount || expense.amount || 0);
                      const paid = parseFloat(expense.paid_amount || expense.amount || 0);
                      const balance = total - paid;
                      return (
                        <div key={expense.id} className="text-xs text-yellow-700 flex justify-between">
                          <span className="truncate mr-2">{expense.description}</span>
                          <span className="font-medium whitespace-nowrap">PHP {balance.toLocaleString()}</span>
                        </div>
                      );
                    })}
                    {itemsWithBalance.length > 3 && (
                      <p className="text-xs text-yellow-600 italic">+{itemsWithBalance.length - 3} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Expenses List */}
              <div className="space-y-2">
                {expenses.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                    No expenses yet
                  </div>
                ) : (
                  expenses.map(expense => {
                    const totalAmount = parseFloat(expense.total_amount || expense.amount || 0);
                    const paidAmount = parseFloat(expense.paid_amount || expense.amount || 0);
                    const expenseBalance = totalAmount - paidAmount;
                    const isFullyPaid = expenseBalance <= 0;
                    const isPlanned = expense.is_planned;

                    return (
                      <button
                        key={expense.id}
                        onClick={() => canEdit && handleEditExpense(expense)}
                        className={`w-full rounded-lg border p-4 text-left ${
                          isPlanned
                            ? 'bg-purple-50 border-purple-200'
                            : !isFullyPaid
                              ? 'bg-yellow-50 border-yellow-200'
                              : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-gray-500">
                                {expense.expense_categories?.name || 'Uncategorized'}
                              </span>
                              {isPlanned ? (
                                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  <Clock size={10} />
                                  Planned
                                </span>
                              ) : isFullyPaid ? (
                                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                                  <CheckCircle size={10} />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                                  <AlertCircle size={10} />
                                  Partial
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                            {!isPlanned && (
                              <p className="text-xs text-gray-500 mt-1">
                                {expense.date && new Date(expense.date).toLocaleDateString()}
                                {expense.paid_by && ` • ${expense.paid_by}`}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-bold ${isPlanned ? 'text-purple-600' : 'text-gray-900'}`}>
                              PHP {totalAmount.toLocaleString()}
                            </p>
                            {!isPlanned && (
                              <>
                                <p className="text-xs text-green-600">
                                  Paid: PHP {paidAmount.toLocaleString()}
                                </p>
                                {!isFullyPaid && (
                                  <p className="text-xs text-yellow-600 font-medium">
                                    Bal: PHP {expenseBalance.toLocaleString()}
                                  </p>
                                )}
                              </>
                            )}
                            {isPlanned && (
                              <p className="text-xs text-purple-500">Not yet purchased</p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {isFundsFormOpen && (
        <FundsForm
          fund={editingFund}
          onClose={() => {
            setIsFundsFormOpen(false);
            setEditingFund(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {isExpenseFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          categories={expenseCategories}
          onClose={() => {
            setIsExpenseFormOpen(false);
            setEditingExpense(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {isCategoryManagerOpen && (
        <CategoryManager
          categories={expenseCategories}
          onClose={() => setIsCategoryManagerOpen(false)}
          onRefresh={loadFinanceData}
        />
      )}
    </div>
  );
}
