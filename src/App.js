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


import { 
  fetchAllPeople, 
  checkInPerson, 
  removeCheckIn,
  updateShirtSize as apiUpdateShirtSize,
  toggleShirtPayment as apiToggleShirtPayment,
  toggleShirtGiven as apiToggleShirtGiven,
  getAgeBracket,
  createPerson,
  getTaskStats,
  getAllPeopleTaskInfo
} from './services/api';
import { supabase } from './services/supabase';

import './assets/fonts/fonts.css';

function AppContent() {
  const { profile } = useAuth();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    // Check if user has seen welcome message before
    const hasSeenWelcome = localStorage.getItem(`welcome-seen-${profile?.id}`);
    return !hasSeenWelcome && profile?.role === 'viewer';
  });

  // Mark welcome as seen when user dismisses it
  const dismissWelcome = () => {
    localStorage.setItem(`welcome-seen-${profile?.id}`, 'true');
    setShowWelcome(false);
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [filterAge, setFilterAge] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [shirtSearchTerm, setShirtSearchTerm] = useState('');
  const [shirtFilterAge, setShirtFilterAge] = useState('All');
  const [shirtFilterLocation, setShirtFilterLocation] = useState('All');
  const [shirtFilterPayment, setShirtFilterPayment] = useState('All');
  const [shirtFilterDistribution, setShirtFilterDistribution] = useState('All');
  const [shirtFilterSize, setShirtFilterSize] = useState('All');
  const [currentView, setCurrentView] = useState(() => {
  // Try to get saved view from localStorage, default to 'home'
  return localStorage.getItem('currentView') || 'home';
});
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
  

  

// Realtime subscriptions for people, registrations, and shirts
useEffect(() => {
  const initializeData = async () => {
    try {
      await loadData(); 
      await loadTaskStats();  
      await loadPeopleTaskInfo();
    } catch (error) {
      setLoading(false);
    }
  };
  
  initializeData();

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
          gender: payload.new?.gender, // Add gender field
          ageBracket: payload.new ? getAgeBracket(payload.new.age) : 'Adult',
          location: payload.new?.location === 'GUEST' ? 'Guest' : payload.new?.location,
          contactNumber: payload.new?.contact_number,
        };
      } else if (table === 'shirts') {
        updatedFields = {
          shirtSize: payload.new?.shirt_size || '',
          paid: payload.new?.paid || false,
          shirtGiven: payload.new?.shirt_given || false,
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
}, []);





  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for navigation events from bell notifications
  useEffect(() => {
    const handleNavigateToTasks = () => {
      setCurrentView('tasks');
    };

    window.addEventListener('navigate-to-tasks', handleNavigateToTasks);
    return () => window.removeEventListener('navigate-to-tasks', handleNavigateToTasks);
  }, []);

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
      
      return matchesSearch && matchesAge && matchesLocation && matchesStatus;
    });

    // Always sort alphabetically by first name
    filtered.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return filtered;
  }, [people, searchTerm, filterAge, filterLocation, filterStatus]);

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
            
            return matchesSearch && matchesAge && matchesLocation && matchesPayment && matchesDistribution && matchesSize;
          });

    // Always sort alphabetically by first name
    filtered.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB);
    });

    return filtered;
  }, [people, shirtSearchTerm, shirtFilterAge, shirtFilterLocation, shirtFilterPayment, shirtFilterDistribution, shirtFilterSize]);
  
  const stats = useMemo(() => {
    const registered = people.filter(p => p.registered).length;
    const preRegistered = people.filter(p => !p.registered).length;
    const paid = people.filter(p => p.paid).length;
    const unpaid = people.filter(p => !p.paid).length;
    const shirtsGiven = people.filter(p => p.shirtGiven).length;
    const shirtsPending = people.filter(p => !p.shirtGiven).length;
    return { registered, preRegistered, total: people.length, paid, unpaid, shirtsGiven, shirtsPending };
  }, [people]);

  const handleResetRegistrationFilters = () => {
    setSearchTerm('');
    setFilterAge('All');
    setFilterLocation('All');
    setFilterStatus('All');
  };

  const handleResetShirtFilters = () => {
    setShirtSearchTerm('');
    setShirtFilterAge('All');
    setShirtFilterLocation('All');
    setShirtFilterPayment('All');
    setShirtFilterDistribution('All');
    setShirtFilterSize('All');
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
        await checkInPerson(personId);
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
        await removeCheckIn(personId);
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

  const updateShirtSize = async (id, size) => {
    setPeople(prev =>
      prev.map(p => p.id === id ? { ...p, shirtSize: size } : p)
    );
    await apiUpdateShirtSize(id, size);
  };

  const handleAddPerson = async (formData) => {
    await createPerson(formData);
    await loadData(true);
  };


  // Don't show full-screen loading on initial load, only on data updates

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={(view) => {
          setCurrentView(view);
          localStorage.setItem('currentView', view);
        }}
        onAddPersonClick={() => setIsAddPersonOpen(true)}
        taskStats={taskStats}
        userProfile={profile}
      />
      <div className="flex-1 px-6 pt-16 ml-0 md:ml-16 transition-all duration-300">
        <div className="w-full">

        {currentView === 'home' && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mt-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome, {profile?.full_name || 'User'}! 👋
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  FFSC Anniversary Management System
                </p>
                <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mt-4">
                  Role: {profile?.role?.toUpperCase() || 'VIEWER'}
                </div>
                
                {/* First-time user welcome message */}
                {showWelcome && profile?.role === 'viewer' && (
                  <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto relative">
                    <button
                      onClick={dismissWelcome}
                      className="absolute top-4 right-4 text-green-600 hover:text-green-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-semibold text-green-900 mb-3">
                      🎉 Account Created Successfully!
                    </h2>
                    <p className="text-green-800 mb-4">
                      Your account has been created with <strong>Viewer</strong> access. You can view dashboards and reports.
                    </p>
                    <p className="text-sm text-green-700 mb-4">
                      📧 If you need additional permissions (Volunteer or Admin access), please contact an administrator.
                    </p>
                    <button
                      onClick={dismissWelcome}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Got it, thanks!
                    </button>
                  </div>
                )}
                
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    🚧 Home page with personalized dashboard coming soon!
                  </p>
                  <p className="text-sm text-gray-500">
                    For now, use the sidebar to navigate to other sections.
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.registered}</div>
                    <div className="text-sm text-gray-600">Registered</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                    <div className="text-sm text-gray-600">Paid</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.shirtsGiven}</div>
                    <div className="text-sm text-gray-600">Shirts Given</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{taskStats.incomplete}</div>
                    <div className="text-sm text-gray-600">Active Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
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