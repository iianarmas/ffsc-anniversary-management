import { supabase } from './supabase';
import { fetchIncomeSources, fetchExpenses } from './financeService';

// ==================== LEADERSHIP REPORT DATA ====================

// Get demographics data for leadership report
export const getLeadershipReportData = async (people) => {
  // Age bracket distribution (include Unknown for missing ages)
  const ageBrackets = { Adult: 0, Youth: 0, Kid: 0, Toddler: 0, Unknown: 0 };

  people.forEach(p => {
    if (!p.age && p.age !== 0) {
      ageBrackets.Unknown++;
    } else if (ageBrackets.hasOwnProperty(p.ageBracket)) {
      ageBrackets[p.ageBracket]++;
    } else {
      ageBrackets.Adult++; // Default
    }
  });

  // Gender breakdown
  const genderData = {};
  people.forEach(p => {
    const gender = p.gender || 'Not Specified';
    if (!genderData[gender]) {
      genderData[gender] = { total: 0, registered: 0, preRegistered: 0 };
    }
    genderData[gender].total++;
    if (p.registered) {
      genderData[gender].registered++;
    } else {
      genderData[gender].preRegistered++;
    }
  });

  // Location distribution
  const locationData = {};
  people.forEach(p => {
    const location = p.location || 'Unknown';
    if (!locationData[location]) {
      locationData[location] = { total: 0, registered: 0, preRegistered: 0 };
    }
    locationData[location].total++;
    if (p.registered) {
      locationData[location].registered++;
    } else {
      locationData[location].preRegistered++;
    }
  });

  // Attendance type breakdown
  const attendingCount = people.filter(p => p.attendanceStatus === 'attending').length;
  const shirtOnlyCount = people.filter(p => p.attendanceStatus === 'shirt_only').length;

  return {
    ageBrackets: Object.entries(ageBrackets).map(([name, value]) => ({ name, value })),
    genderBreakdown: Object.entries(genderData).map(([gender, data]) => ({
      gender,
      ...data
    })),
    locationBreakdown: Object.entries(locationData).map(([location, data]) => ({
      location,
      ...data
    })),
    attendanceType: {
      attending: attendingCount,
      shirtOnly: shirtOnlyCount
    },
    totalPeople: people.length
  };
};

// ==================== COMMITTEE REPORT DATA ====================

// Get committee report data (check-in timeline, volunteer activity)
export const getCommitteeReportData = async (people, selectedDate = null) => {
  // Helper function to get Philippine time components
  const getPhilippineTime = (dateString) => {
    let timestamp = dateString;
    if (typeof timestamp === 'string' && !timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
      timestamp = timestamp + 'Z';
    }

    const date = new Date(timestamp);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(date);
    const getValue = (type) => parseInt(parts.find(p => p.type === type)?.value || 0);

    return {
      year: getValue('year'),
      month: getValue('month'),
      day: getValue('day'),
      hour: getValue('hour')
    };
  };

  // Parse selected date or use today
  let targetYear, targetMonth, targetDay;
  if (selectedDate) {
    [targetYear, targetMonth, targetDay] = selectedDate.split('-').map(Number);
  } else {
    const phDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDateObj = new Date(phDate);
    targetYear = phDateObj.getFullYear();
    targetMonth = phDateObj.getMonth() + 1;
    targetDay = phDateObj.getDate();
  }

  // Get registrations for selected date
  const dateRegistrations = people.filter(p => {
    if (!p.registeredAt || !p.registered) return false;
    const regPH = getPhilippineTime(p.registeredAt);
    return regPH.day === targetDay &&
           regPH.month === targetMonth &&
           regPH.year === targetYear;
  });

  // Generate hourly data
  const hourlyData = [];
  let earliestHour = 6;
  let latestHour = 22;

  if (dateRegistrations.length > 0) {
    const hours = dateRegistrations.map(p => getPhilippineTime(p.registeredAt).hour);
    earliestHour = Math.max(0, Math.min(...hours) - 1);
    latestHour = Math.min(23, Math.max(...hours) + 1);
  }

  let peakHour = { hour: '', count: 0 };

  for (let hour = earliestHour; hour <= latestHour; hour++) {
    const hourStr = hour === 0 ? '12 AM' :
                    hour === 12 ? '12 PM' :
                    hour > 12 ? `${hour - 12} PM` :
                    `${hour} AM`;

    const count = dateRegistrations.filter(p =>
      getPhilippineTime(p.registeredAt).hour === hour
    ).length;

    if (count > peakHour.count) {
      peakHour = { hour: hourStr, count };
    }

    hourlyData.push({
      time: hourStr,
      hour,
      checkedIn: count
    });
  }

  return {
    hourlyData,
    peakHour,
    totalRegistrations: dateRegistrations.length,
    selectedDate: `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`
  };
};

// Get volunteer activity data (who registered how many people)
export const getVolunteerActivityData = async () => {
  try {
    // Get all registrations with the user who registered them
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        registered,
        registered_at,
        registered_by,
        profiles:registered_by (
          id,
          full_name
        )
      `)
      .eq('registered', true)
      .not('registered_by', 'is', null);

    if (error) throw error;

    // Group by user
    const volunteerStats = {};
    registrations.forEach(reg => {
      const userId = reg.registered_by;
      const userName = reg.profiles?.full_name || 'Unknown';

      if (!volunteerStats[userId]) {
        volunteerStats[userId] = {
          userId,
          name: userName,
          count: 0
        };
      }
      volunteerStats[userId].count++;
    });

    // Sort by count descending
    return Object.values(volunteerStats).sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching volunteer activity:', error);
    return [];
  }
};

// ==================== FINANCE REPORT DATA ====================

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

// Get finance report data
export const getFinanceReportData = async (people = []) => {
  try {
    // Fetch finance data
    const [incomeSources, expenses] = await Promise.all([
      fetchIncomeSources(),
      fetchExpenses()
    ]);

    // Calculate shirt collection data
    const peopleWithShirts = people.filter(p =>
      p.shirtSize && p.shirtSize !== 'No shirt' && p.shirtSize !== 'Select Size' && p.shirtSize !== 'None yet' && p.shirtSize !== ''
    );

    const getShirtPrice = (size, hasPrint) => {
      if (!size) return 0;
      if (hasPrint) return SHIRT_PRICING.withPrint[size] || 0;
      return SHIRT_PRICING.plain[size] || 0;
    };

    const shirtStats = {
      totalOrders: peopleWithShirts.length,
      totalExpected: peopleWithShirts.reduce((sum, p) => sum + getShirtPrice(p.shirtSize, p.hasPrint), 0),
      collected: peopleWithShirts.filter(p => p.paid).reduce((sum, p) => sum + getShirtPrice(p.shirtSize, p.hasPrint), 0),
      paidCount: peopleWithShirts.filter(p => p.paid).length,
      unpaidCount: peopleWithShirts.filter(p => !p.paid).length
    };
    shirtStats.pending = shirtStats.totalExpected - shirtStats.collected;

    // Calculate pledge stats
    const pledges = incomeSources.filter(i => i.source_type === 'pledge');
    const pledgeStats = {
      total: pledges.reduce((sum, p) => sum + parseFloat(p.pledged_amount || 0), 0),
      received: pledges.reduce((sum, p) => sum + parseFloat(p.received_amount || 0), 0),
      count: pledges.length,
      fulfilled: pledges.filter(p => p.status === 'fulfilled').length,
      partial: pledges.filter(p => p.status === 'partial').length,
      pending: pledges.filter(p => p.status === 'pending').length
    };
    pledgeStats.fulfillmentRate = pledgeStats.total > 0
      ? ((pledgeStats.received / pledgeStats.total) * 100).toFixed(1)
      : 0;

    // Calculate other income
    const otherIncome = incomeSources
      .filter(i => i.source_type !== 'pledge' && i.source_type !== 'shirt_sales')
      .reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    // Calculate expense totals by category with detailed items
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const categoryName = expense.expense_categories?.name || 'Uncategorized';
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = {
          total: 0,
          items: []
        };
      }
      const amount = parseFloat(expense.paid_amount || expense.amount || 0);
      expensesByCategory[categoryName].total += amount;
      expensesByCategory[categoryName].items.push({
        description: expense.description || 'No description',
        amount: amount,
        date: expense.date,
        paidBy: expense.paid_by
      });
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.paid_amount || e.amount || 0), 0);

    // Calculate totals
    const totalIncomeReceived = pledgeStats.received + otherIncome + shirtStats.collected;
    const netBalance = totalIncomeReceived - totalExpenses;

    return {
      income: {
        pledges: pledgeStats,
        shirtSales: shirtStats,
        other: otherIncome,
        totalReceived: totalIncomeReceived
      },
      expenses: {
        byCategory: Object.entries(expensesByCategory).map(([name, data]) => ({
          name,
          amount: data.total,
          items: data.items
        })),
        total: totalExpenses,
        count: expenses.length
      },
      netBalance,
      isDeficit: netBalance < 0
    };
  } catch (error) {
    console.error('Error fetching finance report data:', error);
    return {
      income: { pledges: {}, shirtSales: {}, other: 0, totalReceived: 0 },
      expenses: { byCategory: [], total: 0, count: 0 },
      netBalance: 0,
      isDeficit: false
    };
  }
};

// ==================== EXECUTIVE SUMMARY ====================

// Get executive summary KPIs
export const getExecutiveSummary = async (people = [], stats = {}) => {
  const financeData = await getFinanceReportData(people);

  // Attendance stats
  const attendingPeople = people.filter(p => p.attendanceStatus === 'attending');
  const registeredCount = attendingPeople.filter(p => p.registered).length;
  const maxCapacity = 220;

  return {
    attendance: {
      total: attendingPeople.length,
      registered: registeredCount,
      capacity: maxCapacity,
      percentage: Math.round((registeredCount / maxCapacity) * 100)
    },
    finance: {
      totalIncome: financeData.income.totalReceived,
      totalExpenses: financeData.expenses.total,
      netBalance: financeData.netBalance,
      isDeficit: financeData.isDeficit
    }
  };
};

// ==================== EXPORT UTILITIES ====================

// Helper function to escape CSV values properly
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Helper to format row for CSV
const formatCSVRow = (row) => {
  return row.map(cell => escapeCSV(cell)).join(',');
};

// Generate CSV data for reports
export const generateReportCSV = async (people, stats) => {
  const leadershipData = await getLeadershipReportData(people);
  const financeData = await getFinanceReportData(people);
  const volunteerData = await getVolunteerActivityData();

  const rows = [
    ['Anniversary Event Report'],
    ['Generated:', new Date().toLocaleString()],
    [],
    ['=== EXECUTIVE SUMMARY ==='],
    ['Metric', 'Value'],
    ['Total Attendance', people.filter(p => p.attendanceStatus === 'attending').length],
    ['Checked In', people.filter(p => p.registered && p.attendanceStatus === 'attending').length],
    ['Capacity', 220],
    ['Total Funds', `PHP ${financeData.income.totalReceived.toLocaleString()}`],
    ['Total Expenses', `PHP ${financeData.expenses.total.toLocaleString()}`],
    ['Net Balance', `PHP ${financeData.netBalance.toLocaleString()}`],
    [],
    ['=== DEMOGRAPHICS ==='],
    ['Age Bracket', 'Count'],
    ...leadershipData.ageBrackets.map(b => [b.name, b.value]),
    [],
    ['Gender', 'Total', 'Registered', 'Pending'],
    ...leadershipData.genderBreakdown.map(g => [g.gender, g.total, g.registered, g.preRegistered]),
    [],
    ['Location', 'Total', 'Registered', 'Pending'],
    ...leadershipData.locationBreakdown.map(l => [l.location, l.total, l.registered, l.preRegistered]),
    [],
    ['=== VOLUNTEER ACTIVITY ==='],
    ['Volunteer', 'Registrations'],
    ...volunteerData.map(v => [v.name, v.count]),
    [],
    ['=== FINANCE ==='],
    ['Funds Source', 'Amount'],
    ['Pledges Received', `PHP ${financeData.income.pledges.received?.toLocaleString() || 0}`],
    ['Collected Shirt Payments', `PHP ${financeData.income.shirtSales.collected?.toLocaleString() || 0}`],
    ['Other Funds', `PHP ${financeData.income.other?.toLocaleString() || 0}`],
    [],
    ['Expense Category', 'Amount'],
    ...financeData.expenses.byCategory.map(c => [c.name, `PHP ${c.amount.toLocaleString()}`])
  ];

  return rows.map(row => formatCSVRow(row)).join('\r\n');
};
