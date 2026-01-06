/**
 * Filter field definitions with metadata for the advanced filter system
 * Defines all filterable fields, their types, options, and display properties
 */

// Shirt pricing for amount calculations
export const SHIRT_PRICING = {
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

// Size categories
export const KIDS_SIZES = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12'];
export const TEEN_SIZES = ['TS'];
export const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];

/**
 * Field type definitions
 * - select: Single selection dropdown
 * - multiSelect: Multiple selection (checkboxes)
 * - boolean: True/false toggle
 * - range: Min/max numeric range
 * - text: Text input
 * - date: Date picker
 * - dateRange: From/to date range
 */
export const FIELD_TYPES = {
  SELECT: 'select',
  MULTI_SELECT: 'multiSelect',
  BOOLEAN: 'boolean',
  RANGE: 'range',
  TEXT: 'text',
  DATE: 'date',
  DATE_RANGE: 'dateRange',
};

/**
 * Operator definitions for different field types
 */
export const OPERATORS = {
  // For select/multiSelect fields
  EQUALS: 'equals',
  NOT_EQUALS: 'notEquals',
  IN: 'in',
  NOT_IN: 'notIn',

  // For text fields
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',

  // For numeric/date fields
  GREATER_THAN: 'greaterThan',
  LESS_THAN: 'lessThan',
  BETWEEN: 'between',

  // For boolean fields
  IS_TRUE: 'isTrue',
  IS_FALSE: 'isFalse',

  // For existence checks
  IS_EMPTY: 'isEmpty',
  IS_NOT_EMPTY: 'isNotEmpty',
};

/**
 * Filter field categories for grouping in UI
 */
export const FILTER_CATEGORIES = {
  PAYMENT: 'Payment & Amount',
  SHIRT: 'Shirt Details',
  LOCATION: 'Location & Category',
  CONTACT: 'Contact & Notes',
  REGISTRATION: 'Registration',
  ATTENDANCE: 'Attendance',
};

/**
 * Common filter fields across all views
 */
export const COMMON_FILTER_FIELDS = {
  paymentStatus: {
    label: 'Payment Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.PAYMENT,
    options: [
      { value: 'paid', label: 'Paid' },
      { value: 'unpaid', label: 'Unpaid' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  printStatus: {
    label: 'Print Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      { value: 'withPrint', label: 'With Print' },
      { value: 'plain', label: 'Plain' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  categories: {
    label: 'Category (Kids/Teen/Adult)',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.LOCATION,
    options: [
      { value: 'Kids', label: 'Kids' },
      { value: 'Teen', label: 'Teen' },
      { value: 'Adult', label: 'Adult' },
      { value: 'No Order', label: 'No Order' },
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
  },

  location: {
    label: 'Location',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.LOCATION,
    options: [
      { value: 'Main', label: 'Main' },
      { value: 'Annex 2', label: 'Annex 2' },
      { value: 'Annex 3', label: 'Annex 3' },
      { value: 'Online', label: 'Online' },
      { value: 'Other', label: 'Other' },
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
  },

  amount: {
    label: 'Amount',
    type: FIELD_TYPES.RANGE,
    category: FILTER_CATEGORIES.PAYMENT,
    min: 0,
    max: 300,
    step: 1,
    defaultOperator: OPERATORS.BETWEEN,
    availableOperators: [OPERATORS.BETWEEN, OPERATORS.GREATER_THAN, OPERATORS.LESS_THAN, OPERATORS.EQUALS],
  },

  name: {
    label: 'Name',
    type: FIELD_TYPES.TEXT,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.CONTAINS,
    availableOperators: [OPERATORS.CONTAINS, OPERATORS.NOT_CONTAINS, OPERATORS.STARTS_WITH, OPERATORS.ENDS_WITH, OPERATORS.EQUALS],
  },

  hasNotes: {
    label: 'Has Notes',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },

  hasTasks: {
    label: 'Has Tasks',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },

  hasOverdueTasks: {
    label: 'Has Overdue Tasks',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },

  missingContact: {
    label: 'Missing Contact Info',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },
};

/**
 * Shirt-specific filter fields
 */
export const SHIRT_FILTER_FIELDS = {
  shirtSize: {
    label: 'Shirt Size',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      ...KIDS_SIZES.map(size => ({ value: size, label: size })),
      ...TEEN_SIZES.map(size => ({ value: size, label: size })),
      ...ADULT_SIZES.map(size => ({ value: size, label: size })),
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS, OPERATORS.IN, OPERATORS.NOT_IN],
  },

  distributionStatus: {
    label: 'Distribution Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      { value: 'given', label: 'Given' },
      { value: 'pending', label: 'Pending' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  missingSize: {
    label: 'Missing Size',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.SHIRT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },

  ageBracket: {
    label: 'Age Bracket',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.REGISTRATION,
    options: [
      { value: 'kids', label: 'Kids' },
      { value: 'youth', label: 'Youth' },
      { value: 'adults', label: 'Adults' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS, OPERATORS.IN],
  },
};

/**
 * Registration-specific filter fields
 */
export const REGISTRATION_FILTER_FIELDS = {
  registrationStatus: {
    label: 'Registration Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.REGISTRATION,
    options: [
      { value: 'registered', label: 'Registered' },
      { value: 'notRegistered', label: 'Not Registered' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  checkInStatus: {
    label: 'Check-in Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.ATTENDANCE,
    options: [
      { value: 'checkedIn', label: 'Checked In' },
      { value: 'notCheckedIn', label: 'Not Checked In' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  attendanceStatus: {
    label: 'Attendance Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.ATTENDANCE,
    options: [
      { value: 'attending', label: 'Attending' },
      { value: 'shirt_only', label: 'Shirt Only' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  registrationDate: {
    label: 'Registration Date',
    type: FIELD_TYPES.DATE_RANGE,
    category: FILTER_CATEGORIES.REGISTRATION,
    defaultOperator: OPERATORS.BETWEEN,
    availableOperators: [OPERATORS.BETWEEN, OPERATORS.GREATER_THAN, OPERATORS.LESS_THAN, OPERATORS.EQUALS],
  },

  hasShirtOrder: {
    label: 'Has Shirt Order',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.SHIRT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },

  missingInfo: {
    label: 'Missing Information',
    type: FIELD_TYPES.BOOLEAN,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.IS_TRUE,
    availableOperators: [OPERATORS.IS_TRUE, OPERATORS.IS_FALSE],
  },
};

/**
 * Get filter fields based on view type
 */
export function getFilterFieldsForView(viewType) {
  const baseFields = { ...COMMON_FILTER_FIELDS };

  switch (viewType) {
    case 'shirts':
      return { ...baseFields, ...SHIRT_FILTER_FIELDS };
    case 'registration':
      return { ...baseFields, ...REGISTRATION_FILTER_FIELDS };
    case 'collections':
    default:
      return baseFields;
  }
}

/**
 * Get grouped filter fields by category
 */
export function getGroupedFilterFields(viewType) {
  const fields = getFilterFieldsForView(viewType);
  const grouped = {};

  Object.entries(fields).forEach(([key, field]) => {
    const category = field.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, ...field });
  });

  return grouped;
}
