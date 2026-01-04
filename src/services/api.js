import { supabase } from './supabase';
export { supabase };

// Helper function to convert numeric age to age bracket
export const getAgeBracket = (age) => {
  if (!age) return 'Adult'; // Default for null ages
  const numAge = parseInt(age);
  if (numAge >= 0 && numAge <= 3) return 'Toddler';
  if (numAge >= 4 && numAge <= 12) return 'Kid';
  if (numAge >= 13 && numAge <= 20) return 'Youth';
  if (numAge >= 21) return 'Adult';
  return 'Adult';
};


// Fetch all people with their shirt and registration info
export const fetchAllPeople = async () => {
  try {
    const { data, error } = await supabase
      .from('people')
      .select(`
        *,
        shirts(*),
        registrations(*)
      `);

    if (error) throw error;

    // Transform the data to match our app structure
    const transformed = data.map(person => ({
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      age: person.age,
      gender: person.gender,
      ageBracket: getAgeBracket(person.age),
      location: person.location === 'GUEST' ? 'Guest' : person.location,
      contactNumber: person.contact_number,
      attendanceStatus: person.attendance_status || 'attending',
      registered: person.registrations?.[0]?.registered || false,
      registeredAt: person.registrations?.[0]?.registered_at || null,
      shirtSize: person.shirts?.[0]?.shirt_size || '',
      paid: person.shirts?.[0]?.paid || false,
      shirtGiven: person.shirts?.[0]?.shirt_given || false,
      hasPrint: person.shirts?.[0]?.has_print ?? true,
    }));

    return transformed;
  } catch (error) {
    console.error('Error fetching people:', error);
    return [];
  }
};

// Check in a person (add/update registration)
export const checkInPerson = async (personId, userId = null) => {
  try {
    // Check if registration already exists
    const { data: existing } = await supabase
      .from('registrations')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (existing) {
      // Update existing registration
      const { error } = await supabase
        .from('registrations')
        .update({
          registered: true,
          registered_at: new Date().toISOString(),
          registered_by: userId
        })
        .eq('person_id', personId);

      if (error) throw error;
    } else {
      // Insert new registration
      const { error } = await supabase
        .from('registrations')
        .insert({
          person_id: personId,
          registered: true,
          registered_at: new Date().toISOString(),
          registered_by: userId
        });

      if (error) throw error;
    }

    // Dispatch event to notify other components
    window.dispatchEvent(new Event('registrationUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error checking in person:', error);
    return false;
  }
};

// Remove check-in (set registered to false)
export const removeCheckIn = async (personId) => {
  try {
    const { error } = await supabase
      .from('registrations')
      .update({
        registered: false,
        registered_at: null,
        registered_by: null
      })
      .eq('person_id', personId);

    if (error) throw error;
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('registrationUpdated'));
    
    return true;
  } catch (error) {
    console.error('Error removing check-in:', error);
    return false;
  }
};

// Update shirt size
export const updateShirtSize = async (personId, size) => {
  try {
    // Check if shirt record exists
    const { data: existing } = await supabase
      .from('shirts')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (existing) {
      // Update existing shirt
      const { error } = await supabase
        .from('shirts')
        .update({ shirt_size: size })
        .eq('person_id', personId);

      if (error) throw error;
    } else {
      // Insert new shirt record
      const { error } = await supabase
        .from('shirts')
        .insert({
          person_id: personId,
          shirt_size: size,
          paid: false,
          shirt_given: false
        });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating shirt size:', error);
    return false;
  }
};

// Toggle shirt payment status
export const toggleShirtPayment = async (personId, currentPaid) => {
  try {
    const { error } = await supabase
      .from('shirts')
      .update({ paid: !currentPaid })
      .eq('person_id', personId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling payment:', error);
    return false;
  }
};

// Toggle shirt given status
export const toggleShirtGiven = async (personId, currentGiven) => {
  try {
    const { error } = await supabase
      .from('shirts')
      .update({ shirt_given: !currentGiven })
      .eq('person_id', personId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling shirt given:', error);
    return false;
  }
};

// Toggle shirt print preference
export const toggleShirtPrint = async (personId, currentHasPrint) => {
  try {
    // Check if shirt record exists
    const { data: existing } = await supabase
      .from('shirts')
      .select('*')
      .eq('person_id', personId)
      .single();

    if (existing) {
      // Update existing shirt
      const { error } = await supabase
        .from('shirts')
        .update({ has_print: !currentHasPrint })
        .eq('person_id', personId);

      if (error) throw error;
    } else {
      // Insert new shirt record with print preference (default true if creating new)
      const { error } = await supabase
        .from('shirts')
        .insert({
          person_id: personId,
          has_print: true,
          paid: false,
          shirt_given: false
        });

      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error toggling shirt print:', error);
    return false;
  }
};

// Notes functions
export async function fetchNotesForPerson(personId) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
  return data;
}

export async function createNote(personId, noteText, createdBy = 'Admin', isTask = false, taskData = {}) {
  const insertData = {
    person_id: personId,
    note_text: noteText,
    created_by: createdBy,
    is_task: isTask
  };

  // Add task-specific fields if it's a task
  if (isTask) {
    if (taskData.dueDate) insertData.due_date = taskData.dueDate;
    if (taskData.priority) insertData.priority = taskData.priority;
    if (taskData.category) insertData.category = taskData.category;
    if (taskData.assignedTo) insertData.assigned_to = taskData.assignedTo;
    if (taskData.assignedToUser) insertData.assigned_to_user = taskData.assignedToUser;
    if (taskData.createdByUser) insertData.created_by_user = taskData.createdByUser;
    if (taskData.recurrence) insertData.recurrence = taskData.recurrence || 'none';
    if (taskData.recurrenceEndDate) insertData.recurrence_end_date = taskData.recurrenceEndDate;
    insertData.status = 'incomplete';
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([insertData])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }
  return data;
}

export async function updateNote(noteId, noteText, updatedBy = 'Admin', taskData = {}) {
  const updateData = {
    note_text: noteText,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy
  };

  // Update task-specific fields if provided
  if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
  if (taskData.priority !== undefined) updateData.priority = taskData.priority;
  if (taskData.category !== undefined) updateData.category = taskData.category;
  if (taskData.assignedTo !== undefined) updateData.assigned_to = taskData.assignedTo;
  if (taskData.recurrence !== undefined) updateData.recurrence = taskData.recurrence;
  if (taskData.recurrenceEndDate !== undefined) updateData.recurrence_end_date = taskData.recurrenceEndDate;
  if (taskData.status !== undefined) updateData.status = taskData.status;

  const { data, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', noteId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }
  return data;
}

export async function deleteNote(noteId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}


// Toggle task completion status
export async function toggleTaskComplete(taskId, currentStatus) {
  try {
    const newStatus = currentStatus === 'complete' ? 'incomplete' : 'complete';
    const updateData = {
      status: newStatus,
      completed_at: newStatus === 'complete' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    // Handle recurring tasks
    if (newStatus === 'complete' && data.recurrence && data.recurrence !== 'none') {
      await handleRecurringTask(data);
    }

    return data;
  } catch (error) {
    console.error('Error toggling task completion:', error);
    throw error;
  }
}

// Handle recurring task logic
async function handleRecurringTask(completedTask) {
  // Check if we should create a new instance
  const now = new Date();
  const recurrenceEndDate = completedTask.recurrence_end_date ? new Date(completedTask.recurrence_end_date) : null;

  if (recurrenceEndDate && now > recurrenceEndDate) {
    return; // Don't create new instance if past end date
  }

  // Calculate next due date
  const currentDueDate = new Date(completedTask.due_date);
  let nextDueDate = new Date(currentDueDate);

  switch (completedTask.recurrence) {
    case 'daily':
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case 'weekly':
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case 'monthly':
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    default:
      return;
  }

  // Don't create if next due date is past recurrence end date
  if (recurrenceEndDate && nextDueDate > recurrenceEndDate) {
    return;
  }

  // Create new task instance
  const { error } = await supabase
    .from('notes')
    .insert([{
      person_id: completedTask.person_id,
      note_text: completedTask.note_text,
      created_by: completedTask.created_by,
      is_task: true,
      due_date: nextDueDate.toISOString(),
      priority: completedTask.priority,
      category: completedTask.category,
      assigned_to: completedTask.assigned_to,
      recurrence: completedTask.recurrence,
      recurrence_end_date: completedTask.recurrence_end_date,
      status: 'incomplete'
    }]);

  if (error) {
    console.error('Error creating recurring task instance:', error);
  }
}

// Fetch all tasks with person information
export async function fetchAllTasks(filters = {}) {
  try {
    let query = supabase
      .from('notes')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name,
          location
        )
      `)
      .eq('is_task', true)
      .order('due_date', { ascending: true });

    // Apply filters
    if (filters.status && filters.status !== 'All') {
      if (filters.status === 'overdue') {
        query = query.lt('due_date', new Date().toISOString()).eq('status', 'incomplete');
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.priority && filters.priority !== 'All') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    if (filters.assignedTo && filters.assignedTo !== 'All') {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      switch (filters.dueDate) {
        case 'today':
          query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString());
          break;
        case 'week':
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          query = query.gte('due_date', today.toISOString()).lte('due_date', nextWeek.toISOString());
          break;
        case 'month':
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          query = query.gte('due_date', today.toISOString()).lte('due_date', nextMonth.toISOString());
          break;
        case 'overdue':
          query = query.lt('due_date', today.toISOString()).eq('status', 'incomplete');
          break;
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Transform data to flatten person info
    const transformed = (data || []).map(task => ({
      ...task,
      person_id: task.people?.id || task.person_id,
      person_first_name: task.people?.first_name || '',
      person_last_name: task.people?.last_name || '',
      person_location: task.people?.location || ''
    }));
    
    return transformed;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

// Fetch tasks due today
export async function fetchTasksDueToday() {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayDateString = `${year}-${month}-${day}`;

    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_task', true)
      .eq('status', 'incomplete')
      .gte('due_date', `${todayDateString}T00:00:00`)
      .lt('due_date', `${todayDateString}T23:59:59`)
      .order('priority', { ascending: false });

    if (error) throw error;
    
    // Transform data to flatten person info
    const transformed = (data || []).map(task => ({
      ...task,
      person_id: task.people?.id || task.person_id,
      person_first_name: task.people?.first_name || '',
      person_last_name: task.people?.last_name || ''
    }));
    
    return transformed;
  } catch (error) {
    console.error('Error fetching tasks due today:', error);
    return [];
  }
}

// Fetch overdue tasks (BEFORE today, not including today)
export async function fetchOverdueTasks() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDateString = today.toISOString().split('T')[0]; // Get YYYY-MM-DD

    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_task', true)
      .eq('status', 'incomplete')
      .lt('due_date', `${todayDateString}T00:00:00`)  // Strictly before today
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Transform data to flatten person info
    const transformed = (data || []).map(task => ({
      ...task,
      person_id: task.people?.id || task.person_id,
      person_first_name: task.people?.first_name || '',
      person_last_name: task.people?.last_name || ''
    }));
    
    return transformed;
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    return [];
  }
}

// Get task statistics
export async function getTaskStats() {
  try {
    const { data: allTasks, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_task', true);

    if (error) throw error;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total: allTasks.length,
      complete: allTasks.filter(t => t.status === 'complete').length,
      incomplete: allTasks.filter(t => t.status === 'incomplete').length,
      overdue: allTasks.filter(t => t.status === 'incomplete' && new Date(t.due_date) < now).length,
      dueToday: allTasks.filter(t => {
        const dueDate = new Date(t.due_date);
        return t.status === 'incomplete' && dueDate >= now && dueDate < tomorrow;
      }).length,
      byCategory: {},
      byPriority: {
        High: 0,
        Medium: 0,
        Low: 0
      }
    };

    // Count by category
    allTasks.forEach(task => {
      if (task.category) {
        stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
      }
      if (task.priority && task.status === 'incomplete') {
        stats.byPriority[task.priority]++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting task stats:', error);
    return {
      total: 0,
      complete: 0,
      incomplete: 0,
      overdue: 0,
      dueToday: 0,
      byCategory: {},
      byPriority: { High: 0, Medium: 0, Low: 0 }
    };
  }
}

// Get task/note info for a person
export async function getPersonTaskInfo(personId) {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('person_id', personId);

    if (error) throw error;

    const tasks = notes.filter(n => n.is_task);
    const regularNotes = notes.filter(n => !n.is_task);
    const incompleteTasks = tasks.filter(t => t.status === 'incomplete');
    const completedTasks = tasks.filter(t => t.status === 'complete');

    // Get highest priority among incomplete tasks
    let highestPriority = null;
    if (incompleteTasks.length > 0) {
      if (incompleteTasks.some(t => t.priority === 'High')) highestPriority = 'High';
      else if (incompleteTasks.some(t => t.priority === 'Medium')) highestPriority = 'Medium';
      else highestPriority = 'Low';
    }

    return {
      hasNotes: regularNotes.length > 0,
      notesCount: regularNotes.length,
      hasTasks: tasks.length > 0,
      tasksCount: tasks.length,
      incompleteTasksCount: incompleteTasks.length,
      completedTasksCount: completedTasks.length,
      highestPriority,
      hasOnlyCompletedTasks: completedTasks.length > 0 && incompleteTasks.length === 0
    };
  } catch (error) {
    console.error('Error fetching person task info:', error);
    return {
      hasNotes: false,
      notesCount: 0,
      hasTasks: false,
      tasksCount: 0,
      incompleteTasksCount: 0,
      completedTasksCount: 0,
      highestPriority: null,
      hasOnlyCompletedTasks: false
    };
  }
}

// Get task info for all people (bulk operation)
export async function getAllPeopleTaskInfo() {
  try {
    const { data: allNotes, error } = await supabase
      .from('notes')
      .select('*');

    if (error) throw error;

    // Group notes by person_id
    const personTaskInfo = {};
    
    allNotes.forEach(note => {
      const personId = note.person_id;
      if (!personTaskInfo[personId]) {
        personTaskInfo[personId] = {
          notes: [],
          tasks: [],
          incompleteTasks: [],
          completedTasks: []
        };
      }

      if (note.is_task) {
        personTaskInfo[personId].tasks.push(note);
        if (note.status === 'incomplete') {
          personTaskInfo[personId].incompleteTasks.push(note);
        } else {
          personTaskInfo[personId].completedTasks.push(note);
        }
      } else {
        personTaskInfo[personId].notes.push(note);
      }
    });

    // Transform into the format we need
    const result = {};
    Object.keys(personTaskInfo).forEach(personId => {
      const info = personTaskInfo[personId];
      const incompleteTasks = info.incompleteTasks;
      
      let highestPriority = null;
      if (incompleteTasks.length > 0) {
        if (incompleteTasks.some(t => t.priority === 'High')) highestPriority = 'High';
        else if (incompleteTasks.some(t => t.priority === 'Medium')) highestPriority = 'Medium';
        else highestPriority = 'Low';
      }

      result[personId] = {
        hasNotes: info.notes.length > 0,
        notesCount: info.notes.length,
        hasTasks: info.tasks.length > 0,
        tasksCount: info.tasks.length,
        incompleteTasksCount: info.incompleteTasks.length,
        completedTasksCount: info.completedTasks.length,
        highestPriority,
        hasOnlyCompletedTasks: info.completedTasks.length > 0 && info.incompleteTasks.length === 0
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching all people task info:', error);
    return {};
  }
}

// Create new person with shirt and registration
export const createPerson = async (personData, createdBy = null) => {
  try {
    // 1. Insert person
    const { data: person, error: personError } = await supabase
      .from('people')
      .insert({
        first_name: personData.firstName,
        last_name: personData.lastName,
        age: personData.age || null,
        gender: personData.gender || null,
        location: personData.location,
        contact_number: personData.contactNumber || null,
        attendance_status: personData.attendanceStatus || 'attending',
        created_by: createdBy,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (personError) throw personError;

    // 2. Insert shirt record if shirt size provided
    if (personData.shirtSize) {
      const { error: shirtError } = await supabase
        .from('shirts')
        .insert({
          person_id: person.id,
          shirt_size: personData.shirtSize,
          paid: personData.paid || false,
          shirt_given: personData.shirtGiven || false,
          has_print: true
        });

      if (shirtError) throw shirtError;
    }

    // 3. Insert initial registration record (not checked in yet)
    const { error: regError } = await supabase
      .from('registrations')
      .insert({
        person_id: person.id,
        registered: false,
        registered_at: null
      });

    if (regError) throw regError;

    return { success: true, person };
  } catch (error) {
    console.error('Error creating person:', error);
    return { success: false, error };
  }
};

// Delete person and all related data
export async function deletePerson(personId) {
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', personId);
  
  if (error) {
    console.error('Error deleting person:', error);
    throw error;
  }
}

// Update attendance status
export async function updateAttendanceStatus(personId, status) {
  try {
    const { error } = await supabase
      .from('people')
      .update({ attendance_status: status })
      .eq('id', personId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return { success: false, error };
  }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

// Get all users (Admin only)
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Update user role (Admin only)
export async function updateUserRole(userId, newRole) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error };
  }
}

// Update user status (Admin only)
export async function updateUserStatus(userId, status) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating user status:', error);
    return { success: false, error };
  }
}

// Delete user (admin only) - Suspends user and marks as deleted
export const deleteUser = async (userId) => {
  try {
    // Set user status to deleted (they won't be able to access the system)
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Get all registration codes (Admin only)
export async function getRegistrationCodes() {
  try {
    const { data, error } = await supabase
      .from('registration_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching registration codes:', error);
    return [];
  }
}

// Create new registration code (Admin only)
export async function createRegistrationCode(code, description, createdBy) {
  try {
    const { data, error } = await supabase
      .from('registration_codes')
      .insert({
        code: code.toUpperCase(),
        description,
        created_by: createdBy,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error creating registration code:', error);
    return { success: false, error };
  }
}

// Toggle registration code active status (Admin only)
export async function toggleRegistrationCodeStatus(codeId, currentStatus) {
  try {
    const { data, error } = await supabase
      .from('registration_codes')
      .update({ is_active: !currentStatus })
      .eq('id', codeId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error toggling code status:', error);
    return { success: false, error };
  }
}

// Delete registration code (Admin only)
export async function deleteRegistrationCode(codeId) {
  try {
    const { error } = await supabase
      .from('registration_codes')
      .delete()
      .eq('id', codeId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting code:', error);
    return { success: false, error };
  }
}

// ============================================
// HOME PAGE DATA FUNCTIONS
// ============================================

// Get tasks assigned to specific user
export async function getMyTasks(userId) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_task', true)
      .eq('assigned_to_user', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    // Format the data
    return (data || []).map(task => ({
      id: task.id,
      noteText: task.note_text,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      category: task.category,
      personId: task.person_id,
      personFirstName: task.people?.first_name || '',
      personLastName: task.people?.last_name || '',
      createdAt: task.created_at
    }));
  } catch (error) {
    console.error('Error fetching my tasks:', error);
    return [];
  }
}

// Get user's registrations today
export async function getMyRegistrationsToday(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUTC = today.toISOString();
    
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('registered_by', userId)
      .gte('registered_at', todayUTC)
      .order('registered_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(reg => ({
      id: reg.id,
      personId: reg.person_id,
      personFirstName: reg.people?.first_name || '',
      personLastName: reg.people?.last_name || '',
      registeredAt: reg.registered_at,
      registered: reg.registered
    }));
  } catch (error) {
    console.error('Error fetching my registrations:', error);
    return [];
  }
}

// Get user's recent activity (last 10 actions)
export async function getMyRecentActivity(userId) {
  try {
    // Get registrations
    const { data: registrations, error: regError } = await supabase
      .from('registrations')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('registered_by', userId)
      .order('registered_at', { ascending: false })
      .limit(10);
    
    if (regError) throw regError;
    
    // Get created tasks
    const { data: tasks, error: taskError } = await supabase
      .from('notes')
      .select(`
        *,
        people (
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_task', true)
      .eq('created_by_user', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (taskError) throw taskError;
    
    // Combine and format activities
    const activities = [];
    
    (registrations || []).forEach(reg => {
      activities.push({
        id: `reg-${reg.id}`,
        type: 'registration',
        action: 'Registered',
        personName: `${reg.people?.first_name || ''} ${reg.people?.last_name || ''}`.trim(),
        timestamp: reg.registered_at,
        icon: 'UserCheck'
      });
    });
    
    (tasks || []).forEach(task => {
      activities.push({
        id: `task-${task.id}`,
        type: 'task',
        action: 'Created task for',
        personName: `${task.people?.first_name || ''} ${task.people?.last_name || ''}`.trim(),
        taskText: task.note_text,
        timestamp: task.created_at,
        icon: 'CheckSquare'
      });
    });
    
    // Sort by timestamp and return last 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Get user's stats for home page
export async function getMyStats(userId) {
  try {
    // Count tasks assigned to me (incomplete)
    const { count: myTasks } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('is_task', true)
      .eq('assigned_to_user', userId)
      .eq('status', 'incomplete');
    
    // Count registrations I did today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUTC = today.toISOString();
    
    const { count: registeredToday } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('registered_by', userId)
      .gte('registered_at', todayUTC);
    
    // Count overdue tasks
    const now = new Date().toISOString();
    const { count: overdueTasks } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('is_task', true)
      .eq('assigned_to_user', userId)
      .eq('status', 'incomplete')
      .lt('due_date', now);
    
    // Count tasks due today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayEndUTC = todayEnd.toISOString();
    
    const { count: dueToday } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('is_task', true)
      .eq('assigned_to_user', userId)
      .eq('status', 'incomplete')
      .gte('due_date', todayUTC)
      .lte('due_date', todayEndUTC);
    
    return {
      myTasks: myTasks || 0,
      registeredToday: registeredToday || 0,
      overdueTasks: overdueTasks || 0,
      dueToday: dueToday || 0
    };
  } catch (error) {
    console.error('Error fetching my stats:', error);
    return {
      myTasks: 0,
      registeredToday: 0,
      overdueTasks: 0,
      dueToday: 0
    };
  }
}

// Get all users for task assignment (name + id only)
export async function getUsersForTaskAssignment() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('status', 'active')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users for assignment:', error);
    return [];
  }
}

// ============================================
// ROLE CHANGE REQUEST FUNCTIONS
// ============================================

// Check if user can request role change (cooldown check)
export async function canRequestRoleChange(userId) {
  try {
    // Check if user has pending request
    const { data: pendingRequest, error: pendingError } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .single();

    if (pendingError && pendingError.code !== 'PGRST116') throw pendingError;

    if (pendingRequest) {
      return { 
        canRequest: false, 
        reason: 'You already have a pending role change request.' 
      };
    }

    // Check for cooldown (3 days after rejection)
    const { data: recentRejection, error: rejectionError } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'rejected')
      .order('last_rejected_at', { ascending: false })
      .limit(1)
      .single();

    if (rejectionError && rejectionError.code !== 'PGRST116') throw rejectionError;

    if (recentRejection && recentRejection.last_rejected_at) {
      const lastRejected = new Date(recentRejection.last_rejected_at);
      const now = new Date();
      const daysSinceRejection = (now - lastRejected) / (1000 * 60 * 60 * 24);

      if (daysSinceRejection < 3) {
        const daysRemaining = Math.ceil(3 - daysSinceRejection);
        return { 
          canRequest: false, 
          reason: `You can request again in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`,
          daysRemaining 
        };
      }
    }

    return { canRequest: true };
  } catch (error) {
    console.error('Error checking request eligibility:', error);
    return { canRequest: false, reason: 'Error checking eligibility' };
  }
}

// Submit role change request
export async function requestRoleChange(userId) {
  try {
    // First check if can request
    const eligibility = await canRequestRoleChange(userId);
    if (!eligibility.canRequest) {
      return { success: false, error: eligibility.reason };
    }

    const { data, error } = await supabase
      .from('role_change_requests')
      .insert({
        user_id: userId,
        requested_role: 'committee',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error requesting role change:', error);
    return { success: false, error: error.message };
  }
}

// Get all pending role change requests (Admin only)
export async function getPendingRoleRequests() {
  try {
    const { data, error } = await supabase
      .from('role_change_requests')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return [];
  }
}

// Approve role change request (Admin only)
export async function approveRoleRequest(requestId, adminId) {
  try {
    // Get the request details
    const { data: request, error: fetchError } = await supabase
      .from('role_change_requests')
      .select('*, profiles:user_id(id, full_name)')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Update user's role in profiles table
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ 
        role: request.requested_role,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.user_id);

    if (roleError) throw roleError;

    // Update request status
    const { data, error: updateError } = await supabase
      .from('role_change_requests')
      .update({
        status: 'approved',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { success: true, data };
  } catch (error) {
    console.error('Error approving request:', error);
    return { success: false, error: error.message };
  }
}

// Reject role change request (Admin only)
export async function rejectRoleRequest(requestId, adminId) {
  try {
    // Get current rejection count
    const { data: request, error: fetchError } = await supabase
      .from('role_change_requests')
      .select('rejection_count')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Update request status
    const { data, error: updateError } = await supabase
      .from('role_change_requests')
      .update({
        status: 'rejected',
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        rejection_count: (request.rejection_count || 0) + 1,
        last_rejected_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    return { success: true, data };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return { success: false, error: error.message };
  }
}

// Get user's role change request status
export async function getMyRoleRequestStatus(userId) {
  try {
    const { data, error } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('user_id', userId)
      .order('requested_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || null;
  } catch (error) {
    console.error('Error fetching role request status:', error);
    return null;
  }
}
