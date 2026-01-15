import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, FolderPlus, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ExpenseForm from './ExpenseForm';
import CategoryManager from './CategoryManager';
import { deleteExpense } from '../../services/financeService';

export default function ExpensesTab({
  expenses,
  expenseCategories,
  canEdit,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesDesc = expense.description?.toLowerCase().includes(search);
        const matchesPaidBy = expense.paid_by?.toLowerCase().includes(search);
        const matchesNotes = expense.notes?.toLowerCase().includes(search);
        if (!matchesDesc && !matchesPaidBy && !matchesNotes) return false;
      }

      // Category filter
      if (filterCategory !== 'all' && expense.category_id !== filterCategory) return false;

      return true;
    });
  }, [expenses, searchTerm, filterCategory]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped = {};

    // Initialize with all categories
    expenseCategories.forEach(cat => {
      grouped[cat.id] = {
        category: cat,
        expenses: [],
        totalCost: 0,
        totalPaid: 0,
        balance: 0
      };
    });

    // Add uncategorized group
    grouped['uncategorized'] = {
      category: { id: 'uncategorized', name: 'Uncategorized' },
      expenses: [],
      totalCost: 0,
      totalPaid: 0,
      balance: 0
    };

    // Group expenses
    filteredExpenses.forEach(expense => {
      const catId = expense.category_id || 'uncategorized';
      if (!grouped[catId]) {
        grouped[catId] = {
          category: { id: catId, name: 'Unknown Category' },
          expenses: [],
          totalCost: 0,
          totalPaid: 0,
          balance: 0
        };
      }
      grouped[catId].expenses.push(expense);
      const totalAmount = parseFloat(expense.total_amount || expense.amount || 0);
      const paidAmount = parseFloat(expense.paid_amount || expense.amount || 0);
      grouped[catId].totalCost += totalAmount;
      grouped[catId].totalPaid += paidAmount;
      grouped[catId].balance += (totalAmount - paidAmount);
    });

    // Convert to array and sort by totalCost (highest first)
    return Object.values(grouped)
      .filter(g => g.expenses.length > 0 || expenseCategories.some(c => c.id === g.category.id))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredExpenses, expenseCategories]);

  // Separate planned vs actual expenses
  const { plannedExpenses, actualExpenses } = useMemo(() => {
    const planned = filteredExpenses.filter(e => e.is_planned);
    const actual = filteredExpenses.filter(e => !e.is_planned);
    return { plannedExpenses: planned, actualExpenses: actual };
  }, [filteredExpenses]);

  // Calculate totals (only from actual expenses)
  const expenseTotals = useMemo(() => {
    return actualExpenses.reduce((acc, e) => {
      const totalAmount = parseFloat(e.total_amount || e.amount || 0);
      const paidAmount = parseFloat(e.paid_amount || e.amount || 0);
      return {
        totalCost: acc.totalCost + totalAmount,
        totalPaid: acc.totalPaid + paidAmount,
        balance: acc.balance + (totalAmount - paidAmount)
      };
    }, { totalCost: 0, totalPaid: 0, balance: 0 });
  }, [actualExpenses]);

  // Calculate planned budget total
  const plannedTotal = useMemo(() => {
    return plannedExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount || e.amount || 0), 0);
  }, [plannedExpenses]);

  // Get items with balance (only actual expenses, not planned)
  const itemsWithBalance = useMemo(() => {
    return actualExpenses.filter(e => {
      const totalAmount = parseFloat(e.total_amount || e.amount || 0);
      const paidAmount = parseFloat(e.paid_amount || e.amount || 0);
      return totalAmount > paidAmount;
    });
  }, [actualExpenses]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    onRefresh();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] w-48"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
          >
            <option value="all">All Categories</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsCategoryManagerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <FolderPlus size={16} />
              Manage Categories
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] text-white rounded-lg hover:bg-[#0a1d4a] transition text-sm"
            >
              <Plus size={16} />
              Add Expense
            </button>
          </div>
        )}
      </div>

      {/* Total Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-600">Actual Expenses</span>
          </div>
          <span className="text-xl font-bold text-gray-900">PHP {expenseTotals.totalCost.toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Total Paid</span>
          </div>
          <span className="text-xl font-bold text-green-600">PHP {expenseTotals.totalPaid.toLocaleString()}</span>
        </div>
        <div className={`rounded-lg border p-4 ${expenseTotals.balance > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            {expenseTotals.balance > 0 ? (
              <AlertCircle size={16} className="text-yellow-600" />
            ) : (
              <CheckCircle size={16} className="text-green-500" />
            )}
            <span className="text-sm text-gray-600">Remaining Balance</span>
          </div>
          <span className={`text-xl font-bold ${expenseTotals.balance > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            PHP {expenseTotals.balance.toLocaleString()}
          </span>
        </div>
        {plannedTotal > 0 && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">Planned Budget</span>
            </div>
            <span className="text-xl font-bold text-purple-600">PHP {plannedTotal.toLocaleString()}</span>
            <p className="text-xs text-purple-500 mt-1">{plannedExpenses.length} item{plannedExpenses.length > 1 ? 's' : ''} not yet purchased</p>
          </div>
        )}
      </div>

      {/* Items with Balance Warning */}
      {itemsWithBalance.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">
                {itemsWithBalance.length} item{itemsWithBalance.length > 1 ? 's' : ''} with unpaid balance
              </h4>
              <ul className="mt-2 space-y-1">
                {itemsWithBalance.slice(0, 5).map(expense => {
                  const total = parseFloat(expense.total_amount || expense.amount || 0);
                  const paid = parseFloat(expense.paid_amount || expense.amount || 0);
                  const balance = total - paid;
                  return (
                    <li key={expense.id} className="text-sm text-yellow-700 flex items-center justify-between">
                      <span>{expense.description}</span>
                      <span className="font-medium">PHP {balance.toLocaleString()} remaining</span>
                    </li>
                  );
                })}
                {itemsWithBalance.length > 5 && (
                  <li className="text-sm text-yellow-600 italic">
                    ...and {itemsWithBalance.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expenses by Category */}
      <div className="space-y-4">
        {expensesByCategory.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
            No expenses recorded yet
          </div>
        ) : (
          expensesByCategory.map(({ category, expenses: catExpenses, totalCost, totalPaid, balance }) => {
            const isExpanded = expandedCategories[category.id] !== false; // Default to expanded

            return (
              <div key={category.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown size={20} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                    <span className="font-semibold text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-500">({catExpenses.length} items)</span>
                    {balance > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        PHP {balance.toLocaleString()} unpaid
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">PHP {totalCost.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 ml-2">(Paid: PHP {totalPaid.toLocaleString()})</span>
                  </div>
                </button>

                {/* Expenses List */}
                {isExpanded && catExpenses.length > 0 && (
                  <div className="border-t border-gray-100 overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Paid</th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Balance</th>
                          <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                          {canEdit && (
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {catExpenses.map(expense => {
                          const totalAmount = parseFloat(expense.total_amount || expense.amount || 0);
                          const paidAmount = parseFloat(expense.paid_amount || expense.amount || 0);
                          const expenseBalance = totalAmount - paidAmount;
                          const isFullyPaid = expenseBalance <= 0;
                          const isPlanned = expense.is_planned;

                          return (
                            <tr key={expense.id} className={`hover:bg-gray-50 ${isPlanned ? 'bg-purple-50/50' : !isFullyPaid ? 'bg-yellow-50/50' : ''}`}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-gray-900">{expense.description}</p>
                                    {isPlanned && (
                                      <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                        <Clock size={10} />
                                        Planned
                                      </span>
                                    )}
                                  </div>
                                  {expense.paid_by && (
                                    <p className="text-xs text-gray-500">Paid by: {expense.paid_by}</p>
                                  )}
                                  {expense.notes && (
                                    <p className="text-xs text-gray-400 truncate max-w-xs">{expense.notes}</p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(expense.date)}
                              </td>
                              <td className={`px-4 py-3 text-right text-sm font-medium ${isPlanned ? 'text-purple-600' : 'text-gray-900'}`}>
                                PHP {totalAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                                {isPlanned ? '-' : `PHP ${paidAmount.toLocaleString()}`}
                              </td>
                              <td className={`px-4 py-3 text-right text-sm font-medium ${isPlanned ? 'text-purple-500' : isFullyPaid ? 'text-gray-400' : 'text-yellow-600'}`}>
                                {isPlanned ? '-' : `PHP ${expenseBalance.toLocaleString()}`}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isPlanned ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    <Clock size={12} />
                                    Budgeted
                                  </span>
                                ) : isFullyPaid ? (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    <CheckCircle size={12} />
                                    Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                                    <AlertCircle size={12} />
                                    Partial
                                  </span>
                                )}
                              </td>
                              {canEdit && (
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleEdit(expense)}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                      title="Edit"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(expense.id)}
                                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Empty state for category */}
                {isExpanded && catExpenses.length === 0 && (
                  <div className="border-t border-gray-100 p-4 text-center text-sm text-gray-500">
                    No expenses in this category
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Expense Form Modal */}
      {isFormOpen && (
        <ExpenseForm
          expense={editingExpense}
          categories={expenseCategories}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Category Manager Modal */}
      {isCategoryManagerOpen && (
        <CategoryManager
          categories={expenseCategories}
          onClose={() => setIsCategoryManagerOpen(false)}
          onRefresh={onRefresh}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Expense</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
