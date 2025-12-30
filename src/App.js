import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RegistrationView from './components/RegistrationView';
import ShirtManagementView from './components/ShirtManagementView';
import MobileRegistrationView from './components/MobileRegistrationView';
import MobileShirtManagementView from './components/MobileShirtManagementView';
import Dashboard from './components/Dashboard';
import LoadingOverlay from './components/LoadingOverlay';
import { 
  fetchAllPeople, 
  checkInPerson, 
  removeCheckIn,
  updateShirtSize as apiUpdateShirtSize,
  toggleShirtPayment as apiToggleShirtPayment,
  toggleShirtGiven as apiToggleShirtGiven,
  getAgeBracket
} from './services/api';
import { supabase } from './services/supabase';

export default function App() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [currentView, setCurrentView] = useState('registration');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  

  

// Realtime subscriptions for people, registrations, and shirts
useEffect(() => {
  loadData();

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

  return () => {
    supabase.removeChannel(peopleSub);
    supabase.removeChannel(shirtsSub);
    supabase.removeChannel(registrationsSub);
  };
}, []);





  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async (showLoadingOverlay = false) => {
    if (showLoadingOverlay) {
      setLoading(true);
    }
    const allPeople = await fetchAllPeople();
    setPeople(allPeople);
    setLoading(false);
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
    if (selectedPeople.length === filteredAndSortedPeople.length) {
      setSelectedPeople([]);
    } else {
      setSelectedPeople(filteredAndSortedPeople.map(p => p.id));
    }
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


  // Don't show full-screen loading on initial load, only on data updates

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className={`flex-1 px-6 pt-16 ml-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="w-full">

        {currentView === 'dashboard' && (
          <Dashboard people={people} stats={stats} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
            />
          )
        )}

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
            background: white;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
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