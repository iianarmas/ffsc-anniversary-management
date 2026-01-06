import React from 'react';
import { FIELD_TYPES } from '../../constants/filterFields';

/**
 * ValueInput Component
 * Dynamic input component that changes based on field type
 */
export default function ValueInput({ field, fieldDef, value, onChange, operator }) {
  if (!fieldDef) {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter value"
      />
    );
  }

  // Select field (single selection)
  if (fieldDef.type === FIELD_TYPES.SELECT) {
    return (
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select option...</option>
        {fieldDef.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // Multi-select field
  if (fieldDef.type === FIELD_TYPES.MULTI_SELECT) {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleToggle = (optionValue) => {
      if (selectedValues.includes(optionValue)) {
        onChange(selectedValues.filter(v => v !== optionValue));
      } else {
        onChange([...selectedValues, optionValue]);
      }
    };

    return (
      <div className="flex-1 p-2 border border-gray-300 rounded-md bg-white">
        <div className="flex flex-wrap gap-2">
          {fieldDef.options.map(option => (
            <label
              key={option.value}
              className={`
                inline-flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors
                ${selectedValues.includes(option.value)
                  ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                  : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="sr-only"
              />
              <span className="text-sm font-medium">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // Boolean field
  if (fieldDef.type === FIELD_TYPES.BOOLEAN) {
    // For boolean, the operator determines the value
    return (
      <div className="flex-1 px-3 py-2 text-sm text-gray-500 italic">
        (boolean condition)
      </div>
    );
  }

  // Range field
  if (fieldDef.type === FIELD_TYPES.RANGE) {
    if (operator === 'between') {
      const rangeValue = Array.isArray(value) ? value : [fieldDef.min || 0, fieldDef.max || 100];

      return (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="number"
            value={rangeValue[0] || ''}
            onChange={(e) => onChange([parseFloat(e.target.value) || 0, rangeValue[1]])}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Min"
            min={fieldDef.min}
            max={fieldDef.max}
            step={fieldDef.step || 1}
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            value={rangeValue[1] || ''}
            onChange={(e) => onChange([rangeValue[0], parseFloat(e.target.value) || 0])}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Max"
            min={fieldDef.min}
            max={fieldDef.max}
            step={fieldDef.step || 1}
          />
        </div>
      );
    } else {
      // Single value for greater/less than
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount"
          min={fieldDef.min}
          max={fieldDef.max}
          step={fieldDef.step || 1}
        />
      );
    }
  }

  // Date field
  if (fieldDef.type === FIELD_TYPES.DATE) {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    );
  }

  // Date range field
  if (fieldDef.type === FIELD_TYPES.DATE_RANGE) {
    if (operator === 'between') {
      const rangeValue = Array.isArray(value) ? value : ['', ''];

      return (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="date"
            value={rangeValue[0] || ''}
            onChange={(e) => onChange([e.target.value, rangeValue[1]])}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={rangeValue[1] || ''}
            onChange={(e) => onChange([rangeValue[0], e.target.value])}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      );
    } else {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
  }

  // Text field (default)
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter text"
    />
  );
}
