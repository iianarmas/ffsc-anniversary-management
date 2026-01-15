import React, { useState, useEffect } from 'react';
import { X, Clock, Receipt } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { addExpense, updateExpense } from '../../services/financeService';

export default function ExpenseForm({ expense, categories, onClose, onSuccess }) {
  const { profile } = useAuth();
  const isEditing = !!expense;

  const [formData, setFormData] = useState({
    categoryId: '',
    description: '',
    totalAmount: '',
    paidAmount: '',
    date: new Date().toISOString().split('T')[0],
    paidBy: '',
    notes: '',
    isPlanned: false // false = actual expense, true = planned/budgeted
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (expense) {
      setFormData({
        categoryId: expense.category_id || '',
        description: expense.description || '',
        totalAmount: expense.total_amount || expense.amount || '',
        paidAmount: expense.paid_amount || expense.amount || '',
        date: expense.date || new Date().toISOString().split('T')[0],
        paidBy: expense.paid_by || '',
        notes: expense.notes || '',
        isPlanned: expense.is_planned || false
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }

      const totalAmount = parseFloat(formData.totalAmount);
      if (isNaN(totalAmount) || totalAmount <= 0) {
        throw new Error('Please enter a valid total amount');
      }

      const paidAmount = parseFloat(formData.paidAmount) || 0;
      if (paidAmount < 0) {
        throw new Error('Amount paid cannot be negative');
      }

      if (paidAmount > totalAmount) {
        throw new Error('Amount paid cannot exceed total amount');
      }

      const data = {
        categoryId: formData.categoryId || null,
        description: formData.description.trim(),
        totalAmount,
        paidAmount: formData.isPlanned ? 0 : paidAmount, // Planned items have 0 paid
        date: formData.date,
        paidBy: formData.isPlanned ? '' : formData.paidBy.trim(),
        notes: formData.notes.trim(),
        isPlanned: formData.isPlanned
      };

      if (isEditing) {
        await updateExpense(expense.id, data);
      } else {
        await addExpense(data, profile.id);
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Expense Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPlanned: false }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                  !formData.isPlanned
                    ? 'border-[#0f2a71] bg-[#0f2a71]/5 text-[#0f2a71]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Receipt size={18} />
                <span className="text-sm font-medium">Actual Expense</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isPlanned: true }))}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition ${
                  formData.isPlanned
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <Clock size={18} />
                <span className="text-sm font-medium">Planned/Budget</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.isPlanned
                ? 'For items you\'ve budgeted but haven\'t purchased yet'
                : 'For items you\'ve already purchased or paid for'
              }
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-yellow-600 mt-1">
                No categories yet. Create one in "Manage Categories".
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Venue rental"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            />
          </div>

          {/* Total Amount / Budget Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.isPlanned ? 'Budget Amount' : 'Total Cost'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">PHP</span>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.isPlanned
                ? 'The amount allocated/budgeted for this item'
                : 'The full price of this item/service'}
            </p>
          </div>

          {/* Amount Paid - Only show for actual expenses */}
          {!formData.isPlanned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Paid
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">PHP</span>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">How much has been paid so far</p>
            </div>
          )}

          {/* Balance Indicator - Only show for actual expenses */}
          {!formData.isPlanned && formData.totalAmount && (
            <div className={`p-3 rounded-lg ${
              parseFloat(formData.paidAmount || 0) >= parseFloat(formData.totalAmount)
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Balance:</span>
                <span className={`text-sm font-bold ${
                  parseFloat(formData.paidAmount || 0) >= parseFloat(formData.totalAmount)
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  PHP {Math.max(0, parseFloat(formData.totalAmount || 0) - parseFloat(formData.paidAmount || 0)).toLocaleString()}
                </span>
              </div>
              <p className={`text-xs mt-1 ${
                parseFloat(formData.paidAmount || 0) >= parseFloat(formData.totalAmount)
                  ? 'text-green-600'
                  : 'text-yellow-600'
              }`}>
                {parseFloat(formData.paidAmount || 0) >= parseFloat(formData.totalAmount)
                  ? 'Fully paid'
                  : 'Still has balance to pay'}
              </p>
            </div>
          )}

          {/* Planned Item Indicator */}
          {formData.isPlanned && formData.totalAmount && (
            <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Planned Budget Item</span>
              </div>
              <p className="text-xs text-purple-600 mt-1">
                This item is budgeted but not yet purchased. You can convert it to an actual expense later by editing and changing the type.
              </p>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            />
          </div>

          {/* Paid By - Only show for actual expenses */}
          {!formData.isPlanned && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <input
                type="text"
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                placeholder="Who paid for this? (for reimbursement tracking)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#0f2a71] text-white rounded-lg hover:bg-[#0a1d4a] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
