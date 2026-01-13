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
 * Order matters - categories appear in this order in the UI
 */
export const FILTER_CATEGORIES = {
  PAYMENT: 'Payment & Amount',
  SHIRT: 'Shirt Details',
  REGISTRATION: 'Registration',
  ATTENDANCE: 'Attendance',
  LOCATION: 'Location & Age',
  CONTACT: 'Contact & Notes',
};

/**
 * Category display order for each view type
 * This determines which categories appear first in the field selector
 */
export const CATEGORY_ORDER_BY_VIEW = {
  registration: [
    'Registration',
    'Attendance',
    'Location & Age',
    'Contact & Notes',
  ],
  shirts: [
    'Shirt Details',
    'Payment & Amount',
    'Attendance',
    'Location & Age',
    'Contact & Notes',
  ],
  collections: [
    'Payment & Amount',
    'Shirt Details',
    'Location & Age',
    'Contact & Notes',
  ],
};

/**
 * Common filter fields - Name and Contact fields available in all views
 */
export const COMMON_FILTER_FIELDS = {
  name: {
    label: 'Name',
    type: FIELD_TYPES.TEXT,
    category: FILTER_CATEGORIES.CONTACT,
    defaultOperator: OPERATORS.CONTAINS,
    availableOperators: [OPERATORS.CONTAINS, OPERATORS.NOT_CONTAINS, OPERATORS.STARTS_WITH, OPERATORS.ENDS_WITH, OPERATORS.EQUALS],
  },

  location: {
    label: 'Location',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.LOCATION,
    options: [
      { value: 'Main', label: 'Main' },
      { value: 'Cobol', label: 'Cobol' },
      { value: 'Malacañang', label: 'Malacañang' },
      { value: 'Guest', label: 'Guest' },
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
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
 * Collections view filter fields (Payment & Shirt details for collection)
 */
export const COLLECTIONS_FILTER_FIELDS = {
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

  shirtCategory: {
    label: 'Shirt Category',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      { value: 'Kids', label: 'Kids' },
      { value: 'Teen', label: 'Teen' },
      { value: 'Adult', label: 'Adult' },
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
};

/**
 * Shirt management view filter fields
 */
export const SHIRT_FILTER_FIELDS = {
  shirtSize: {
    label: 'Shirt Size',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      ...KIDS_SIZES.map(size => ({ value: size, label: size })),
      ...TEEN_SIZES.map(size => ({ value: size, label: size })),
      ...ADULT_SIZES.map(size => ({ value: size, label: size })),
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
  },

  shirtCategory: {
    label: 'Shirt Category',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.SHIRT,
    options: [
      { value: 'Kids', label: 'Kids' },
      { value: 'Teen', label: 'Teen' },
      { value: 'Adult', label: 'Adult' },
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
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
};

/**
 * Registration view filter fields
 */
export const REGISTRATION_FILTER_FIELDS = {
  age: {
    label: 'Age',
    type: FIELD_TYPES.RANGE,
    category: FILTER_CATEGORIES.LOCATION,
    min: 0,
    max: 100,
    step: 1,
    defaultOperator: OPERATORS.BETWEEN,
    availableOperators: [OPERATORS.BETWEEN, OPERATORS.GREATER_THAN, OPERATORS.LESS_THAN, OPERATORS.EQUALS],
  },

  ageBracket: {
    label: 'Age Bracket',
    type: FIELD_TYPES.MULTI_SELECT,
    category: FILTER_CATEGORIES.LOCATION,
    options: [
      { value: 'Toddler', label: 'Toddler (0-3)' },
      { value: 'Kid', label: 'Kid (4-12)' },
      { value: 'Youth', label: 'Youth (13-20)' },
      { value: 'Adult', label: 'Adult (21+)' },
    ],
    defaultOperator: OPERATORS.IN,
    availableOperators: [OPERATORS.IN, OPERATORS.NOT_IN],
  },

  registrationStatus: {
    label: 'Check-in Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.REGISTRATION,
    options: [
      { value: 'registered', label: 'Checked In' },
      { value: 'notRegistered', label: 'Not Checked In' },
    ],
    defaultOperator: OPERATORS.EQUALS,
    availableOperators: [OPERATORS.EQUALS, OPERATORS.NOT_EQUALS],
  },

  attendanceStatus: {
    label: 'Attendance Status',
    type: FIELD_TYPES.SELECT,
    category: FILTER_CATEGORIES.ATTENDANCE,
    options: [
      { value: 'attending', label: 'Attending Event' },
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
    category: FILTER_CATEGORIES.REGISTRATION,
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
      // Shirt management: Common fields + shirt-specific fields
      return { ...baseFields, ...SHIRT_FILTER_FIELDS };
    case 'registration':
      // Registration: Common fields + registration-specific fields
      return { ...baseFields, ...REGISTRATION_FILTER_FIELDS };
    case 'collections':
      // Collections: Common fields + collection-specific fields (payment & shirt details)
      return { ...baseFields, ...COLLECTIONS_FILTER_FIELDS };
    default:
      return baseFields;
  }
}

/**
 * Get grouped filter fields by category with view-specific ordering
 */
export function getGroupedFilterFields(viewType) {
  const fields = getFilterFieldsForView(viewType);
  const grouped = {};

  // First, group all fields by category
  Object.entries(fields).forEach(([key, field]) => {
    const category = field.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, ...field });
  });

  // Get the category order for this view type
  const categoryOrder = CATEGORY_ORDER_BY_VIEW[viewType] || Object.values(FILTER_CATEGORIES);

  // Return grouped fields sorted by category order
  const sortedGrouped = {};
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      sortedGrouped[category] = grouped[category];
    }
  });

  // Add any remaining categories not in the order list
  Object.keys(grouped).forEach(category => {
    if (!sortedGrouped[category]) {
      sortedGrouped[category] = grouped[category];
    }
  });

  return sortedGrouped;
}
