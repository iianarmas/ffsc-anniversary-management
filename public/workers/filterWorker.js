/**
 * Web Worker for Filter Processing
 * Offloads heavy filter computations to a background thread
 * to prevent UI blocking on large datasets
 */

// Import filter engine logic (will need to be bundled for worker)
// For now, we'll include the core logic directly

/**
 * Evaluate a single condition
 */
function evaluateCondition(person, condition, peopleTaskInfo = {}) {
  const { field, operator, value } = condition;
  const fieldValue = getFieldValue(person, field, peopleTaskInfo);

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'in':
      return Array.isArray(value) ? value.includes(fieldValue) : false;
    case 'notIn':
      return Array.isArray(value) ? !value.includes(fieldValue) : true;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case 'notContains':
      return !String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
    case 'startsWith':
      return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
    case 'endsWith':
      return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
    case 'greaterThan':
      return Number(fieldValue) > Number(value);
    case 'lessThan':
      return Number(fieldValue) < Number(value);
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const numValue = Number(fieldValue);
        return numValue >= Number(value[0]) && numValue <= Number(value[1]);
      }
      return false;
    case 'isTrue':
      return fieldValue === true;
    case 'isFalse':
      return fieldValue === false;
    case 'isEmpty':
      return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
    case 'isNotEmpty':
      return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
    default:
      return true;
  }
}

/**
 * Evaluate a filter group
 */
function evaluateFilterGroup(person, group, peopleTaskInfo = {}) {
  const { operator = 'AND', conditions = [], nestedGroups = [] } = group;

  const conditionResults = conditions.map(condition =>
    evaluateCondition(person, condition, peopleTaskInfo)
  );

  const nestedResults = nestedGroups.map(nestedGroup =>
    evaluateFilterGroup(person, nestedGroup, peopleTaskInfo)
  );

  const allResults = [...conditionResults, ...nestedResults];

  if (operator === 'OR') {
    return allResults.some(result => result === true);
  } else {
    return allResults.every(result => result === true);
  }
}

/**
 * Get field value from person object
 */
function getFieldValue(person, field, peopleTaskInfo = {}) {
  const taskInfo = peopleTaskInfo[person.id] || {};

  switch (field) {
    case 'paymentStatus':
      return person.paid ? 'paid' : 'unpaid';
    case 'printStatus':
      return person.hasPrint ? 'withPrint' : 'plain';
    case 'amount':
      return getShirtPrice(person);
    case 'categories':
      return getSizeCategory(person.shirtSize);
    case 'location':
      return person.location;
    case 'name':
      return `${person.firstName || ''} ${person.lastName || ''}`.trim();
    case 'hasNotes':
      return taskInfo.hasNotes || false;
    case 'hasTasks':
      return taskInfo.hasTasks || false;
    case 'hasOverdueTasks':
      return taskInfo.hasTasks && taskInfo.incompleteTasksCount > 0;
    case 'missingContact':
      return !person.contactNumber || person.contactNumber === '';
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
      return person[field];
  }
}

function getShirtPrice(person) {
  if (!person.shirtSize ||
      person.shirtSize === 'No shirt' ||
      person.shirtSize === 'Select Size' ||
      person.shirtSize === '') {
    return 0;
  }

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

  const pricingTable = person.hasPrint ? SHIRT_PRICING.withPrint : SHIRT_PRICING.plain;
  return pricingTable[person.shirtSize] || 0;
}

function getSizeCategory(size) {
  if (!size || size === 'No shirt' || size === 'Select Size' || size === '') {
    return 'No Order';
  }

  const KIDS_SIZES = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12'];
  const TEEN_SIZES = ['TS'];

  if (KIDS_SIZES.includes(size)) return 'Kids';
  if (TEEN_SIZES.includes(size)) return 'Teen';
  return 'Adult';
}

/**
 * Main message handler
 */
self.onmessage = function(e) {
  const { people, filterGroup, peopleTaskInfo } = e.data;

  try {
    const startTime = performance.now();

    // Apply filters
    const filtered = people.filter(person =>
      evaluateFilterGroup(person, filterGroup, peopleTaskInfo)
    );

    const endTime = performance.now();

    // Send results back
    self.postMessage({
      success: true,
      results: filtered,
      count: filtered.length,
      duration: endTime - startTime,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
    });
  }
};
