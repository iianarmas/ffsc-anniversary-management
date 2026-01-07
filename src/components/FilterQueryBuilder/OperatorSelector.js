import React from 'react';
import { OPERATORS } from '../../constants/filterFields';

/**
 * OperatorSelector Component
 * Dropdown for selecting filter operators
 */
export default function OperatorSelector({ fieldDef, value, onChange }) {
  const operators = fieldDef?.availableOperators || [OPERATORS.EQUALS];

  const operatorLabels = {
    [OPERATORS.EQUALS]: 'equals',
    [OPERATORS.NOT_EQUALS]: 'does not equal',
    [OPERATORS.IN]: 'is one of',
    [OPERATORS.NOT_IN]: 'is not one of',
    [OPERATORS.CONTAINS]: 'contains',
    [OPERATORS.NOT_CONTAINS]: 'does not contain',
    [OPERATORS.STARTS_WITH]: 'starts with',
    [OPERATORS.ENDS_WITH]: 'ends with',
    [OPERATORS.GREATER_THAN]: 'greater than',
    [OPERATORS.LESS_THAN]: 'less than',
    [OPERATORS.BETWEEN]: 'between',
    [OPERATORS.IS_TRUE]: 'is true',
    [OPERATORS.IS_FALSE]: 'is false',
    [OPERATORS.IS_EMPTY]: 'is empty',
    [OPERATORS.IS_NOT_EMPTY]: 'is not empty',
  };

  return (
    <select
      value={value || operators[0]}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
    >
      {operators.map(operator => (
        <option key={operator} value={operator}>
          {operatorLabels[operator] || operator}
        </option>
      ))}
    </select>
  );
}
