import React from 'react';
import { Star, Edit, Trash2, Users, Lock, Share2, Clock } from 'lucide-react';

/**
 * SavedViewCard Component
 * Displays a single saved filter view with metadata and actions
 */
export default function SavedViewCard({
  view,
  count,
  isActive = false,
  onApply,
  onEdit,
  onDelete,
  onToggleFavorite,
  canEdit = true,
}) {
  const handleApply = () => {
    if (onApply) {
      onApply(view);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(view);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(view);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(view);
    }
  };

  const getVisibilityIcon = () => {
    switch (view.visibility) {
      case 'team':
        return <Users className="w-3 h-3" />;
      case 'shared':
        return <Share2 className="w-3 h-3" />;
      default:
        return <Lock className="w-3 h-3" />;
    }
  };

  const formatLastUsed = (dateString) => {
    if (!dateString) return 'Never used';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={handleApply}
      className={`
        w-full text-left p-3 rounded-lg border-2 transition-all
        hover:shadow-md hover:scale-105 active:scale-95
        ${isActive
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
      `}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: view.color || '#0f2a71',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Icon */}
          <span className="text-lg" role="img" aria-label={view.name}>
            {view.icon || '🔍'}
          </span>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {view.name}
          </h3>

          {/* Favorite Star */}
          <button
            onClick={handleToggleFavorite}
            className="p-0.5 hover:bg-yellow-100 rounded transition-colors"
            title={view.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              className={`w-4 h-4 ${
                view.is_favorite
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        </div>

        {/* Count Badge */}
        {count !== undefined && (
          <span
            className={`
              px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0
              ${count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}
            `}
          >
            {count}
          </span>
        )}
      </div>

      {/* Description */}
      {view.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {view.description}
        </p>
      )}

      {/* Metadata Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Visibility */}
          <div className="flex items-center gap-1" title={view.visibility}>
            {getVisibilityIcon()}
            <span className="capitalize">{view.visibility || 'private'}</span>
          </div>

          {/* Last Used */}
          {view.last_used && (
            <div className="flex items-center gap-1" title="Last used">
              <Clock className="w-3 h-3" />
              <span>{formatLastUsed(view.last_used)}</span>
            </div>
          )}

          {/* Use Count */}
          {view.use_count > 0 && (
            <span title="Times used">
              Used {view.use_count}×
            </span>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="Edit view"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Delete view"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          </div>
        )}
      </div>
    </button>
  );
}
