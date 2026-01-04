import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
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
import ProfileSettings from './components/ProfileSettings';
import HomePage from './components/HomePage';
import WelcomeModal from './components/WelcomeModal';
import MobileBottomNav from './components/MobileBottomNav';
import TaskAssignmentNotification from './components/TaskAssignmentNotification';
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

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

function AppContent() {
  const { profile } = useAuth();
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

  // Update status bar color based on current view
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      // Use dark blue for most views, white for home
      const color = currentView === 'home' ? '#ffffff' : '#001740';
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

    window.addEventListener('navigate-to-tasks', handleNavigateToTasks);
    window.addEventListener('navigate-to-tasks-overdue', handleNavigateToTasksOverdue);
    window.addEventListener('navigate-to-profile', handleNavigateToProfile);
    window.addEventListener('navigate-to-home', handleNavigateToHome);
    window.addEventListener('navigate-to-users', handleNavigateToUsers);
    
    return () => {
      window.removeEventListener('navigate-to-tasks', handleNavigateToTasks);
      window.removeEventListener('navigate-to-tasks-overdue', handleNavigateToTasksOverdue);
      window.removeEventListener('navigate-to-profile', handleNavigateToProfile);
      window.removeEventListener('navigate-to-home', handleNavigateToHome);
      window.removeEventListener('navigate-to-users', handleNavigateToUsers);
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
    
    // Registered attendees (checked in, attending event)
    const registeredAll = attendingPeople.filter(p => p.registered);
    const registeredCounted = registeredAll.filter(p => p.ageBracket !== 'Toddler'); // Exclude toddlers from capacity count
    const toddlersCount = registeredAll.filter(p => p.ageBracket === 'Toddler').length;
    
    const registered = registeredAll.length;
    const registeredCapacity = registeredCounted.length; // Count toward venue capacity
    const preRegistered = attendingPeople.filter(p => !p.registered).length;
    
    // Shirt counts (includes both attending AND shirt-only)
    const paid = people.filter(p => p.paid).length;
    const unpaid = people.filter(p => !p.paid).length;
    const shirtsGiven = people.filter(p => p.shirtGiven).length;
    const shirtsPending = people.filter(p => !p.shirtGiven).length;
    const maxCapacity = 230;
    
    // Capacity calculation - based on people on the list (not checked in)
    // Count all attending people except toddlers
    const attendingCountedTowardCapacity = attendingPeople.filter(p => p.ageBracket !== 'Toddler').length;
    const totalToddlersOnList = attendingPeople.filter(p => p.ageBracket === 'Toddler').length;
    
    const slotsRemaining = maxCapacity - attendingCountedTowardCapacity;
    const capacityPercentage = Math.round((attendingCountedTowardCapacity / maxCapacity) * 100);
    
    return { 
      registered, 
      registeredCapacity, 
      toddlersCount,
      totalToddlersOnList,
      maxCapacity,
      slotsRemaining,
      capacityPercentage,
      attendingCountedTowardCapacity,
      preRegistered, 
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
    window.print();
  };

  const handleStatCardClick = (status) => {
    setCurrentView('registration');
    setFilterStatus(status === 'total' ? 'All' : status === 'registered' ? 'Registered' : 'PreRegistered');
  };

  const toggleShirtPayment = async (id) => {
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, paid: !p.paid } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtPayment(id, person.paid);
    }
  };

  const toggleShirtGiven = async (id) => {
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, shirtGiven: !p.shirtGiven } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtGiven(id, person.shirtGiven);
    }
  };

  const toggleShirtPrint = async (id) => {
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, hasPrint: !p.hasPrint } : p)
    );
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtPrint(id, person.hasPrint);
    }
  };

  const updateShirtSize = async (id, size) => {
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
      // Use dark blue for most views, white for home
      const color = currentView === 'home' ? '#ffffff' : '#001740';
      metaThemeColor.setAttribute('content', color);
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-white flex" style={{ background: 'white' }}>
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
      <div className={`flex-1 ${isMobile ? 'px-0 pt-0' : 'px-6 pt-16 ml-0 md:ml-16'} transition-all duration-300`} style={{ background: 'transparent' }}>
        <div className="w-full">

        {currentView === 'home' && (
          <HomePage 
            stats={stats}
            taskStats={taskStats}
            profile={profile}
            setCurrentView={setCurrentView}
          />
        )}

        {/* Mobile Add Person Button - Top Right */}
        {isMobile && profile?.role !== 'viewer' && currentView !== 'home' && currentView !== 'profile' && currentView !== 'users' && (
          <button
            onClick={() => setIsAddPersonOpen(true)}
            className="fixed top-4 right-4 z-40 p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 active:scale-95"
            aria-label="Add person"
          >
            <Plus size={20} className="text-gray-400" />
          </button>
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
          )
        )}

        {currentView === 'tasks' && (
          isMobile ? (
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

        {currentView === 'profile' && (
          <ProfileSettings />
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
        
        /* Hide scrollbar on mobile */
        @media (max-width: 767px) {
          * {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE and Edge */
          }
          *::-webkit-scrollbar {
            display: none; /* Chrome, Safari, Opera */
          }
        }
      `}</style>
      <style>{`
        @media print {
          .print-content {
            display: block !important;
          }
          body {
            background: white !important;
            box-shadow: none !important;
          }
          * {
            box-shadow: none !important;
            background-image: none !important;
          }
          *::before, *::after {
            box-shadow: none !important;
            background: none !important;
          }
          /* Hide all fixed positioned elements (sidebars) in print */
          .fixed {
            display: none !important;
          }
          table {
            page-break-inside: auto;
            box-shadow: none !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          div, section, main {
            box-shadow: none !important;
          }
        }
        @media screen {
          .print-content {
            display: none;
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
      </AuthProvider>
    </Router>
  );
}