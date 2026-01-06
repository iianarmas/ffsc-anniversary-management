import React from 'react';
import { getGroupedFilterFields } from '../../constants/filterFields';

/**
 * FieldSelector Component
 * Dropdown for selecting filter fields, organized by category
 */
export default function FieldSelector({ viewType, value, onChange }) {
  const groupedFields = getGroupedFilterFields(viewType);

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">Select field...</option>
      {Object.entries(groupedFields).map(([category, fields]) => (
        <optgroup key={category} label={category}>
          {fields.map(field => (
            <option key={field.key} value={field.key}>
              {field.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
