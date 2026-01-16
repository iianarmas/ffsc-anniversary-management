export const ROLES = {
  ADMIN: 'admin',
  COMMITTEE: 'committee',
  VIEWER: 'viewer'
};

export const PERMISSIONS = {
  // Data viewing
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.COMMITTEE, ROLES.VIEWER],
  VIEW_ALL_PEOPLE: [ROLES.ADMIN, ROLES.COMMITTEE, ROLES.VIEWER],
  VIEW_ALL_TASKS: [ROLES.ADMIN, ROLES.COMMITTEE], // Viewer CANNOT see tasks
  VIEW_HOME: [ROLES.ADMIN, ROLES.COMMITTEE, ROLES.VIEWER],
  VIEW_FINANCE: [ROLES.ADMIN, ROLES.COMMITTEE], // Viewer CANNOT see finance
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.COMMITTEE], // Viewer CANNOT see reports

  // Data modification
  REGISTER_PEOPLE: [ROLES.ADMIN, ROLES.COMMITTEE],
  MANAGE_SHIRTS: [ROLES.ADMIN, ROLES.COMMITTEE],
  CREATE_TASKS: [ROLES.ADMIN, ROLES.COMMITTEE],
  EDIT_ANY_TASK: [ROLES.ADMIN],
  DELETE_TASKS: [ROLES.ADMIN],
  EDIT_FINANCE: [ROLES.ADMIN], // Only admin can edit finance by default (finance_manager flag overrides)

  // User management
  MANAGE_USERS: [ROLES.ADMIN],
  MANAGE_CODES: [ROLES.ADMIN],
  EXPORT_REPORTS: [ROLES.ADMIN, ROLES.COMMITTEE], // Committee can also export reports
};

// Check if user has a specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  return PERMISSIONS[permission]?.includes(user.role) || false;
};

// Check if user can edit a specific task
export const canEditTask = (task, user) => {
  if (!user) return false;
  // Admin can edit any task
  if (user.role === ROLES.ADMIN) return true;
  // Committee can only edit their own tasks
  if (user.role === ROLES.COMMITTEE && task.assigned_to_user === user.id) return true;
  return false;
};

// Check if user can delete a task
export const canDeleteTask = (user) => {
  return user?.role === ROLES.ADMIN;
};

// Check if user can view tasks
export const canViewTask = (user) => {
  if (!user) return false;
  // Admin and Committee can view all tasks
  // Viewer CANNOT view tasks
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};

// Check if user can manage users
export const canManageUsers = (user) => {
  return user?.role === ROLES.ADMIN;
};

// Check if user can register people
export const canRegisterPeople = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};

// Check if user can manage shirts
export const canManageShirts = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};

// Get role display name
export const getRoleDisplayName = (role) => {
  const names = {
    [ROLES.ADMIN]: 'Administrator',
    [ROLES.COMMITTEE]: 'Committee',
    [ROLES.VIEWER]: 'Viewer'
  };
  return names[role] || role;
};

// Get role color for badges
export const getRoleColor = (role) => {
  const colors = {
    [ROLES.ADMIN]: 'red',
    [ROLES.COMMITTEE]: 'blue',
    [ROLES.VIEWER]: 'gray'
  };
  return colors[role] || 'gray';
};

// Check if user can view finance
export const canViewFinance = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};

// Check if user can edit finance (admin or finance_manager)
export const canEditFinance = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.is_finance_manager === true;
};

// Check if user can view reports
export const canViewReports = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};

// Check if user can export reports
export const canExportReports = (user) => {
  if (!user) return false;
  return user.role === ROLES.ADMIN || user.role === ROLES.COMMITTEE;
};