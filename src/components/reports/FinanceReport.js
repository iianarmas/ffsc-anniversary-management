import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DollarSign, TrendingUp, Wallet, PiggyBank, Receipt, Shirt } from 'lucide-react';

const FUNDS_COLORS = {
  'Pledges': '#3b82f6',
  'Collected Shirt Payments': '#10b981',
  'Other': '#f59e0b'
};

const EXPENSE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
        <p className="text-sm text-gray-700">
          Amount: <span className="font-semibold">PHP {data.value?.toLocaleString() || 0}</span>
        </p>
        {data.payload.percentage && (
          <p className="text-sm text-gray-500">
            {data.payload.percentage}% of total
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function FinanceReport({ data, people }) {
  const { income, expenses, netBalance, isDeficit } = data;

  // Prepare funds data for chart
  const fundsChartData = [
    { name: 'Pledges', value: income.pledges.received || 0 },
    { name: 'Collected Shirt Payments', value: income.shirtSales.collected || 0 },
    { name: 'Other', value: income.other || 0 }
  ].filter(item => item.value > 0);

  const totalFunds = fundsChartData.reduce((sum, item) => sum + item.value, 0);
  const fundsWithPercentage = fundsChartData.map(item => ({
    ...item,
    percentage: totalFunds > 0 ? ((item.value / totalFunds) * 100).toFixed(1) : 0
  }));

  // Prepare expense data for chart
  const expenseChartData = expenses.byCategory.map((item, index) => ({
    ...item,
    value: item.amount,
    color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
    percentage: expenses.total > 0 ? ((item.amount / expenses.total) * 100).toFixed(1) : 0
  }));

  // Pledge fulfillment rate
  const pledgeFulfillment = income.pledges.total > 0
    ? ((income.pledges.received / income.pledges.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-[#001740] mb-2">Finance Report</h2>
        <p className="text-sm text-gray-600">
          Complete financial overview including funds, expenses, and net balance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Total Funds</p>
          <p className="text-2xl font-bold text-green-600">PHP {income.totalReceived.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Receipt size={20} className="text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">PHP {expenses.total.toLocaleString()}</p>
        </div>

        <div className={`rounded-lg border shadow-sm p-4 ${
          isDeficit ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDeficit ? 'bg-red-100' : 'bg-green-100'}`}>
              <Wallet size={20} className={isDeficit ? 'text-red-600' : 'text-green-600'} />
            </div>
          </div>
          <p className="text-sm text-gray-600">Net Balance</p>
          <p className={`text-2xl font-bold ${isDeficit ? 'text-red-600' : 'text-green-600'}`}>
            PHP {Math.abs(netBalance).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{isDeficit ? 'Deficit' : 'Surplus'}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <PiggyBank size={20} className="text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Pledge Fulfillment</p>
          <p className="text-2xl font-bold text-blue-600">{pledgeFulfillment}%</p>
          <p className="text-xs text-gray-500">{income.pledges.fulfilled}/{income.pledges.count} fulfilled</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Funds Breakdown</h3>
          {fundsWithPercentage.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={fundsWithPercentage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {fundsWithPercentage.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FUNDS_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              No funds recorded
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {fundsWithPercentage.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: FUNDS_COLORS[item.name] || '#94a3b8' }}
                />
                <span className="text-xs text-gray-600">
                  {item.name}: PHP {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Expense Breakdown</h3>
          {expenseChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              No expenses recorded
            </div>
          )}
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {expenseChartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">
                  {item.name}: PHP {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Funds Details</h3>

          {/* Pledges Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <PiggyBank size={16} className="text-blue-600" />
              Pledges
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Pledged</span>
                <span className="font-medium">PHP {(income.pledges.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Received</span>
                <span className="font-medium text-green-600">PHP {(income.pledges.received || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">
                  PHP {((income.pledges.total || 0) - (income.pledges.received || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fulfillment Status</span>
                <span className="text-gray-500">
                  {income.pledges.fulfilled} fulfilled, {income.pledges.partial} partial, {income.pledges.pending} pending
                </span>
              </div>
            </div>
          </div>

          {/* Shirt Payments Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Shirt size={16} className="text-green-600" />
              Shirt Payments
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium">{income.shirtSales.totalOrders || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Expected</span>
                <span className="font-medium">PHP {(income.shirtSales.totalExpected || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Collected</span>
                <span className="font-medium text-green-600">PHP {(income.shirtSales.collected || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-medium text-yellow-600">PHP {(income.shirtSales.pending || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status</span>
                <span className="text-gray-500">
                  {income.shirtSales.paidCount || 0} paid, {income.shirtSales.unpaidCount || 0} unpaid
                </span>
              </div>
            </div>
          </div>

          {/* Other Funds */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <DollarSign size={16} className="text-yellow-600" />
              Other Funds
            </h4>
            <div className="space-y-2 pl-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">PHP {(income.other || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Funds Received</span>
              <span className="font-bold text-green-600">PHP {income.totalReceived.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Expense Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Expense Details by Category</h3>
          <div className="space-y-3">
            {expenseChartData.map((category, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    PHP {category.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">({category.percentage}%)</span>
                </div>
              </div>
            ))}
            {expenseChartData.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No expenses recorded</p>
            )}
            <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-gray-200">
              <span className="font-semibold text-gray-900">Total Expenses</span>
              <span className="font-bold text-red-600">PHP {expenses.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Net Summary */}
          <div className={`mt-6 p-4 rounded-lg ${
            isDeficit ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Funds</span>
              <span className="text-sm font-semibold text-green-600">
                + PHP {income.totalReceived.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total Expenses</span>
              <span className="text-sm font-semibold text-red-600">
                - PHP {expenses.total.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-300">
              <span className="font-semibold text-gray-900">Net Balance</span>
              <span className={`font-bold text-lg ${isDeficit ? 'text-red-600' : 'text-green-600'}`}>
                PHP {Math.abs(netBalance).toLocaleString()}
                {isDeficit && <span className="text-sm font-normal ml-1">(deficit)</span>}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
