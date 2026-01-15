import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { addIncomeSource, updateIncomeSource } from '../../services/financeService';

export default function FundsForm({ fund, onClose, onSuccess }) {
  const { profile } = useAuth();
  const isEditing = !!fund;

  const [formData, setFormData] = useState({
    sourceType: 'pledge',
    sourceName: '',
    pledgedAmount: '',
    receivedAmount: '',
    status: 'pending',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (fund) {
      setFormData({
        sourceType: fund.source_type || 'pledge',
        sourceName: fund.source_name || '',
        pledgedAmount: fund.pledged_amount || '',
        receivedAmount: fund.received_amount || '',
        status: fund.status || 'pending',
        notes: fund.notes || ''
      });
    }
  }, [fund]);

  // Auto-update status based on amounts
  useEffect(() => {
    const pledged = parseFloat(formData.pledgedAmount) || 0;
    const received = parseFloat(formData.receivedAmount) || 0;

    if (pledged > 0) {
      if (received >= pledged) {
        setFormData(prev => ({ ...prev, status: 'fulfilled' }));
      } else if (received > 0) {
        setFormData(prev => ({ ...prev, status: 'partial' }));
      } else {
        setFormData(prev => ({ ...prev, status: 'pending' }));
      }
    }
  }, [formData.pledgedAmount, formData.receivedAmount]);

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
      if (!formData.sourceName.trim()) {
        throw new Error('Source name is required');
      }

      const pledgedAmount = parseFloat(formData.pledgedAmount) || 0;
      const receivedAmount = parseFloat(formData.receivedAmount) || 0;

      if (pledgedAmount < 0 || receivedAmount < 0) {
        throw new Error('Amounts cannot be negative');
      }

      const data = {
        sourceType: formData.sourceType,
        sourceName: formData.sourceName.trim(),
        pledgedAmount,
        receivedAmount,
        status: formData.status,
        notes: formData.notes.trim()
      };

      if (isEditing) {
        await updateIncomeSource(fund.id, data);
      } else {
        await addIncomeSource(data, profile.id);
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to save fund source');
    } finally {
      setLoading(false);
    }
  };

  const getSourceNameLabel = () => {
    switch (formData.sourceType) {
      case 'pledge':
        return 'Pledger Name';
      case 'donation':
        return 'Donor Name';
      case 'offering':
        return 'Description';
      default:
        return 'Source Name';
    }
  };

  const getSourceNamePlaceholder = () => {
    switch (formData.sourceType) {
      case 'pledge':
        return 'e.g., Juan dela Cruz';
      case 'donation':
        return 'e.g., Anonymous Donor';
      case 'offering':
        return 'e.g., Sunday Collection';
      default:
        return 'e.g., Main Group Contribution';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Fund Source' : 'Add Fund Source'}
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

          {/* Source Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="sourceType"
              value={formData.sourceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            >
              <option value="pledge">Pledge</option>
              <option value="offering">Offering</option>
              <option value="donation">Donation</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Source Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getSourceNameLabel()} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sourceName"
              value={formData.sourceName}
              onChange={handleChange}
              placeholder={getSourceNamePlaceholder()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            />
          </div>

          {/* Expected Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.sourceType === 'pledge' ? 'Pledged Amount' : 'Expected Amount'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">PHP</span>
              <input
                type="number"
                name="pledgedAmount"
                value={formData.pledgedAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
          </div>

          {/* Received Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">PHP</span>
              <input
                type="number"
                name="receivedAmount"
                value={formData.receivedAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
            >
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Status updates automatically based on amounts
            </p>
          </div>

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
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Add Fund Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
