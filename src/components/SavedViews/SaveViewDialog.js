import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * SaveViewDialog Component
 * Dialog for creating or editing a saved filter view
 */
export default function SaveViewDialog({
  isOpen,
  onClose,
  onSave,
  existingView = null,
  filterConfig,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🔍');
  const [color, setColor] = useState('#0f2a71');
  const [visibility, setVisibility] = useState('private');
  const [isSaving, setIsSaving] = useState(false);

  // Preset emoji icons
  const emojiPresets = [
    '🔍', '📋', '📌', '⭐', '🎯', '📊', '💰', '👕',
    '📦', '✅', '⚠️', '📞', '✏️', '🎨', '🏢', '✨'
  ];

  // Color presets
  const colorPresets = [
    { name: 'Blue', value: '#0f2a71' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Cyan', value: '#0891b2' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Gray', value: '#6b7280' },
  ];

  // Initialize form with existing view data
  useEffect(() => {
    if (existingView) {
      setName(existingView.name || '');
      setDescription(existingView.description || '');
      setIcon(existingView.icon || '🔍');
      setColor(existingView.color || '#0f2a71');
      setVisibility(existingView.visibility || 'private');
    } else {
      // Reset form for new view
      setName('');
      setDescription('');
      setIcon('🔍');
      setColor('#0f2a71');
      setVisibility('private');
    }
  }, [existingView, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name for this view');
      return;
    }

    setIsSaving(true);

    const viewData = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      visibility,
      filters: filterConfig,
    };

    try {
      await onSave(viewData);
      onClose();
    } catch (error) {
      console.error('Error saving view:', error);
      alert('Failed to save view. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {existingView ? 'Edit View' : 'Save Filter View'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Unpaid Main Location Orders"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this view shows..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiPresets.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`
                    w-10 h-10 text-xl rounded-md border-2 transition-all
                    ${icon === emoji
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Or type custom emoji"
                maxLength={2}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setColor(preset.value)}
                  className={`
                    w-10 h-10 rounded-md border-2 transition-all
                    ${color === preset.value
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                    }
                  `}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 rounded-md border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-600">{color}</span>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-sm">Private</div>
                  <div className="text-xs text-gray-500">Only you can see this view</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={visibility === 'team'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-sm">Team</div>
                  <div className="text-xs text-gray-500">Everyone on your team can see this</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="shared"
                  checked={visibility === 'shared'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="text-blue-600"
                />
                <div>
                  <div className="font-medium text-sm">Shared</div>
                  <div className="text-xs text-gray-500">Share with specific people</div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Preview:</p>
            <div
              className="p-3 bg-white border-2 border-gray-200 rounded-lg"
              style={{ borderLeftWidth: '4px', borderLeftColor: color }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{name || 'Untitled View'}</div>
                  {description && (
                    <div className="text-xs text-gray-600 line-clamp-1">{description}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : existingView ? 'Update View' : 'Save View'}
          </button>
        </div>
      </div>
    </div>
  );
}
