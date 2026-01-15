import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SystemSettingsProvider, useSystemSettings } from './components/SystemSettingsProvider';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RegistrationView from './components/RegistrationView';
import ShirtManagementView from './components/ShirtManagementView';
import MobileRegistrationView from './components/MobileRegistrationView';
import MobileShirtManagementView from './components/MobileShirtManagementView';
import Dashboard from './components/Dashboard';
import AddPersonSidebar from './components/AddPersonSidebar';
import LoadingOverlay from './components/LoadingOverlay';
import TasksView from './components/TasksView';
import MobileTasksView from './components/MobileTasksView';
import UserManagement from './components/admin/UserManagement';
import SystemSettings from './components/admin/SystemSettings';
import ProfileSettings from './components/ProfileSettings';
import HomePage from './components/HomePage';
import WelcomeModal from './components/WelcomeModal';
import MobileBottomNav from './components/MobileBottomNav';
import CollectionsView from './components/CollectionsView';
import MobileCollectionsView from './components/MobileCollectionsView';
import FinanceView from './components/finance/FinanceView';
import MobileFinanceView from './components/finance/MobileFinanceView';
import TaskAssignmentNotification from './components/TaskAssignmentNotification';
import RestrictedAccessMessage from './components/RestrictedAccessMessage';
import { Plus } from 'lucide-react';
import RoleRequestDialog from './components/RoleRequestDialog';



import { 
  fetchAllPeople, 
  checkInPerson, 
  removeCheckIn,
  updateShirtSize as apiUpdateShirtSize,
  toggleShirtPayment as apiToggleShirtPayment,
  toggleShirtGiven as apiToggleShirtGiven,
  toggleShirtPrint as apiToggleShirtPrint,
  getAgeBracket,
  createPerson,
  getTaskStats,
  getAllPeopleTaskInfo,
  getPendingRoleRequests
} from './services/api';
import { supabase } from './services/supabase';

import './assets/fonts/fonts.css';

// Register service worker for PWA (only in production)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

function AppContent() {
  const { profile } = useAuth();
  const { settings } = useSystemSettings();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filterAge, setFilterAge] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAttendance, setFilterAttendance] = useState('All');
  const [shirtSearchTerm, setShirtSearchTerm] = useState('');
  const [shirtFilterAge, setShirtFilterAge] = useState('All');
  const [shirtFilterLocation, setShirtFilterLocation] = useState('All');
  const [shirtFilterPayment, setShirtFilterPayment] = useState('All');
  const [shirtFilterDistribution, setShirtFilterDistribution] = useState('All');
  const [shirtFilterPrint, setShirtFilterPrint] = useState('All');
  const [shirtFilterAttendance, setShirtFilterAttendance] = useState('All');
  const [shirtFilterSize, setShirtFilterSize] = useState('All');
  const [currentView, setCurrentView] = useState('home'); // Always start with 'home' initially
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    incomplete: 0,
    complete: 0,
    overdue: 0,
    dueToday: 0,
    byCategory: {},
    byPriority: { High: 0, Medium: 0, Low: 0 }
  });
  const [peopleTaskInfo, setPeopleTaskInfo] = useState({});

  const [myTaskStats, setMyTaskStats] = useState({
    incomplete: 0,
    overdue: 0,
    dueToday: 0
  });
  const [pendingRoleRequestCount, setPendingRoleRequestCount] = useState(0);
  const [roleRequestResult, setRoleRequestResult] = useState({ show: false, status: '' });

  // Handle back button for view navigation
  useEffect(() => {
    // Don't interfere if we're in a browser with actual history
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (!isStandalone) {
      // In browser mode, let normal browser back button work
      return;
    }

    // PWA mode: handle back button for views
    const handlePopState = (e) => {
      // Check if this is triggered by a modal/overlay (they add their own state)
      if (e.state?.modalOpen) {
        // Let the modal handler deal with it
        return;
      }

      // If we're not on home view and back is pressed, navigate to home instead of exiting
      if (currentView !== 'home') {
        e.preventDefault();
        setCurrentView('home');
        // Add state back so we don't exit the app
        window.history.pushState({ view: 'home' }, '');
      }
      // If on home, allow default behavior (exit app)
    };

    // Push initial state only in PWA mode
    window.history.pushState({ view: currentView }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentView]);

  // Update history state when view changes (PWA only)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (isStandalone && currentView) {
      // Replace current state with new view
      window.history.replaceState({ view: currentView }, '');
    }
  }, [currentView]);

  // Update status bar color based on current view
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Use the same color as header background for consistency
      const color = '#f9fafa';
      metaThemeColor.setAttribute('content', color);
    }
  }, [currentView]);

// Realtime subscriptions for people, registrations, and shirts
useEffect(() => {
  const initializeData = async () => {
    try {
      await loadData(); 
      await loadTaskStats();  
      await loadPeopleTaskInfo();
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
    }
  };
  
  // Only initialize when profile is available
  if (profile?.id) {
    initializeData();
    
    // Check if this is the first login after email confirmation
    const hasSeenWelcome = localStorage.getItem(`welcome-seen-${profile.id}`);
    const isFirstSession = !sessionStorage.getItem(`session-started-${profile.id}`);
    
    if (!hasSeenWelcome && isFirstSession) {
      setShowWelcome(true);
    }
    
    // Mark that a session has started
    sessionStorage.setItem(`session-started-${profile.id}`, 'true');
  }

  const updatePersonInState = (payload, table) => {
    const personId = table === 'people' 
      ? payload.new?.id || payload.old?.id
      : payload.new?.person_id || payload.old?.person_id;
    if (!personId) return;

    setPeople(prev => {
      const index = prev.findIndex(p => p.id === personId);
      const existingPerson = index > -1 ? prev[index] : {};

      if (payload.eventType === 'DELETE') {
        // Remove deleted person
        return prev.filter(p => p.id !== personId);
      }

      let updatedFields = {};
      if (table === 'people') {
        updatedFields = {
          id: personId,
          firstName: payload.new?.first_name,
          lastName: payload.new?.last_name,
          age: payload.new?.age,
          gender: payload.new?.gender,
          ageBracket: payload.new ? getAgeBracket(payload.new.age) : 'Adult',
          location: payload.new?.location === 'GUEST' ? 'Guest' : payload.new?.location,
          contactNumber: payload.new?.contact_number,
          attendanceStatus: payload.new?.attendance_status || 'attending',
        };
      } else if (table === 'shirts') {
        updatedFields = {
          shirtSize: payload.new?.shirt_size || '',
          paid: payload.new?.paid || false,
          shirtGiven: payload.new?.shirt_given || false,
          hasPrint: payload.new?.has_print ?? true,
        };
      } else if (table === 'registrations') {
        updatedFields = {
          registered: payload.new?.registered || false,
          registeredAt: payload.new?.registered_at || null,
        };
      }

      const updatedPerson = { ...existingPerson, ...updatedFields };

      if (index > -1) {
        const newState = [...prev];
        newState[index] = updatedPerson;
        return newState;
      } else {
        return table === 'people' ? [...prev, updatedPerson] : prev;
      }
    });
  };

  const peopleSub = supabase
    .channel('table-listen-people')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'people' }, (payload) => updatePersonInState(payload, 'people'))
    .subscribe();

  const shirtsSub = supabase
    .channel('table-listen-shirts')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shirts' }, (payload) => updatePersonInState(payload, 'shirts'))
    .subscribe();

  const registrationsSub = supabase
    .channel('table-listen-registrations')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, (payload) => updatePersonInState(payload, 'registrations'))
    .subscribe();

  const tasksSub = supabase
    .channel('table-listen-tasks')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'notes'
    }, (payload) => {
      // Reload task stats and people task info when tasks change
      loadTaskStats();
      loadPeopleTaskInfo();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(peopleSub);
    supabase.removeChannel(shirtsSub);
    supabase.removeChannel(registrationsSub);
    supabase.removeChannel(tasksSub);
  };
}, [profile?.id]);


// Listen for realtime role request updates for current user
useEffect(() => {
  if (!profile?.id) return;
  
  const channel = supabase
    .channel('user-role-request-updates')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'role_change_requests',
      filter: `user_id=eq.${profile.id}`
    }, (payload) => {
      if (payload.new.status !== 'pending') {
        setRoleRequestResult({
          show: true,
          status: payload.new.status,
          isRequestResponse: true
        });
      }
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [profile?.id]);

// Listen for admin-initiated role changes
useEffect(() => {
  if (!profile?.id) return;

  const handleRoleChange = (event) => {
    const { oldRole, newRole } = event.detail;
    setRoleRequestResult({
      show: true,
      status: 'admin_changed',
      oldRole,
      newRole,
      isRequestResponse: false
    });
  };

  window.addEventListener('roleChanged', handleRoleChange);

  return () => {
    window.removeEventListener('roleChanged', handleRoleChange);
  };
}, [profile?.id]);

// Listen for role request changes to update bell badge (admin only)
useEffect(() => {
  if (!profile?.id || profile.role !== 'admin') return;
  
  const channel = supabase
    .channel('admin-role-requests-badge')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'role_change_requests'
    }, async () => {
      // Reload pending role requests count
      const requests = await getPendingRoleRequests();
      setPendingRoleRequestCount(requests.length);
      // Trigger header to reload notification count
      window.dispatchEvent(new Event('taskUpdated'));
    })
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
}, [profile?.id, profile?.role]);


  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for navigation events from bell notifications and profile menu
  useEffect(() => {
    const handleNavigateToTasks = () => {
      setCurrentView('tasks');
    };

    const handleNavigateToProfile = () => {
      setCurrentView('profile');
    };

    const handleNavigateToHome = () => {
      setCurrentView('home');
    };

    const handleNavigateToUsers = () => {
      setCurrentView('users');
    };

    const handleNavigateToTasksOverdue = () => {
      setCurrentView('tasks');
      // Set a flag that TasksView can read to apply overdue filter
      sessionStorage.setItem('tasks-filter-overdue', 'true');
    };

    const handleOpenAddPerson = () => {
      setIsAddPersonOpen(true);
    };

    window.addEventListener('navigate-to-tasks', handleNavigateToTasks);
    window.addEventListener('navigate-to-tasks-overdue', handleNavigateToTasksOverdue);
    window.addEventListener('navigate-to-profile', handleNavigateToProfile);
    window.addEventListener('navigate-to-home', handleNavigateToHome);
    window.addEventListener('navigate-to-users', handleNavigateToUsers);
    window.addEventListener('open-add-person', handleOpenAddPerson);
    
    return () => {
      window.removeEventListener('navigate-to-tasks', handleNavigateToTasks);
      window.removeEventListener('navigate-to-tasks-overdue', handleNavigateToTasksOverdue);
      window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
      window.removeEventListener('navigate-to-home', handleNavigateToHome);
      window.removeEventListener('navigate-to-users', handleNavigateToUsers);
      window.removeEventListener('open-add-person', handleOpenAddPerson);
    };
  }, []);

  // Handle session management and view restoration
  useEffect(() => {
    // Check if this is an active session
    const isActiveSession = sessionStorage.getItem('session-active');
    const savedView = localStorage.getItem('currentView');
    
    if (!isActiveSession) {
      // New session - mark as active and clear any saved view
      sessionStorage.setItem('session-active', 'true');
      localStorage.removeItem('currentView');
      // Stay at home (already default)
    } else if (isActiveSession && savedView && savedView !== 'home') {
      // Existing session with saved view - restore it
      setCurrentView(savedView);
    }
  }, []); // Run only once on mount

  // Update storage when view changes
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('currentView', currentView);
    }
  }, [currentView]);

  const loadData = async (showLoadingOverlay = false) => {
    try {
      if (showLoadingOverlay) {
        setLoading(true);
      }
      const allPeople = await fetchAllPeople();
      setPeople(allPeople);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskStats = async () => {
    const stats = await getTaskStats();
    setTaskStats(stats);
    
    // Calculate user-specific stats
    if (profile?.id) {
      const { data: myTasks } = await supabase
        .from('notes')
        .select('*')
        .eq('is_task', true)
        .eq('assigned_to_user', profile.id);
      
      if (myTasks) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const incomplete = myTasks.filter(t => t.status === 'incomplete').length;
        const overdue = myTasks.filter(t => t.status === 'incomplete' && new Date(t.due_date) < now).length;
        const dueToday = myTasks.filter(t => {
          const dueDate = new Date(t.due_date);
          return t.status === 'incomplete' && dueDate >= now && dueDate < tomorrow;
        }).length;
        
        setMyTaskStats({ incomplete, overdue, dueToday });
      }
    }

    // Load pending role requests for admin
    if (profile?.role === 'admin') {
      const requests = await getPendingRoleRequests();
      setPendingRoleRequestCount(requests.length);
    }
  };

  const loadPeopleTaskInfo = async () => {
    const taskInfo = await getAllPeopleTaskInfo();
    setPeopleTaskInfo(taskInfo);
  };

  const filteredAndSortedPeople = useMemo(() => {
    let filtered = people.filter(person => {
      const matchesSearch = searchTerm === '' || 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAge = filterAge === 'All' || person.ageBracket === filterAge;
      const matchesLocation = filterLocation === 'All' || person.location === filterLocation;
      const matchesStatus = filterStatus === 'All' || 
        (filterStatus === 'Registered' ? person.registered : !person.registered);
      // Attendance status filter
      const matchesAttendance = filterAttendance === 'All' || person.attendanceStatus === filterAttendance;
      
      return matchesSearch && matchesAge && matchesLocation && matchesStatus && matchesAttendance;
    });

    // Always sort alphabetically by first name
    filtered.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return filtered;
  }, [people, searchTerm, filterAge, filterLocation, filterStatus, filterAttendance]);

  const filteredAndSortedShirts = useMemo(() => {
    let filtered = people.filter(person => {
      const matchesSearch = shirtSearchTerm === '' || 
        `${person.firstName} ${person.lastName}`.toLowerCase().includes(shirtSearchTerm.toLowerCase());
      const matchesAge = shirtFilterAge === 'All' || person.ageBracket === shirtFilterAge;
      const matchesLocation = shirtFilterLocation === 'All' || person.location === shirtFilterLocation;
      const matchesPayment = shirtFilterPayment === 'All' || 
        (shirtFilterPayment === 'Paid' ? person.paid : !person.paid);
      const matchesDistribution = shirtFilterDistribution === 'All' || 
        (shirtFilterDistribution === 'Given' ? person.shirtGiven : !person.shirtGiven);
      const matchesSize = 
        shirtFilterSize === 'All' 
          ? true 
          : shirtFilterSize === 'None yet'
            ? !person.shirtSize || person.shirtSize === 'Select Size'
            : person.shirtSize === shirtFilterSize;
      const matchesPrint = shirtFilterPrint === 'All' || 
        (shirtFilterPrint === 'With Print' ? person.hasPrint : !person.hasPrint);
      const matchesAttendance = shirtFilterAttendance === 'All' || person.attendanceStatus === shirtFilterAttendance;
            
            return matchesSearch && matchesAge && matchesLocation && matchesPayment && matchesDistribution && matchesSize && matchesPrint && matchesAttendance;
          });

    // Always sort alphabetically by first name
    filtered.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return filtered;
  }, [people, shirtSearchTerm, shirtFilterAge, shirtFilterLocation, shirtFilterPayment, shirtFilterDistribution, shirtFilterSize, shirtFilterPrint, shirtFilterAttendance]);
  
  const stats = useMemo(() => {
    // Filter people attending the event (not shirt-only)
    const attendingPeople = people.filter(p => p.attendanceStatus === 'attending');
    const shirtOnlyPeople = people.filter(p => p.attendanceStatus === 'shirt_only');

    // Toddlers in the attending list (excluded from capacity calculations)
    const toddlersInAttending = attendingPeople.filter(p => p.ageBracket === 'Toddler');
    const totalToddlersOnList = toddlersInAttending.length;

    // Attending people who count toward capacity (non-toddlers)
    const attendingNonToddlers = attendingPeople.filter(p => p.ageBracket !== 'Toddler');

    // Registered/checked-in attendees (attending event, not shirt-only)
    const registeredAll = attendingPeople.filter(p => p.registered);
    const registeredNonToddlers = registeredAll.filter(p => p.ageBracket !== 'Toddler');
    const toddlersCheckedIn = registeredAll.filter(p => p.ageBracket === 'Toddler').length;

    const registered = registeredAll.length; // Total checked in (including toddlers)
    const registeredCapacity = registeredNonToddlers.length; // Checked in that count toward capacity

    // Pending = attending people (non-toddlers) who are NOT checked in
    // Formula: (attending with "attending event" status) - toddlers - checked-in people
    const preRegistered = attendingNonToddlers.filter(p => !p.registered).length;

    // Shirt counts (only those with actual shirt orders)
    const peopleWithShirtOrders = people.filter(p =>
      p.shirtSize &&
      p.shirtSize !== 'No shirt' &&
      p.shirtSize !== 'Select Size' &&
      p.shirtSize !== ''
    );

    const paid = peopleWithShirtOrders.filter(p => p.paid).length;
    const unpaid = peopleWithShirtOrders.filter(p => !p.paid).length;
    const shirtsGiven = peopleWithShirtOrders.filter(p => p.shirtGiven).length;
    const shirtsPending = peopleWithShirtOrders.filter(p => !p.shirtGiven).length;
    const maxCapacity = 230;

    // Capacity calculation - based on attending non-toddlers
    const attendingCountedTowardCapacity = attendingNonToddlers.length;

    const slotsRemaining = maxCapacity - attendingCountedTowardCapacity;
    const capacityPercentage = Math.round((attendingCountedTowardCapacity / maxCapacity) * 100);

    return {
      registered,
      registeredCapacity,
      toddlersCount: toddlersCheckedIn, // Toddlers who are checked in
      totalToddlersOnList,
      maxCapacity,
      slotsRemaining,
      capacityPercentage,
      attendingCountedTowardCapacity,
      preRegistered, // Pending check-in (non-toddlers who haven't checked in)
      total: people.length,
      attendingCount: attendingPeople.length,
      shirtOnlyCount: shirtOnlyPeople.length,
      paid,
      unpaid,
      shirtsGiven,
      shirtsPending
    };
  }, [people]);

  const handleResetRegistrationFilters = () => {
    setSearchTerm('');
    setFilterAge('All');
    setFilterLocation('All');
    setFilterStatus('All');
    setFilterAttendance('All');
  };

  const handleResetShirtFilters = () => {
    setShirtSearchTerm('');
    setShirtFilterAge('All');
    setShirtFilterLocation('All');
    setShirtFilterPayment('All');
    setShirtFilterDistribution('All');
    setShirtFilterSize('All');
    setShirtFilterPrint('All');
    setShirtFilterAttendance('All');
  };

  const handleSelectPerson = (id) => {
    setSelectedPeople(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPeople(filteredAndSortedPeople.map(p => p.id));
  };

  const handleBulkRegister = async () => {
    setLoading(true);
    for (const personId of selectedPeople) {
      const person = people.find(p => p.id === personId);
      if (person && !person.registered) {
        await checkInPerson(personId, profile?.id);  // ← Make sure profile?.id is here
      }
    }
    await loadData(true);
    setSelectedPeople([]);
    setLoading(false);
  };


  const handleBulkRemove = async () => {
    setLoading(true);
    for (const personId of selectedPeople) {
      const person = people.find(p => p.id === personId);
      if (person && person.registered) {
        await removeCheckIn(personId, profile?.id);
      }
    }
    await loadData(true);
    setSelectedPeople([]);
    setLoading(false);
  };

  const handlePrint = () => {
    // Find the print content element for the current view
    const viewSelector = currentView === 'shirts' ? '[data-print-view="shirts"]' : '[data-print-view="registration"]';
    let printContent = document.querySelector(viewSelector);

    // Fallback to any print-content if view-specific not found
    if (!printContent) {
      printContent = document.querySelector('.print-content');
    }

    if (!printContent) {
      console.error('No print content found');
      alert('Print content not available for this view');
      return;
    }

    // Temporarily make print content visible to capture innerHTML
    const originalDisplay = printContent.style.display;
    const originalPosition = printContent.style.position;
    const originalVisibility = printContent.style.visibility;

    printContent.style.display = 'block';
    printContent.style.position = 'absolute';
    printContent.style.visibility = 'hidden';
    printContent.style.left = '-9999px';

    // Force a reflow to ensure content is rendered
    // eslint-disable-next-line no-unused-expressions
    printContent.offsetHeight;

    // Capture the innerHTML
    const htmlContent = printContent.innerHTML;

    // Restore original styles
    printContent.style.display = originalDisplay;
    printContent.style.position = originalPosition;
    printContent.style.visibility = originalVisibility;
    printContent.style.left = '';

    if (!htmlContent || htmlContent.trim() === '') {
      console.error('Print content is empty');
      alert('No data to print. Please check your filters.');
      return;
    }

    // Open a new window for printing
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Please allow popups for this site to print');
      return;
    }

    // Write the print content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>FFSC Anniversary Management - Print</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              padding: 20px;
              margin: 0;
              background: white;
              color: #111;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
              font-size: 11px;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            h1 {
              font-size: 22px;
              font-weight: bold;
              margin-bottom: 4px;
              color: #111;
            }
            h2 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #333;
            }
            p, div {
              color: #333;
            }
            strong {
              color: #111;
            }
            .text-gray-600 {
              color: #4b5563;
            }
            .text-xs {
              font-size: 11px;
            }
            .mb-4 {
              margin-bottom: 16px;
            }
            .mb-6 {
              margin-bottom: 24px;
            }
            .text-sm {
              font-size: 13px;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    // Fallback in case onload doesn't fire
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }, 500);
  };

  const handleStatCardClick = (status) => {
    setCurrentView('registration');
    setFilterStatus(status === 'total' ? 'All' : status === 'registered' ? 'Registered' : 'PreRegistered');
  };

  const toggleShirtPayment = async (id) => {
    if (!settings.allowPaymentChange) {
      return; // Silently ignore if payment changes are disabled
    }
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, paid: !p.paid } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtPayment(id, person.paid);
    }
  };

  const toggleShirtGiven = async (id) => {
    if (!settings.allowDistributionChange) {
      return; // Silently ignore if distribution changes are disabled
    }
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, shirtGiven: !p.shirtGiven } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtGiven(id, person.shirtGiven);
    }
  };

  const toggleShirtPrint = async (id) => {
    if (!settings.allowPrintChange) {
      return; // Silently ignore if print changes are disabled
    }
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, hasPrint: !p.hasPrint } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtPrint(id, person.hasPrint);
    }
  };

  const updateShirtSize = async (id, size) => {
    if (!settings.allowShirtSizeChange) {
      return; // Silently ignore if shirt size changes are disabled
    }
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, shirtSize: size } : p)
    );
    await apiUpdateShirtSize(id, size);
  };

  const handleAddPerson = async (formData) => {
    await createPerson(formData, profile?.id);
    await loadData(true);
  };


  // Don't show full-screen loading on initial load, only on data updates

  

  // Update status bar color based on current view
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Use the same color as header background for consistency
      const color = '#f9fafa';
      metaThemeColor.setAttribute('content', color);
    }
  }, [currentView]);

  return (
    <div className="h-screen bg-white flex overflow-hidden" style={{ background: 'white', boxShadow: 'none' }}>
      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => {
          if (profile?.id) {
            localStorage.setItem(`welcome-seen-${profile.id}`, 'true');
          }
          setShowWelcome(false);
        }}
        userName={profile?.full_name || 'User'}
      />

      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <Sidebar 
          currentView={currentView} 
          setCurrentView={(view) => {
            setCurrentView(view);
            localStorage.setItem('currentView', view);
          }}
          onAddPersonClick={() => setIsAddPersonOpen(true)}
          taskStats={myTaskStats}
          userProfile={profile}
        />
      )}
      <div className={`flex-1 ${isMobile ? 'px-0 pt-0' : 'px-6 pt-16 ml-0 md:ml-16'} transition-all duration-300 overflow-y-auto`} style={{ background: 'transparent' }}>
        <div className="w-full">

        {currentView === 'home' && (
          <HomePage 
            stats={stats}
            taskStats={taskStats}
            profile={profile}
            setCurrentView={setCurrentView}
          />
        )}

        

        {currentView === 'registration' && (
          isMobile ? (
            <MobileRegistrationView
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAge={filterAge}
              setFilterAge={setFilterAge}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterAttendance={filterAttendance}
              setFilterAttendance={setFilterAttendance}
              onResetFilters={handleResetRegistrationFilters}
              filteredAndSortedPeople={filteredAndSortedPeople}
              handleBulkRegister={handleBulkRegister}
              handleBulkRemove={handleBulkRemove}
              selectedPeople={selectedPeople}
              handleSelectPerson={handleSelectPerson}
              people={people}
              peopleTaskInfo={peopleTaskInfo}
            />
          ) : (
            <RegistrationView
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterAge={filterAge}
              setFilterAge={setFilterAge}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterAttendance={filterAttendance}
              setFilterAttendance={setFilterAttendance}
              onResetFilters={handleResetRegistrationFilters}
              handleSelectAll={handleSelectAll}
              selectedPeople={selectedPeople}
              filteredAndSortedPeople={filteredAndSortedPeople}
              handleBulkRegister={handleBulkRegister}
              handleBulkRemove={handleBulkRemove}
              handlePrint={handlePrint}
              handleSelectPerson={handleSelectPerson}
              people={people}
              peopleTaskInfo={peopleTaskInfo}
              stats={stats}
            />
          )
        )}

        {currentView === 'shirts' && (
          isMobile ? (
            <MobileShirtManagementView
              people={filteredAndSortedShirts}
              stats={stats}
              systemSettings={settings}
              updateShirtSize={updateShirtSize}
              toggleShirtPayment={toggleShirtPayment}
              toggleShirtGiven={toggleShirtGiven}
              toggleShirtPrint={toggleShirtPrint}
              shirtSearchTerm={shirtSearchTerm}
              setShirtSearchTerm={setShirtSearchTerm}
              shirtFilterAge={shirtFilterAge}
              setShirtFilterAge={setShirtFilterAge}
              shirtFilterLocation={shirtFilterLocation}
              setShirtFilterLocation={setShirtFilterLocation}
              shirtFilterPayment={shirtFilterPayment}
              setShirtFilterPayment={setShirtFilterPayment}
              shirtFilterDistribution={shirtFilterDistribution}
              setShirtFilterDistribution={setShirtFilterDistribution}
              shirtFilterSize={shirtFilterSize}
              setShirtFilterSize={setShirtFilterSize}
              shirtFilterAttendance={shirtFilterAttendance}
              setShirtFilterAttendance={setShirtFilterAttendance}
              shirtFilterPrint={shirtFilterPrint}
              setShirtFilterPrint={setShirtFilterPrint}
              onResetFilters={handleResetShirtFilters}
              peopleTaskInfo={peopleTaskInfo}
            />
          ) : (
            <ShirtManagementView
              people={filteredAndSortedShirts}
              stats={stats}
              systemSettings={settings}
              updateShirtSize={updateShirtSize}
              toggleShirtPayment={toggleShirtPayment}
              toggleShirtGiven={toggleShirtGiven}
              toggleShirtPrint={toggleShirtPrint}
              shirtSearchTerm={shirtSearchTerm}
              setShirtSearchTerm={setShirtSearchTerm}
              shirtFilterAge={shirtFilterAge}
              setShirtFilterAge={setShirtFilterAge}
              shirtFilterLocation={shirtFilterLocation}
              setShirtFilterLocation={setShirtFilterLocation}
              shirtFilterPayment={shirtFilterPayment}
              setShirtFilterPayment={setShirtFilterPayment}
              shirtFilterDistribution={shirtFilterDistribution}
              setShirtFilterDistribution={setShirtFilterDistribution}
              shirtFilterSize={shirtFilterSize}
              setShirtFilterSize={setShirtFilterSize}
              shirtFilterAttendance={shirtFilterAttendance}
              setShirtFilterAttendance={setShirtFilterAttendance}
              shirtFilterPrint={shirtFilterPrint}
              setShirtFilterPrint={setShirtFilterPrint}
              onResetFilters={handleResetShirtFilters}
              peopleTaskInfo={peopleTaskInfo}
              handlePrint={handlePrint}
            />
          )
        )}

        {currentView === 'tasks' && (
          profile?.role === 'viewer' ? (
            <RestrictedAccessMessage
              title="Tasks - Restricted Access"
              message="You don't have permission to manage tasks. Please contact an administrator if you need access to this feature."
            />
          ) : isMobile ? (
            <MobileTasksView onTaskUpdate={() => { loadTaskStats(); loadPeopleTaskInfo(); }} />
          ) : (
            <TasksView onTaskUpdate={() => { loadTaskStats(); loadPeopleTaskInfo(); }} />
          )
        )}

        {currentView === 'dashboard' && (
          <Dashboard people={people} stats={stats} />
        )}

        {currentView === 'users' && profile?.role === 'admin' && (
          <UserManagement />
        )}

        {currentView === 'system-settings' && profile?.role === 'admin' && (
          <SystemSettings />
        )}

        {currentView === 'profile' && (
          <ProfileSettings />
        )}

        {currentView === 'collections' && (
          profile?.role === 'viewer' ? (
            <RestrictedAccessMessage
              title="Collections - Restricted Access"
              message="You don't have permission to view payment collections. Please contact an administrator if you need access to this feature."
            />
          ) : isMobile ? (
            <MobileCollectionsView
              people={people}
              systemSettings={settings}
              toggleShirtPayment={toggleShirtPayment}
              peopleTaskInfo={peopleTaskInfo}
            />
          ) : (
            <CollectionsView
              people={people}
              systemSettings={settings}
              toggleShirtPayment={toggleShirtPayment}
              peopleTaskInfo={peopleTaskInfo}
            />
          )
        )}

        {currentView === 'finance' && (
          profile?.role === 'viewer' ? (
            <RestrictedAccessMessage
              title="Finance - Restricted Access"
              message="You don't have permission to view financial information. Please contact an administrator if you need access to this feature."
            />
          ) : isMobile ? (
            <MobileFinanceView people={people} />
          ) : (
            <FinanceView people={people} />
          )
        )}

        {/* Add Person Sidebar */}
        <AddPersonSidebar
          isOpen={isAddPersonOpen}
          onClose={() => setIsAddPersonOpen(false)}
          onPersonAdded={handleAddPerson}
        />

        {/* Loading Overlay */}
        {loading && <LoadingOverlay />}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav 
          currentView={currentView}
          setCurrentView={setCurrentView}
          taskCount={myTaskStats.incomplete}
          roleRequestCount={pendingRoleRequestCount}
        />
      )}

      {/* Task Assignment Notifications */}
      <TaskAssignmentNotification />

      {/* Role Request Result Dialog */}
      <RoleRequestDialog
        isOpen={roleRequestResult.show}
        status={roleRequestResult.status}
        oldRole={roleRequestResult.oldRole}
        newRole={roleRequestResult.newRole}
        isRequestResponse={roleRequestResult.isRequestResponse}
        onClose={() => setRoleRequestResult({ show: false, status: '', oldRole: null, newRole: null, isRequestResponse: true })}
      />

      <style>{`
        /* Remove any default gradients */
        body, html, #root {
          background: white !important;
          background-image: none !important;
        }
        
        /* Remove any box shadows that might create gradients */
        * {
          box-shadow: none !important;
        }
        
        /* Hide scrollbar on mobile - industry standard for mobile apps */
        @media (max-width: 767px) {
          body, html, #root, .min-h-screen {
            background: white !important;
            background-image: none !important;
            box-shadow: none !important;
          }
          
          /* Remove potential shadow/gradient from main containers */
          .flex, .min-h-screen, div[style*="background"] {
            box-shadow: none !important;
          }
          
          /* Hide scrollbar on all elements */
          * {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          *::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        }
      `}</style>
    </div>
  );
}

// Main App with Router and Authentication
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SystemSettingsProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes - all app content */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </SystemSettingsProvider>
      </AuthProvider>
    </Router>
  );
}