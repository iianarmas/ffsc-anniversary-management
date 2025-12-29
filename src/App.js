import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import RegistrationView from './components/RegistrationView';
import ShirtManagementView from './components/ShirtManagementView';
import MobileRegistrationView from './components/MobileRegistrationView';
import MobileShirtManagementView from './components/MobileShirtManagementView';
import { 
  fetchAllPeople, 
  checkInPerson, 
  removeCheckIn,
  updateShirtSize as apiUpdateShirtSize,
  toggleShirtPayment as apiToggleShirtPayment,
  toggleShirtGiven as apiToggleShirtGiven
} from './services/api';

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

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadData = async () => {
    setLoading(true);
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
      const matchesSize = shirtFilterSize === 'All' || person.shirtSize === shirtFilterSize;
      
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
    await loadData();
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
    await loadData();
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
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtPayment(id, person.paid);
      await loadData();
    }
  };

  const toggleShirtGiven = async (id) => {
    const person = people.find(p => p.id === id);
    if (person) {
      await apiToggleShirtGiven(id, person.shirtGiven);
      await loadData();
    }
  };

  const updateShirtSize = async (id, size) => {
    await apiUpdateShirtSize(id, size);
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
          <div className="no-print">
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            stats={stats}
            handleStatCardClick={handleStatCardClick}
          />
        </div>

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