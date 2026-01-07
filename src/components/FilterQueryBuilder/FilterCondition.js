import React from 'react';
import { X } from 'lucide-react';
import FieldSelector from './FieldSelector';
import OperatorSelector from './OperatorSelector';
import ValueInput from './ValueInput';
import { getFilterFieldsForView } from '../../constants/filterFields';

/**
 * FilterCondition Component
 * Represents a single filter condition row (field + operator + value)
 */
export default function FilterCondition({
  condition,
  viewType,
  onChange,
  onRemove,
  canRemove = true,
}) {
  const filterFields = getFilterFieldsForView(viewType);
  const fieldDef = filterFields[condition.field];

  const handleFieldChange = (field) => {
    const newFieldDef = filterFields[field];
    const defaultOperator = newFieldDef?.defaultOperator || 'equals';

    onChange({
      ...condition,
      field,
      operator: defaultOperator,
      value: getDefaultValueForField(newFieldDef),
      label: `${newFieldDef?.label || field} ${defaultOperator}`,
    });
  };

  const handleOperatorChange = (operator) => {
    onChange({
      ...condition,
      operator,
      value: getDefaultValueForOperator(operator, fieldDef),
      label: `${fieldDef?.label || condition.field} ${operator}`,
    });
  };

  const handleValueChange = (value) => {
    onChange({
      ...condition,
      value,
    });
  };

  return (
    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Field Selector */}
      <div className="flex-1 min-w-[180px]">
        <FieldSelector
          viewType={viewType}
          value={condition.field}
          onChange={handleFieldChange}
        />
      </div>

      {/* Operator Selector */}
      {condition.field && fieldDef && (
        <div className="min-w-[140px]">
          <OperatorSelector
            fieldDef={fieldDef}
            value={condition.operator}
            onChange={handleOperatorChange}
          />
        </div>
      )}

      {/* Value Input */}
      {condition.field && fieldDef && needsValueInput(condition.operator) && (
        <ValueInput
          field={condition.field}
          fieldDef={fieldDef}
          value={condition.value}
          onChange={handleValueChange}
          operator={condition.operator}
        />
      )}

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Remove condition"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

/**
 * Helper: Get default value based on field definition
 */
function getDefaultValueForField(fieldDef) {
  if (!fieldDef) return '';

  switch (fieldDef.type) {
    case 'select':
      return fieldDef.options[0]?.value || '';
    case 'multiSelect':
      return [];
    case 'boolean':
      return true;
    case 'range':
      return [fieldDef.min || 0, fieldDef.max || 100];
    case 'dateRange':
      return ['', ''];
    default:
      return '';
  }
}

/**
 * Helper: Get default value based on operator
 */
function getDefaultValueForOperator(operator, fieldDef) {
  if (operator === 'between') {
    if (fieldDef?.type === 'range') {
      return [fieldDef.min || 0, fieldDef.max || 100];
    }
    if (fieldDef?.type === 'dateRange') {
      return ['', ''];
    }
    return ['', ''];
  }

  if (operator === 'in' || operator === 'notIn') {
    return [];
  }

  if (operator === 'isTrue') {
    return true;
  }

  if (operator === 'isFalse') {
    return false;
  }

  return getDefaultValueForField(fieldDef);
}

/**
 * Helper: Check if operator needs value input
 */
function needsValueInput(operator) {
  const noValueOperators = ['isTrue', 'isFalse', 'isEmpty', 'isNotEmpty'];
  return !noValueOperators.includes(operator);
}
