import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle, Clock, AlertCircle, Shirt } from 'lucide-react';
import FundsForm from './FundsForm';
import { deleteIncomeSource } from '../../services/financeService';

const SOURCE_TYPE_LABELS = {
  pledge: 'Pledge',
  offering: 'Offering',
  donation: 'Donation',
  other: 'Other'
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  fulfilled: { label: 'Fulfilled', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

export default function FundsTab({
  fundSources,
  shirtCollectionData,
  canEdit,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFund, setEditingFund] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter fund sources
  const filteredFunds = useMemo(() => {
    return fundSources.filter(fund => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesName = fund.source_name?.toLowerCase().includes(search);
        const matchesNotes = fund.notes?.toLowerCase().includes(search);
        if (!matchesName && !matchesNotes) return false;
      }

      // Type filter
      if (filterType !== 'all' && fund.source_type !== filterType) return false;

      // Status filter
      if (filterStatus !== 'all' && fund.status !== filterStatus) return false;

      return true;
    });
  }, [fundSources, searchTerm, filterType, filterStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    const pledged = filteredFunds.reduce((sum, i) => sum + parseFloat(i.pledged_amount || 0), 0);
    const received = filteredFunds.reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);
    return { pledged, received, pending: pledged - received };
  }, [filteredFunds]);

  const handleEdit = (fund) => {
    setEditingFund(fund);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncomeSource(id);
      setDeleteConfirm(null);
      onRefresh();
    } catch (error) {
      console.error('Error deleting fund source:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFund(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Collected Shirt Payments Card (Read-only, from Collections) */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shirt size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Collected Shirt Payments</h3>
            <p className="text-xs text-green-600">Auto-calculated from Payment Collections</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600">Expected</p>
            <p className="text-lg font-bold text-gray-900">PHP {(shirtCollectionData?.total || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Collected</p>
            <p className="text-lg font-bold text-green-600">PHP {(shirtCollectionData?.collected || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Pending</p>
            <p className="text-lg font-bold text-yellow-600">PHP {(shirtCollectionData?.pending || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] w-48"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
          >
            <option value="all">All Types</option>
            <option value="pledge">Pledges</option>
            <option value="offering">Offerings</option>
            <option value="donation">Donations</option>
            <option value="other">Other</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>

        {/* Add Button */}
        {canEdit && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] text-white rounded-lg hover:bg-[#0a1d4a] transition text-sm"
          >
            <Plus size={16} />
            Add Fund Source
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Total Expected</p>
          <p className="text-2xl font-bold text-gray-900">PHP {totals.pledged.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Total Received</p>
          <p className="text-2xl font-bold text-green-600">PHP {totals.received.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wide">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-600">PHP {totals.pending.toLocaleString()}</p>
        </div>
      </div>

      {/* Funds Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Expected</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Received</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                {canEdit && (
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-gray-500">
                    No fund sources found
                  </td>
                </tr>
              ) : (
                filteredFunds.map((fund) => {
                  const StatusIcon = STATUS_CONFIG[fund.status]?.icon || Clock;
                  return (
                    <tr key={fund.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{fund.source_name || '-'}</p>
                          {fund.notes && (
                            <p className="text-xs text-gray-500 truncate max-w-xs">{fund.notes}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {SOURCE_TYPE_LABELS[fund.source_type] || fund.source_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        PHP {parseFloat(fund.pledged_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                        PHP {parseFloat(fund.received_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[fund.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon size={12} />
                          {STATUS_CONFIG[fund.status]?.label || fund.status}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(fund)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(fund.id)}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Form Modal */}
      {isFormOpen && (
        <FundsForm
          fund={editingFund}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Fund Source</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this fund source? This action cannot be undone.
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
