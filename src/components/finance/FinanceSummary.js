import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../StatCard';
import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, Receipt, Clock, Target } from 'lucide-react';

const FUNDS_COLORS = {
  'Pledges': '#3b82f6',
  'Collected Shirt Payments': '#10b981',
  'Offerings': '#8b5cf6',
  'Donations': '#ec4899',
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
          Amount: <span className="font-semibold">PHP {data.value.toLocaleString()}</span>
        </p>
        <p className="text-sm text-gray-500">
          {data.payload.percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function FinanceSummary({
  incomeSources,
  expenses,
  expenseCategories,
  shirtCollectionData
}) {
  // Calculate funds breakdown
  const fundsData = useMemo(() => {
    const pledgeTotal = incomeSources
      .filter(i => i.source_type === 'pledge')
      .reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    const offeringTotal = incomeSources
      .filter(i => i.source_type === 'offering')
      .reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    const donationTotal = incomeSources
      .filter(i => i.source_type === 'donation')
      .reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    const otherTotal = incomeSources
      .filter(i => i.source_type === 'other')
      .reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    const shirtSales = shirtCollectionData?.collected || 0;

    const breakdown = [
      { name: 'Pledges', value: pledgeTotal },
      { name: 'Collected Shirt Payments', value: shirtSales },
      { name: 'Offerings', value: offeringTotal },
      { name: 'Donations', value: donationTotal },
      { name: 'Other', value: otherTotal }
    ].filter(item => item.value > 0);

    const total = breakdown.reduce((sum, item) => sum + item.value, 0);

    return {
      breakdown: breakdown.map(item => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
      })),
      total,
      pledgeStats: {
        total: incomeSources.filter(i => i.source_type === 'pledge').reduce((sum, i) => sum + parseFloat(i.pledged_amount || 0), 0),
        received: pledgeTotal,
        count: incomeSources.filter(i => i.source_type === 'pledge').length,
        fulfilled: incomeSources.filter(i => i.source_type === 'pledge' && i.status === 'fulfilled').length
      }
    };
  }, [incomeSources, shirtCollectionData]);

  // Separate planned vs actual expenses
  const { plannedExpenses, actualExpenses } = useMemo(() => {
    const planned = expenses.filter(e => e.is_planned);
    const actual = expenses.filter(e => !e.is_planned);
    return { plannedExpenses: planned, actualExpenses: actual };
  }, [expenses]);

  // Calculate expense totals (only actual expenses count toward paid amounts)
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

  // Calculate expense breakdown by category (for chart - only actual expenses)
  const expenseData = useMemo(() => {
    const byCategory = {};

    actualExpenses.forEach(expense => {
      const categoryName = expense.expense_categories?.name || 'Uncategorized';
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = 0;
      }
      byCategory[categoryName] += parseFloat(expense.paid_amount || expense.amount || 0);
    });

    const breakdown = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const total = breakdown.reduce((sum, item) => sum + item.value, 0);

    return {
      breakdown: breakdown.map((item, index) => ({
        ...item,
        percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
        color: EXPENSE_COLORS[index % EXPENSE_COLORS.length]
      })),
      total
    };
  }, [actualExpenses]);

  // Calculate net balance (funds received - expenses paid)
  const netBalance = fundsData.total - expenseTotals.totalPaid;
  const isDeficit = netBalance < 0;

  // Calculate projected balance (after paying all outstanding expenses and planned items)
  const projectedBalance = netBalance - expenseTotals.balance - plannedTotal;

  // Pledge fulfillment percentage
  const pledgeFulfillment = fundsData.pledgeStats.total > 0
    ? ((fundsData.pledgeStats.received / fundsData.pledgeStats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Funds"
          value={`PHP ${fundsData.total.toLocaleString()}`}
          Icon={TrendingUp}
          color="green"
          variant="expanded"
        />
        <StatCard
          title="Total Expenses"
          value={`PHP ${expenseData.total.toLocaleString()}`}
          Icon={Receipt}
          color="red"
          variant="expanded"
        />
        <StatCard
          title="Net Balance"
          value={`PHP ${Math.abs(netBalance).toLocaleString()}`}
          subtitle={isDeficit ? 'Deficit' : 'Surplus'}
          Icon={isDeficit ? TrendingDown : Wallet}
          color={isDeficit ? 'red' : 'green'}
          variant="expanded"
        />
        <StatCard
          title="Pledge Fulfillment"
          value={`${pledgeFulfillment}%`}
          subtitle={`${fundsData.pledgeStats.fulfilled} of ${fundsData.pledgeStats.count} fulfilled`}
          Icon={PiggyBank}
          color="blue"
          variant="expanded"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Funds Breakdown</h3>
          {fundsData.breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={fundsData.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {fundsData.breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={FUNDS_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              No funds recorded yet
            </div>
          )}
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Expense Breakdown</h3>
          {expenseData.breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={expenseData.breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {expenseData.breakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              No expenses recorded yet
            </div>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funds Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Funds Details</h3>
          <div className="space-y-3">
            {fundsData.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: FUNDS_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    PHP {item.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            {fundsData.breakdown.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No funds recorded</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
              <span className="text-sm font-semibold text-gray-900">Total Funds</span>
              <span className="text-sm font-bold text-green-600">
                PHP {fundsData.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Expense Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-[#001740] mb-4">Expense Details</h3>
          <div className="space-y-3">
            {expenseData.breakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    PHP {item.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            {expenseData.breakdown.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No expenses recorded</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
              <span className="text-sm font-semibold text-gray-900">Total Expenses</span>
              <span className="text-sm font-bold text-red-600">
                PHP {expenseData.total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Shirt Payments Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-base font-semibold text-[#001740] mb-4">Shirt Payments Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Expected</p>
            <p className="text-xl font-bold text-gray-900">
              PHP {(shirtCollectionData?.total || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Collected</p>
            <p className="text-xl font-bold text-green-600">
              PHP {(shirtCollectionData?.collected || 0).toLocaleString()}
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-xl font-bold text-yellow-600">
              PHP {(shirtCollectionData?.pending || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Projected Balance Card - shows when there are outstanding payments or planned items */}
      {(expenseTotals.balance > 0 || plannedTotal > 0) && (
        <div className={`rounded-lg border shadow-sm p-6 ${
          projectedBalance >= 0
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${projectedBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              <Target size={20} className={projectedBalance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${projectedBalance >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                Projected Balance
              </h3>
              <p className="text-xs text-gray-600">
                After paying all outstanding balances and planned purchases
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/60 rounded-lg">
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PHP {netBalance.toLocaleString()}
              </p>
            </div>
            {expenseTotals.balance > 0 && (
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock size={14} className="text-yellow-600" />
                  <p className="text-sm text-gray-600">Outstanding Payments</p>
                </div>
                <p className="text-xl font-bold text-yellow-600">
                  - PHP {expenseTotals.balance.toLocaleString()}
                </p>
              </div>
            )}
            {plannedTotal > 0 && (
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Target size={14} className="text-purple-600" />
                  <p className="text-sm text-gray-600">Planned Budget ({plannedExpenses.length})</p>
                </div>
                <p className="text-xl font-bold text-purple-600">
                  - PHP {plannedTotal.toLocaleString()}
                </p>
              </div>
            )}
            <div className={`text-center p-4 rounded-lg ${
              projectedBalance >= 0 ? 'bg-emerald-100' : 'bg-red-100'
            }`}>
              <p className="text-sm text-gray-600">Projected Balance</p>
              <p className={`text-xl font-bold ${projectedBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                PHP {Math.abs(projectedBalance).toLocaleString()}
                {projectedBalance < 0 && <span className="text-sm font-normal ml-1">(shortfall)</span>}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
