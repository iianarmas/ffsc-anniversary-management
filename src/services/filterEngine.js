/**
 * Filter Engine - Core filtering logic with AND/OR support
 * Handles complex filter groups with nested conditions
 */

import { OPERATORS, SHIRT_PRICING, KIDS_SIZES, TEEN_SIZES } from '../constants/filterFields';

/**
 * Main filter application function
 * Applies filter groups to a list of people
 *
 * @param {Array} people - Array of person objects
 * @param {Object} filterGroup - Filter group configuration
 * @param {Object} peopleTaskInfo - Task information for people (optional)
 * @returns {Array} Filtered list of people
 */
export function applyFilterGroups(people, filterGroup, peopleTaskInfo = {}) {
  if (!filterGroup || !filterGroup.conditions || filterGroup.conditions.length === 0) {
    return people;
  }

  return people.filter(person => evaluateFilterGroup(person, filterGroup, peopleTaskInfo));
}

/**
 * Evaluate a filter group against a person
 *
 * @param {Object} person - Person object
 * @param {Object} group - Filter group with operator and conditions
 * @param {Object} peopleTaskInfo - Task information
 * @returns {boolean} Whether the person matches the filter group
 */
export function evaluateFilterGroup(person, group, peopleTaskInfo = {}) {
  const { operator = 'AND', conditions = [], nestedGroups = [] } = group;

  // Evaluate all conditions
  const conditionResults = conditions.map(condition =>
    evaluateCondition(person, condition, peopleTaskInfo)
  );

  // Evaluate nested groups (one level deep only)
  const nestedResults = nestedGroups.map(nestedGroup =>
    evaluateFilterGroup(person, nestedGroup, peopleTaskInfo)
  );

  // Combine condition and nested group results
  const allResults = [...conditionResults, ...nestedResults];

  // Apply operator logic
  if (operator === 'OR') {
    return allResults.some(result => result === true);
  } else {
    // AND operator
    return allResults.every(result => result === true);
  }
}

/**
 * Evaluate a single condition against a person
 *
 * @param {Object} person - Person object
 * @param {Object} condition - Condition configuration
 * @param {Object} peopleTaskInfo - Task information
 * @returns {boolean} Whether the person matches the condition
 */
export function evaluateCondition(person, condition, peopleTaskInfo = {}) {
  const { field, operator, value } = condition;
  const fieldValue = getFieldValue(person, field, peopleTaskInfo);

  switch (operator) {
    // Select/equality operators
    case OPERATORS.EQUALS:
      return fieldValue === value;

    case OPERATORS.NOT_EQUALS:
      return fieldValue !== value;

    case OPERATORS.IN:
      return Array.isArray(value) ? value.includes(fieldValue) : false;

    case OPERATORS.NOT_IN:
      return Array.isArray(value) ? !value.includes(fieldValue) : true;

    // Text operators
    case OPERATORS.CONTAINS:
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

    case OPERATORS.NOT_CONTAINS:
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());

    case OPERATORS.STARTS_WITH:
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());

    case OPERATORS.ENDS_WITH:
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());

    // Numeric/comparison operators
    case OPERATORS.GREATER_THAN:
      return Number(fieldValue) > Number(value);

    case OPERATORS.LESS_THAN:
      return Number(fieldValue) < Number(value);

    case OPERATORS.BETWEEN:
      if (Array.isArray(value) && value.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= Number(value[0]) && numValue <= Number(value[1]);
      }
      return false;

    // Boolean operators
    case OPERATORS.IS_TRUE:
      return fieldValue === true;

    case OPERATORS.IS_FALSE:
      return fieldValue === false;

    // Existence operators
    case OPERATORS.IS_EMPTY:
      return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;

    case OPERATORS.IS_NOT_EMPTY:
      return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;

    default:
      console.warn(`Unknown operator: ${operator}`);
      return true;
  }
}

/**
 * Get the value of a field from a person object
 * Maps field names to actual person properties and calculates derived values
 *
 * @param {Object} person - Person object
 * @param {string} field - Field name
 * @param {Object} peopleTaskInfo - Task information
 * @returns {*} Field value
 */
export function getFieldValue(person, field, peopleTaskInfo = {}) {
  const taskInfo = peopleTaskInfo[person.id] || {};

  switch (field) {
    // Payment & Amount
    case 'paymentStatus':
      return person.paid ? 'paid' : 'unpaid';

    case 'printStatus':
      return person.hasPrint ? 'withPrint' : 'plain';

    case 'amount':
      return getShirtPrice(person);

    // Categories (for collections view - shirt category based on size)
    case 'categories':
    case 'shirtCategory':
      return getSizeCategory(person.shirtSize);

    case 'location':
      return person.location;

    // Name
    case 'name':
      return `${person.firstName || ''} ${person.lastName || ''}`.trim();

    // Contact & Tasks
    case 'hasNotes':
      return taskInfo.hasNotes || false;

    case 'hasTasks':
      return taskInfo.hasTasks || false;

    case 'hasOverdueTasks':
      return taskInfo.hasTasks && taskInfo.incompleteTasksCount > 0;

    case 'missingContact':
      return !person.contactNumber || person.contactNumber === '';

    // Shirt fields
    case 'shirtSize':
      return person.shirtSize;

    case 'distributionStatus':
      return person.shirtGiven ? 'given' : 'pending';

    case 'missingSize':
      return !person.shirtSize ||
             person.shirtSize === '' ||
             person.shirtSize === 'Select Size' ||
             person.shirtSize === 'None yet' ||
             person.shirtSize === 'No shirt';

    case 'ageBracket':
      return person.ageBracket;

    // Registration fields
    case 'registrationStatus':
      const hasRegistration = person.registrationStatus === 'Registered' || person.checkInStatus === 'Checked In';
      return hasRegistration ? 'registered' : 'notRegistered';

    case 'checkInStatus':
      return person.checkInStatus === 'Checked In' ? 'checkedIn' : 'notCheckedIn';

    case 'attendanceStatus':
      return person.attendanceStatus;

    case 'registrationDate':
      return person.registrationDate;

    case 'hasShirtOrder':
      const hasOrder = person.shirtSize &&
                      person.shirtSize !== '' &&
                      person.shirtSize !== 'No shirt' &&
                      person.shirtSize !== 'Select Size';
      return hasOrder;

    case 'missingInfo':
      return !person.firstName || !person.lastName || !person.contactNumber;

    default:
      // Direct property access for unmapped fields
      return person[field];
  }
}

/**
 * Calculate shirt price based on size and print status
 *
 * @param {Object} person - Person object
 * @returns {number} Price in pesos
 */
export function getShirtPrice(person) {
  if (!person.shirtSize ||
      person.shirtSize === 'No shirt' ||
      person.shirtSize === 'Select Size' ||
      person.shirtSize === '') {
    return 0;
  }

  const pricingTable = person.hasPrint ? SHIRT_PRICING.withPrint : SHIRT_PRICING.plain;
  return pricingTable[person.shirtSize] || 0;
}

/**
 * Determine size category (Kids/Teen/Adult) from shirt size
 *
 * @param {string} size - Shirt size
 * @returns {string} Category: 'Kids', 'Teen', 'Adult', or 'No Order'
 */
export function getSizeCategory(size) {
  if (!size || size === 'No shirt' || size === 'Select Size' || size === '') {
    return 'No Order';
  }

  if (KIDS_SIZES.includes(size)) return 'Kids';
  if (TEEN_SIZES.includes(size)) return 'Teen';
  return 'Adult';
}

/**
 * Convert old filter format to new filter group format
 * For backward compatibility with existing saved filters
 *
 * @param {Object} oldFilters - Old flat filter object
 * @returns {Object} New filter group format
 */
export function migrateOldFilters(oldFilters) {
  const conditions = [];

  // Payment status
  if (oldFilters.paymentStatus && oldFilters.paymentStatus !== 'All') {
    conditions.push({
      id: `condition_${Date.now()}_payment`,
      field: 'paymentStatus',
      operator: OPERATORS.EQUALS,
      value: oldFilters.paymentStatus === 'Paid' ? 'paid' : 'unpaid',
      label: `Payment is ${oldFilters.paymentStatus}`,
    });
  }

  // Print status
  if (oldFilters.printStatus && oldFilters.printStatus !== 'All') {
    conditions.push({
      id: `condition_${Date.now()}_print`,
      field: 'printStatus',
      operator: OPERATORS.EQUALS,
      value: oldFilters.printStatus === 'With Print' ? 'withPrint' : 'plain',
      label: `Print is ${oldFilters.printStatus}`,
    });
  }

  // Categories
  if (oldFilters.categories && oldFilters.categories.length > 0) {
    conditions.push({
      id: `condition_${Date.now()}_categories`,
      field: 'categories',
      operator: OPERATORS.IN,
      value: oldFilters.categories,
      label: `Category is ${oldFilters.categories.join(', ')}`,
    });
  }

  // Locations
  if (oldFilters.locations && oldFilters.locations.length > 0) {
    conditions.push({
      id: `condition_${Date.now()}_locations`,
      field: 'location',
      operator: OPERATORS.IN,
      value: oldFilters.locations,
      label: `Location is ${oldFilters.locations.join(', ')}`,
    });
  }

  // Amount range
  if (oldFilters.amountMin || oldFilters.amountMax) {
    const min = parseFloat(oldFilters.amountMin) || 0;
    const max = parseFloat(oldFilters.amountMax) || 999999;
    conditions.push({
      id: `condition_${Date.now()}_amount`,
      field: 'amount',
      operator: OPERATORS.BETWEEN,
      value: [min, max],
      label: `Amount between ₱${min} and ₱${max}`,
    });
  }

  // Name search
  if (oldFilters.nameSearch) {
    conditions.push({
      id: `condition_${Date.now()}_name`,
      field: 'name',
      operator: OPERATORS.CONTAINS,
      value: oldFilters.nameSearch,
      label: `Name contains "${oldFilters.nameSearch}"`,
    });
  }

  // Boolean filters
  if (oldFilters.hasNotes) {
    conditions.push({
      id: `condition_${Date.now()}_notes`,
      field: 'hasNotes',
      operator: OPERATORS.IS_TRUE,
      value: true,
      label: 'Has notes',
    });
  }

  if (oldFilters.hasTasks) {
    conditions.push({
      id: `condition_${Date.now()}_tasks`,
      field: 'hasTasks',
      operator: OPERATORS.IS_TRUE,
      value: true,
      label: 'Has tasks',
    });
  }

  if (oldFilters.hasOverdueTasks) {
    conditions.push({
      id: `condition_${Date.now()}_overdue`,
      field: 'hasOverdueTasks',
      operator: OPERATORS.IS_TRUE,
      value: true,
      label: 'Has overdue tasks',
    });
  }

  if (oldFilters.missingContact) {
    conditions.push({
      id: `condition_${Date.now()}_contact`,
      field: 'missingContact',
      operator: OPERATORS.IS_TRUE,
      value: true,
      label: 'Missing contact',
    });
  }

  // Shirt-specific filters
  if (oldFilters.shirtSize && oldFilters.shirtSize !== 'All') {
    conditions.push({
      id: `condition_${Date.now()}_size`,
      field: 'shirtSize',
      operator: OPERATORS.EQUALS,
      value: oldFilters.shirtSize,
      label: `Shirt size is ${oldFilters.shirtSize}`,
    });
  }

  if (oldFilters.distributionStatus && oldFilters.distributionStatus !== 'All') {
    conditions.push({
      id: `condition_${Date.now()}_distribution`,
      field: 'distributionStatus',
      operator: OPERATORS.EQUALS,
      value: oldFilters.distributionStatus === 'Given' ? 'given' : 'pending',
      label: `Distribution is ${oldFilters.distributionStatus}`,
    });
  }

  if (oldFilters.missingSize) {
    conditions.push({
      id: `condition_${Date.now()}_missingSize`,
      field: 'missingSize',
      operator: OPERATORS.IS_TRUE,
      value: true,
      label: 'Missing shirt size',
    });
  }

  return {
    id: `group_${Date.now()}`,
    operator: 'AND', // Old filters were always AND
    conditions,
    nestedGroups: [],
  };
}
