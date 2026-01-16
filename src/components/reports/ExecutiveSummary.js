import React from 'react';
import { Users, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export default function ExecutiveSummary({ data, stats, financeData }) {
  const { finance } = data;

  // Calculate attendance percentage
  const attendancePercentage = Math.round((stats.registered / stats.maxCapacity) * 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#001740] mb-2">Executive Summary</h2>
        <p className="text-sm text-gray-600">
          Key performance indicators for the anniversary event
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance vs Capacity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              attendancePercentage >= 80 ? 'bg-green-100 text-green-700' :
              attendancePercentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {attendancePercentage}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Attendance</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.registered} / {stats.maxCapacity}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.preRegistered} pending check-in
          </p>
        </div>

        {/* Total Funds */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Funds</p>
          <p className="text-2xl font-bold text-gray-900">
            PHP {finance.totalIncome.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Received from all sources
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            PHP {finance.totalExpenses.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {financeData.expenses.count} expense items
          </p>
        </div>

        {/* Net Balance */}
        <div className={`rounded-lg border shadow-sm p-6 ${
          finance.isDeficit
            ? 'bg-red-50 border-red-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${
              finance.isDeficit ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <Wallet size={20} className={finance.isDeficit ? 'text-red-600' : 'text-green-600'} />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              finance.isDeficit ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {finance.isDeficit ? 'Deficit' : 'Surplus'}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${
            finance.isDeficit ? 'text-red-700' : 'text-green-700'
          }`}>
            PHP {Math.abs(finance.netBalance).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Funds - Expenses
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Attendance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Registered</span>
              <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Attending Event</span>
              <span className="text-sm font-semibold text-gray-900">{stats.attendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Shirt Only</span>
              <span className="text-sm font-semibold text-gray-900">{stats.shirtOnlyCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Checked In</span>
              <span className="text-sm font-semibold text-green-600">{stats.registered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Check-in</span>
              <span className="text-sm font-semibold text-yellow-600">{stats.preRegistered}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Slots Remaining</span>
              <span className="text-sm font-semibold text-blue-600">{stats.slotsRemaining}</span>
            </div>
          </div>
        </div>

        {/* Finance Quick View */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Finance Quick View</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pledges Received</span>
              <span className="text-sm font-semibold text-gray-900">
                PHP {(financeData.income.pledges.received || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Collected Shirt Payments</span>
              <span className="text-sm font-semibold text-gray-900">
                PHP {(financeData.income.shirtSales.collected || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Other Funds</span>
              <span className="text-sm font-semibold text-gray-900">
                PHP {(financeData.income.other || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total Funds</span>
              <span className="text-sm font-bold text-green-600">
                PHP {finance.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Expenses</span>
              <span className="text-sm font-bold text-red-600">
                PHP {finance.totalExpenses.toLocaleString()}
              </span>
            </div>
            <div className={`flex items-center justify-between pt-3 border-t-2 ${
              finance.isDeficit ? 'border-red-200' : 'border-green-200'
            }`}>
              <span className="text-sm font-semibold text-gray-700">Net Balance</span>
              <span className={`text-sm font-bold ${
                finance.isDeficit ? 'text-red-600' : 'text-green-600'
              }`}>
                PHP {Math.abs(finance.netBalance).toLocaleString()}
                {finance.isDeficit && ' (deficit)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#001740] mb-4">Venue Capacity</h3>
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">
            {stats.registered} checked in of {stats.maxCapacity} capacity
          </span>
          <span className="font-semibold text-gray-900">{attendancePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${
              attendancePercentage >= 90 ? 'bg-red-500' :
              attendancePercentage >= 75 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(attendancePercentage, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>Capacity: {stats.maxCapacity}</span>
        </div>
      </div>
    </div>
  );
}
