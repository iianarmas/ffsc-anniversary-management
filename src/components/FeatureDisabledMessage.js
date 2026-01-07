import React from 'react';
import { Lock } from 'lucide-react';

/**
 * FeatureDisabledMessage Component
 * Shows a professional message when a feature has been disabled by admin
 */
export default function FeatureDisabledMessage({ feature, inline = false }) {
  const messages = {
    addPerson: 'Adding new people has been temporarily disabled by the administrator.',
    shirtSize: 'Shirt size changes have been temporarily disabled by the administrator.',
    print: 'Print option changes have been temporarily disabled by the administrator.',
    payment: 'Payment status changes have been temporarily disabled by the administrator.',
    distribution: 'Distribution status changes have been temporarily disabled by the administrator.',
  };

  const message = messages[feature] || 'This feature has been temporarily disabled by the administrator.';

  if (inline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
        <Lock className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-amber-900 mb-1">Feature Temporarily Disabled</h4>
          <p className="text-sm text-amber-800">{message}</p>
          <p className="text-xs text-amber-700 mt-2">
            Please contact an administrator if you have questions.
          </p>
        </div>
      </div>
    </div>
  );
}
