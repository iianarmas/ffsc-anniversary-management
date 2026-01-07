/**
 * Action-Oriented Filter Presets
 * Quick access to common filtering scenarios organized by action intent
 */

import { OPERATORS } from './filterFields';

/**
 * Preset categories for organization
 */
export const PRESET_CATEGORIES = {
  FINANCIAL: 'Financial Actions',
  SHIRT_MANAGEMENT: 'Shirt Management',
  CONTACT_TASKS: 'Contact & Tasks',
  SPECIAL_CASES: 'Special Cases',
};

/**
 * Urgency levels for visual coding
 */
export const URGENCY_LEVELS = {
  HIGH: 'high',      // Red/urgent
  MEDIUM: 'medium',  // Yellow/warning
  LOW: 'low',        // Blue/info
  NEUTRAL: 'neutral', // Gray/neutral
};

/**
 * Action preset definitions
 * Each preset includes filter configuration and display properties
 */
export const ACTION_PRESETS = {
  // ===== FINANCIAL ACTIONS =====
  followUpPayment: {
    id: 'followUpPayment',
    name: 'Follow Up on Payment',
    description: 'People with shirt orders who haven\'t paid yet',
    icon: '💰',
    color: '#dc2626', // red
    category: PRESET_CATEGORIES.FINANCIAL,
    urgency: URGENCY_LEVELS.HIGH,
    filterConfig: {
      id: 'preset_followUpPayment',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_hasOrder',
          field: 'hasShirtOrder',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Has shirt order',
        },
        {
          id: 'cond_unpaid',
          field: 'paymentStatus',
          operator: OPERATORS.EQUALS,
          value: 'unpaid',
          label: 'Payment is unpaid',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
    groupBy: 'location',
  },

  paymentReceivedToday: {
    id: 'paymentReceivedToday',
    name: 'Payments Today',
    description: 'People who paid today (for verification)',
    icon: '✅',
    color: '#16a34a', // green
    category: PRESET_CATEGORIES.FINANCIAL,
    urgency: URGENCY_LEVELS.LOW,
    filterConfig: {
      id: 'preset_paymentToday',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_paid',
          field: 'paymentStatus',
          operator: OPERATORS.EQUALS,
          value: 'paid',
          label: 'Payment is paid',
        },
        // Note: Date filtering for "today" would need special handling
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  // ===== SHIRT MANAGEMENT =====
  getShirtSizes: {
    id: 'getShirtSizes',
    name: 'Get Shirt Sizes',
    description: 'People missing shirt size information',
    icon: '📏',
    color: '#ea580c', // orange
    category: PRESET_CATEGORIES.SHIRT_MANAGEMENT,
    urgency: URGENCY_LEVELS.HIGH,
    filterConfig: {
      id: 'preset_getShirtSizes',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_missingSize',
          field: 'missingSize',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Missing shirt size',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
    groupBy: 'location',
  },

  readyToDistribute: {
    id: 'readyToDistribute',
    name: 'Ready to Distribute',
    description: 'Paid orders that haven\'t been given yet',
    icon: '📦',
    color: '#0891b2', // cyan
    category: PRESET_CATEGORIES.SHIRT_MANAGEMENT,
    urgency: URGENCY_LEVELS.MEDIUM,
    filterConfig: {
      id: 'preset_readyToDistribute',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_paid',
          field: 'paymentStatus',
          operator: OPERATORS.EQUALS,
          value: 'paid',
          label: 'Payment is paid',
        },
        {
          id: 'cond_notGiven',
          field: 'distributionStatus',
          operator: OPERATORS.EQUALS,
          value: 'pending',
          label: 'Not yet given',
        },
        {
          id: 'cond_hasOrder',
          field: 'hasShirtOrder',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Has shirt order',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'location',
    groupBy: 'location',
  },

  distributedToday: {
    id: 'distributedToday',
    name: 'Distributed Today',
    description: 'Shirts given out today',
    icon: '🎉',
    color: '#16a34a', // green
    category: PRESET_CATEGORIES.SHIRT_MANAGEMENT,
    urgency: URGENCY_LEVELS.LOW,
    filterConfig: {
      id: 'preset_distributedToday',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_given',
          field: 'distributionStatus',
          operator: OPERATORS.EQUALS,
          value: 'given',
          label: 'Shirt given',
        },
        // Note: Date filtering for "today" would need special handling
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  // ===== CONTACT & TASKS =====
  needContactInfo: {
    id: 'needContactInfo',
    name: 'Need Contact Info',
    description: 'People with orders but missing contact details',
    icon: '📞',
    color: '#ea580c', // orange
    category: PRESET_CATEGORIES.CONTACT_TASKS,
    urgency: URGENCY_LEVELS.MEDIUM,
    filterConfig: {
      id: 'preset_needContact',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_missingContact',
          field: 'missingContact',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Missing contact',
        },
        {
          id: 'cond_hasOrder',
          field: 'hasShirtOrder',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Has shirt order',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  pendingTasks: {
    id: 'pendingTasks',
    name: 'Pending Tasks',
    description: 'People with active tasks that aren\'t overdue',
    icon: '✏️',
    color: '#3b82f6', // blue
    category: PRESET_CATEGORIES.CONTACT_TASKS,
    urgency: URGENCY_LEVELS.LOW,
    filterConfig: {
      id: 'preset_pendingTasks',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_hasTasks',
          field: 'hasTasks',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Has tasks',
        },
        {
          id: 'cond_notOverdue',
          field: 'hasOverdueTasks',
          operator: OPERATORS.IS_FALSE,
          value: false,
          label: 'No overdue tasks',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  overdueTasks: {
    id: 'overdueTasks',
    name: 'Overdue Tasks',
    description: 'People with tasks past their due date',
    icon: '⚠️',
    color: '#dc2626', // red
    category: PRESET_CATEGORIES.CONTACT_TASKS,
    urgency: URGENCY_LEVELS.HIGH,
    filterConfig: {
      id: 'preset_overdueTasks',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_overdue',
          field: 'hasOverdueTasks',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Has overdue tasks',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  // ===== SPECIAL CASES =====
  kidsWithoutSizes: {
    id: 'kidsWithoutSizes',
    name: 'Kids Without Sizes',
    description: 'Kids category missing shirt sizes',
    icon: '👶',
    color: '#a855f7', // purple
    category: PRESET_CATEGORIES.SPECIAL_CASES,
    urgency: URGENCY_LEVELS.MEDIUM,
    filterConfig: {
      id: 'preset_kidsWithoutSizes',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_kids',
          field: 'categories',
          operator: OPERATORS.IN,
          value: ['Kids'],
          label: 'Category is Kids',
        },
        {
          id: 'cond_missingSize',
          field: 'missingSize',
          operator: OPERATORS.IS_TRUE,
          value: true,
          label: 'Missing shirt size',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  printOrders: {
    id: 'printOrders',
    name: 'Print Orders',
    description: 'Shirts with print that need distribution',
    icon: '🎨',
    color: '#8b5cf6', // violet
    category: PRESET_CATEGORIES.SPECIAL_CASES,
    urgency: URGENCY_LEVELS.MEDIUM,
    filterConfig: {
      id: 'preset_printOrders',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_hasPrint',
          field: 'printStatus',
          operator: OPERATORS.EQUALS,
          value: 'withPrint',
          label: 'Has print',
        },
        {
          id: 'cond_notGiven',
          field: 'distributionStatus',
          operator: OPERATORS.EQUALS,
          value: 'pending',
          label: 'Not distributed',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
    groupBy: 'categories',
  },

  mainLocationPending: {
    id: 'mainLocationPending',
    name: 'Main Location Pending',
    description: 'Main location orders ready for pickup',
    icon: '🏢',
    color: '#0891b2', // cyan
    category: PRESET_CATEGORIES.SPECIAL_CASES,
    urgency: URGENCY_LEVELS.LOW,
    filterConfig: {
      id: 'preset_mainLocationPending',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_main',
          field: 'location',
          operator: OPERATORS.IN,
          value: ['Main'],
          label: 'Location is Main',
        },
        {
          id: 'cond_paid',
          field: 'paymentStatus',
          operator: OPERATORS.EQUALS,
          value: 'paid',
          label: 'Payment is paid',
        },
        {
          id: 'cond_pending',
          field: 'distributionStatus',
          operator: OPERATORS.EQUALS,
          value: 'pending',
          label: 'Pending distribution',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },

  completeOrders: {
    id: 'completeOrders',
    name: 'Complete Orders',
    description: 'Fully paid and distributed orders',
    icon: '✨',
    color: '#16a34a', // green
    category: PRESET_CATEGORIES.SPECIAL_CASES,
    urgency: URGENCY_LEVELS.NEUTRAL,
    filterConfig: {
      id: 'preset_completeOrders',
      operator: 'AND',
      conditions: [
        {
          id: 'cond_paid',
          field: 'paymentStatus',
          operator: OPERATORS.EQUALS,
          value: 'paid',
          label: 'Payment is paid',
        },
        {
          id: 'cond_given',
          field: 'distributionStatus',
          operator: OPERATORS.EQUALS,
          value: 'given',
          label: 'Shirt given',
        },
      ],
      nestedGroups: [],
    },
    sortBy: 'lastName',
  },
};

/**
 * Get presets by category
 */
export function getPresetsByCategory() {
  const categorized = {};

  Object.values(ACTION_PRESETS).forEach(preset => {
    const category = preset.category || 'Other';
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(preset);
  });

  return categorized;
}

/**
 * Get preset by ID
 */
export function getPresetById(presetId) {
  return ACTION_PRESETS[presetId] || null;
}

/**
 * Get presets by urgency level
 */
export function getPresetsByUrgency(urgency) {
  return Object.values(ACTION_PRESETS).filter(preset => preset.urgency === urgency);
}

/**
 * Get color for urgency level
 */
export function getUrgencyColor(urgency) {
  const colors = {
    [URGENCY_LEVELS.HIGH]: '#dc2626',
    [URGENCY_LEVELS.MEDIUM]: '#ea580c',
    [URGENCY_LEVELS.LOW]: '#3b82f6',
    [URGENCY_LEVELS.NEUTRAL]: '#6b7280',
  };
  return colors[urgency] || colors[URGENCY_LEVELS.NEUTRAL];
}
