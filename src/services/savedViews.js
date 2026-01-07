import { supabase } from './supabase';

/**
 * Create a new saved filter view
 * @param {Object} viewData - The view configuration
 * @param {string} userId - The user ID creating the view
 * @returns {Promise<Object>} The created view
 */
export async function createSavedView(viewData, userId) {
  try {
    const { data, error } = await supabase
      .from('saved_filter_views')
      .insert([
        {
          name: viewData.name,
          description: viewData.description || null,
          icon: viewData.icon || '🔍',
          color: viewData.color || '#0f2a71',
          filters: viewData.filters,
          display_options: viewData.displayOptions || null,
          visibility: viewData.visibility || 'private',
          shared_with: viewData.sharedWith || [],
          created_by: userId,
          view_type: viewData.viewType,
          is_favorite: viewData.isFavorite || false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating saved view:', error);
    return { data: null, error };
  }
}

/**
 * Fetch saved views for a specific view type and user
 * @param {string} viewType - The type of view ('shirts', 'registration', 'collections')
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of saved views
 */
export async function getSavedViews(viewType, userId) {
  try {
    const { data, error } = await supabase
      .from('saved_filter_views')
      .select('*')
      .eq('view_type', viewType)
      .or(`created_by.eq.${userId},visibility.eq.team,and(visibility.eq.shared,shared_with.cs.{${userId}})`)
      .order('is_favorite', { ascending: false })
      .order('last_used', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching saved views:', error);
    return { data: [], error };
  }
}

/**
 * Update an existing saved view
 * @param {string} viewId - The view ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object>} The updated view
 */
export async function updateSavedView(viewId, updates) {
  try {
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon !== undefined) updateData.icon = updates.icon;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.filters !== undefined) updateData.filters = updates.filters;
    if (updates.displayOptions !== undefined) updateData.display_options = updates.displayOptions;
    if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
    if (updates.sharedWith !== undefined) updateData.shared_with = updates.sharedWith;
    if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

    const { data, error } = await supabase
      .from('saved_filter_views')
      .update(updateData)
      .eq('id', viewId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating saved view:', error);
    return { data: null, error };
  }
}

/**
 * Delete a saved view
 * @param {string} viewId - The view ID to delete
 * @returns {Promise<Object>} Success status
 */
export async function deleteSavedView(viewId) {
  try {
    const { error } = await supabase
      .from('saved_filter_views')
      .delete()
      .eq('id', viewId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting saved view:', error);
    return { success: false, error };
  }
}

/**
 * Update view usage statistics (increment use count and update last used timestamp)
 * @param {string} viewId - The view ID
 * @returns {Promise<Object>} Success status
 */
export async function updateViewUsage(viewId) {
  try {
    const { data, error } = await supabase.rpc('increment_view_usage', {
      view_id: viewId,
    });

    // If the RPC function doesn't exist yet, fall back to manual update
    if (error && error.code === '42883') {
      const { data: view, error: fetchError } = await supabase
        .from('saved_filter_views')
        .select('use_count')
        .eq('id', viewId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('saved_filter_views')
        .update({
          use_count: (view.use_count || 0) + 1,
          last_used: new Date().toISOString(),
        })
        .eq('id', viewId);

      if (updateError) throw updateError;
      return { success: true, error: null };
    }

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating view usage:', error);
    return { success: false, error };
  }
}

/**
 * Share a view with specific users or change visibility
 * @param {string} viewId - The view ID
 * @param {Array<string>} userIds - Array of user IDs to share with (if visibility is 'shared')
 * @param {string} visibility - 'private', 'shared', or 'team'
 * @returns {Promise<Object>} The updated view
 */
export async function shareView(viewId, userIds = [], visibility = 'shared') {
  try {
    const { data, error } = await supabase
      .from('saved_filter_views')
      .update({
        visibility,
        shared_with: visibility === 'shared' ? userIds : [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', viewId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error sharing view:', error);
    return { data: null, error };
  }
}

/**
 * Toggle favorite status for a saved view
 * @param {string} viewId - The view ID
 * @returns {Promise<Object>} The updated view
 */
export async function toggleFavorite(viewId) {
  try {
    // First fetch the current favorite status
    const { data: view, error: fetchError } = await supabase
      .from('saved_filter_views')
      .select('is_favorite')
      .eq('id', viewId)
      .single();

    if (fetchError) throw fetchError;

    // Toggle the favorite status
    const { data, error } = await supabase
      .from('saved_filter_views')
      .update({
        is_favorite: !view.is_favorite,
        updated_at: new Date().toISOString(),
      })
      .eq('id', viewId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { data: null, error };
  }
}
