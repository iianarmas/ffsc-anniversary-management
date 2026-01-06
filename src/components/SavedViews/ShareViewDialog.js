import React, { useState } from 'react';
import { X, Share2, Users, Lock } from 'lucide-react';

/**
 * ShareViewDialog Component
 * Dialog for managing sharing settings of a saved view
 */
export default function ShareViewDialog({
  isOpen,
  onClose,
  onSave,
  view,
}) {
  const [visibility, setVisibility] = useState(view?.visibility || 'private');
  const [sharedWith, setSharedWith] = useState(view?.shared_with || []);
  const [emailInput, setEmailInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (sharedWith.includes(email)) {
      alert('This email is already in the share list');
      return;
    }

    setSharedWith([...sharedWith, email]);
    setEmailInput('');
  };

  const handleRemoveEmail = (email) => {
    setSharedWith(sharedWith.filter(e => e !== email));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await onSave({
        visibility,
        sharedWith: visibility === 'shared' ? sharedWith : [],
      });
      onClose();
    } catch (error) {
      console.error('Error updating share settings:', error);
      alert('Failed to update share settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !view) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Share "{view.name}"</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Visibility Options */}
          <div className="space-y-2">
            {/* Private */}
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-1 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Private</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only you can see and use this view
                </p>
              </div>
            </label>

            {/* Team */}
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="visibility"
                value="team"
                checked={visibility === 'team'}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-1 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Team</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Everyone on your team can see and use this view
                </p>
              </div>
            </label>

            {/* Shared */}
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="visibility"
                value="shared"
                checked={visibility === 'shared'}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-1 text-blue-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Shared with specific people</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only people you specify can see this view
                </p>
              </div>
            </label>
          </div>

          {/* Email input for shared visibility */}
          {visibility === 'shared' && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share with
              </label>

              {/* Email input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  placeholder="Enter email address"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleAddEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Add
                </button>
              </div>

              {/* Shared with list */}
              {sharedWith.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Shared with ({sharedWith.length}):</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {sharedWith.map(email => (
                      <div
                        key={email}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <span className="text-sm text-gray-700">{email}</span>
                        <button
                          onClick={() => handleRemoveEmail(email)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No one added yet. Add email addresses above.
                </p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              💡 <strong>Note:</strong> People with access can view and apply this filter,
              but only you can edit or delete it.
            </p>
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
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
