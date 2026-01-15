import { supabase } from './supabase';

// ==================== INCOME SOURCES ====================

// Fetch all income sources
export const fetchIncomeSources = async () => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching income sources:', error);
    return [];
  }
};

// Add new income source
export const addIncomeSource = async (incomeData, userId) => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .insert({
        source_type: incomeData.sourceType,
        source_name: incomeData.sourceName,
        pledged_amount: incomeData.pledgedAmount || 0,
        received_amount: incomeData.receivedAmount || 0,
        status: incomeData.status || 'pending',
        notes: incomeData.notes,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error adding income source:', error);
    throw error;
  }
};

// Update income source
export const updateIncomeSource = async (id, incomeData) => {
  try {
    const { data, error } = await supabase
      .from('income_sources')
      .update({
        source_type: incomeData.sourceType,
        source_name: incomeData.sourceName,
        pledged_amount: incomeData.pledgedAmount || 0,
        received_amount: incomeData.receivedAmount || 0,
        status: incomeData.status,
        notes: incomeData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error updating income source:', error);
    throw error;
  }
};

// Delete income source
export const deleteIncomeSource = async (id) => {
  try {
    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return true;
  } catch (error) {
    console.error('Error deleting income source:', error);
    throw error;
  }
};

// ==================== EXPENSE CATEGORIES ====================

// Fetch all expense categories
export const fetchExpenseCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return [];
  }
};

// Add new expense category
export const addExpenseCategory = async (categoryData, userId) => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        created_by: userId
      })
      .select()
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error adding expense category:', error);
    throw error;
  }
};

// Update expense category
export const updateExpenseCategory = async (id, categoryData) => {
  try {
    const { data, error } = await supabase
      .from('expense_categories')
      .update({
        name: categoryData.name,
        description: categoryData.description
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error updating expense category:', error);
    throw error;
  }
};

// Delete expense category
export const deleteExpenseCategory = async (id) => {
  try {
    const { error } = await supabase
      .from('expense_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return true;
  } catch (error) {
    console.error('Error deleting expense category:', error);
    throw error;
  }
};

// ==================== EXPENSES ====================

// Fetch all expenses with category info
export const fetchExpenses = async () => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        expense_categories(id, name)
      `)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add new expense
export const addExpense = async (expenseData, userId) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        category_id: expenseData.categoryId,
        description: expenseData.description,
        total_amount: expenseData.totalAmount || expenseData.amount || 0,
        paid_amount: expenseData.paidAmount || expenseData.amount || 0,
        // Keep amount for backward compatibility (will equal paid_amount)
        amount: expenseData.paidAmount || expenseData.amount || 0,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        paid_by: expenseData.paidBy,
        notes: expenseData.notes,
        is_planned: expenseData.isPlanned || false,
        created_by: userId
      })
      .select(`
        *,
        expense_categories(id, name)
      `)
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (id, expenseData) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({
        category_id: expenseData.categoryId,
        description: expenseData.description,
        total_amount: expenseData.totalAmount || expenseData.amount || 0,
        paid_amount: expenseData.paidAmount || expenseData.amount || 0,
        // Keep amount for backward compatibility (will equal paid_amount)
        amount: expenseData.paidAmount || expenseData.amount || 0,
        date: expenseData.date,
        paid_by: expenseData.paidBy,
        notes: expenseData.notes,
        is_planned: expenseData.isPlanned || false
      })
      .eq('id', id)
      .select(`
        *,
        expense_categories(id, name)
      `)
      .single();

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return data;
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

// Delete expense
export const deleteExpense = async (id) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
    window.dispatchEvent(new Event('financeUpdated'));
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// ==================== SUMMARY & AGGREGATIONS ====================

// Get finance summary with all totals
export const getFinanceSummary = async (shirtCollectionData = null) => {
  try {
    // Fetch income sources
    const incomeSources = await fetchIncomeSources();

    // Fetch expenses with categories
    const expenses = await fetchExpenses();

    // Calculate income totals
    const pledgeIncome = incomeSources.filter(i => i.source_type === 'pledge');
    const otherIncome = incomeSources.filter(i => i.source_type !== 'pledge' && i.source_type !== 'shirt_sales');

    const totalPledged = pledgeIncome.reduce((sum, i) => sum + parseFloat(i.pledged_amount || 0), 0);
    const totalPledgeReceived = pledgeIncome.reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);
    const totalOtherIncome = otherIncome.reduce((sum, i) => sum + parseFloat(i.received_amount || 0), 0);

    // Shirt sales from collections (passed in from parent)
    const shirtSalesReceived = shirtCollectionData?.collected || 0;
    const shirtSalesTotal = shirtCollectionData?.total || 0;

    // Calculate expense totals by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const categoryName = expense.expense_categories?.name || 'Uncategorized';
      if (!expensesByCategory[categoryName]) {
        expensesByCategory[categoryName] = 0;
      }
      expensesByCategory[categoryName] += parseFloat(expense.amount || 0);
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    // Total income (received only)
    const totalIncomeReceived = totalPledgeReceived + totalOtherIncome + shirtSalesReceived;
    const totalIncomePledged = totalPledged + totalOtherIncome + shirtSalesTotal;

    // Net balance
    const netBalance = totalIncomeReceived - totalExpenses;

    return {
      income: {
        pledges: {
          total: totalPledged,
          received: totalPledgeReceived,
          pending: totalPledged - totalPledgeReceived,
          count: pledgeIncome.length,
          fulfilled: pledgeIncome.filter(p => p.status === 'fulfilled').length
        },
        shirtSales: {
          total: shirtSalesTotal,
          received: shirtSalesReceived,
          pending: shirtSalesTotal - shirtSalesReceived
        },
        other: {
          total: totalOtherIncome,
          received: totalOtherIncome
        },
        totalPledged: totalIncomePledged,
        totalReceived: totalIncomeReceived
      },
      expenses: {
        byCategory: expensesByCategory,
        total: totalExpenses,
        count: expenses.length
      },
      netBalance,
      isDeficit: netBalance < 0
    };
  } catch (error) {
    console.error('Error getting finance summary:', error);
    throw error;
  }
};

// Subscribe to finance changes (for real-time updates)
export const subscribeToFinanceChanges = (callback) => {
  const channel = supabase
    .channel('finance-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'income_sources' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_categories' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
