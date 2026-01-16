import React, { useMemo } from 'react';
import Header from './Header';
import StatCard from './StatCard';
import { Users, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import AgeBracketChart from './charts/AgeBracketChart';
import HourlyTrendChart from './charts/HourlyTrendChart';
import ShirtDistributionChart from './charts/ShirtDistributionChart';
import RegistrationSummary from './charts/RegistrationSummary';
import GenderAttendanceChart from './charts/GenderAttendanceChart';
import LocationBreakdownChart from './charts/LocationBreakdownChart';

export default function Dashboard({ people = [], stats = {} }) {
  
  // Limit to first 220 people
  const limitedPeople = useMemo(() => people.slice(0, 220), [people]);

  // State for selected date - use Philippine time
  const [selectedDate, setSelectedDate] = React.useState(() => {
    // Get today's date in Philippine time
    const phDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDateObj = new Date(phDate);
    const year = phDateObj.getFullYear();
    const month = String(phDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(phDateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  // Calculate age bracket distribution
  const ageBracketData = useMemo(() => {
    const brackets = { Adult: 0, Youth: 0, Kid: 0, Toddler: 0 };
    limitedPeople.forEach(p => {
      if (brackets.hasOwnProperty(p.ageBracket)) {
        brackets[p.ageBracket]++;
      }
    });
    return Object.entries(brackets).map(([name, value]) => ({ name, value }));
  }, [limitedPeople]);


  // Calculate gender attendance distribution
  const genderAttendanceData = useMemo(() => {
    const genders = {};
    
    limitedPeople.forEach(p => {
      const gender = p.gender || 'Not Specified';
      if (!genders[gender]) {
        genders[gender] = { gender, registered: 0, preRegistered: 0, total: 0 };
      }
      
      genders[gender].total++;
      if (p.registered) {
        genders[gender].registered++;
      } else {
        genders[gender].preRegistered++;
      }
    });
    
    return Object.values(genders);
  }, [limitedPeople]);

  // Calculate location breakdown
  const locationBreakdownData = useMemo(() => {
    const locations = {};
    
    limitedPeople.forEach(p => {
      const location = p.location || 'Unknown';
      if (!locations[location]) {
        locations[location] = { location, total: 0, registered: 0, preRegistered: 0 };
      }
      
      locations[location].total++;
      if (p.registered) {
        locations[location].registered++;
      } else {
        locations[location].preRegistered++;
      }
    });
    
    return Object.values(locations);
  }, [limitedPeople]);

  // Generate hourly trend data for selected date (Philippine Time)
  const hourlyTrendData = useMemo(() => {
    const data = [];
    
    // Helper function to extract Philippine time components
    const getPhilippineTime = (dateString) => {
      // Ensure the timestamp has a timezone indicator (treat as UTC if missing)
      let timestamp = dateString;
      if (typeof timestamp === 'string' && !timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        timestamp = timestamp + 'Z';
      }
      
      const date = new Date(timestamp);
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(date);
      const getValue = (type) => parseInt(parts.find(p => p.type === type)?.value || 0);
      
      return {
        year: getValue('year'),
        month: getValue('month'),
        day: getValue('day'),
        hour: getValue('hour')
      };
    };
    
    // Parse selected date
    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);
    
    // Get all registrations for selected date in Philippine time
    const dateRegistrations = people.filter(p => {
      if (!p.registeredAt || !p.registered) return false;
      
      const regPH = getPhilippineTime(p.registeredAt);
      
      return regPH.day === selectedDay && 
             regPH.month === selectedMonth && 
             regPH.year === selectedYear;
    });
    
    // Determine hour range based on registrations
    let earliestHour = 0;
    let latestHour = 23;
    
    if (dateRegistrations.length > 0) {
      const hours = dateRegistrations.map(p => getPhilippineTime(p.registeredAt).hour);
      earliestHour = Math.min(...hours);
      latestHour = Math.max(...hours);
      
      // Add some padding for better visualization
      earliestHour = Math.max(0, earliestHour - 1);
      latestHour = Math.min(23, latestHour + 1);
    }
    
    // Generate data for each hour
    for (let hour = earliestHour; hour <= latestHour; hour++) {
      const hourStr = hour === 0 ? '12 am' : 
                      hour === 12 ? '12 pm' : 
                      hour > 12 ? `${hour - 12} pm` : 
                      `${hour} am`;
      
      const checkedInThisHour = dateRegistrations.filter(p => {
        return getPhilippineTime(p.registeredAt).hour === hour;
      }).length;
      
      data.push({
        time: hourStr,
        checkedIn: checkedInThisHour,
        total: checkedInThisHour
      });
    }
    
    return data;
  }, [people, selectedDate]);

  // Calculate total registrations for selected date
  const selectedDateTotalRegistrations = useMemo(() => {
    const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-').map(Number);
    
    const getPhilippineTime = (dateString) => {
      // Ensure the timestamp has a timezone indicator (treat as UTC if missing)
      let timestamp = dateString;
      if (typeof timestamp === 'string' && !timestamp.includes('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        timestamp = timestamp + 'Z';
      }
      
      const date = new Date(timestamp);
      
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      
      const parts = formatter.formatToParts(date);
      const getValue = (type) => parseInt(parts.find(p => p.type === type)?.value || 0);
      
      return {
        year: getValue('year'),
        month: getValue('month'),
        day: getValue('day')
      };
    };
    
    return people.filter(p => {
      if (!p.registeredAt || !p.registered) return false;
      const regPH = getPhilippineTime(p.registeredAt);
      return regPH.day === selectedDay && 
             regPH.month === selectedMonth && 
             regPH.year === selectedYear;
    }).length;
  }, [people, selectedDate]);

  // Calculate shirt distribution by size - use actual sizes from database
  const shirtDistributionData = useMemo(() => {
    const sizeData = {};
    
    // Count people by size and status - dynamically find all sizes
    limitedPeople.forEach(p => {
      if (p.shirtSize && p.shirtSize !== 'Select Size' && p.shirtSize !== '') {
        if (!sizeData[p.shirtSize]) {
          sizeData[p.shirtSize] = { size: p.shirtSize, pending: 0, given: 0, unpaid: 0, paid: 0 };
        }
        
        if (p.shirtGiven) {
          sizeData[p.shirtSize].given++;
        } else {
          sizeData[p.shirtSize].pending++;
        }
        
        if (p.paid) {
          sizeData[p.shirtSize].paid++;
        } else {
          sizeData[p.shirtSize].unpaid++;
        }
      }
    });
    
    // Sort sizes in a logical order (S, M, L, XL, 2XL, 3XL, etc.)
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
    const sortedData = Object.values(sizeData).sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.size);
      const indexB = sizeOrder.indexOf(b.size);
      
      // If both sizes are in the standard order, use that order
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only one is in standard order, put it first
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // Otherwise sort alphabetically
      return a.size.localeCompare(b.size);
    });
    
    return sortedData;
  }, [limitedPeople]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Header 
        viewTitle="Dashboard" 
        showSearch={false}
      />
      
      <div className="p-6 bg-[#f9fafa] min-h-screen">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#001740]">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Real-time overview of registration and event metrics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard 
            title="Total Pre-registered" 
            value={stats.total || 0} 
            Icon={Users} 
            color="blue"
            variant="expanded"
          />
          <StatCard
            title="Checked In"
            value={`${stats.registeredCapacity || 0} / ${stats.attendingCountedTowardCapacity || 0}`}
            subtitle={stats.toddlersCount > 0 ? `(+${stats.toddlersCount} ${stats.toddlersCount === 1 ? 'toddler' : 'toddlers'})` : null}
            Icon={CheckCircle}
            color="green"
            variant="expanded"
          />
          <StatCard 
            title="Slots Remaining" 
            value={stats.slotsRemaining || 0}
            subtitle={`${stats.capacityPercentage || 0}% capacity`}
            Icon={Users} 
            color="purple"
            variant="expanded"
          />
          <StatCard 
            title="Pending Check-in" 
            value={stats.preRegistered || 0} 
            Icon={Clock} 
            color="yellow"
            variant="expanded"
          />
          <StatCard 
            title="Shirts Given" 
            value={stats.shirtsGiven || 0} 
            Icon={ShoppingBag} 
            color="green"
            variant="expanded"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Registration Trend */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Registration Trend</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <HourlyTrendChart 
              data={hourlyTrendData} 
              height={280}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              totalRegistrations={selectedDateTotalRegistrations}
            />
          </div>

          {/* Age Group Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Age Group Distribution</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <AgeBracketChart data={ageBracketData} height={320} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Shirt Distribution Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Shirt Distribution Breakdown</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <ShirtDistributionChart data={shirtDistributionData} height={260} />
          </div>

          {/* Registration Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Registration Breakdown</h3>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <RegistrationSummary stats={stats} />
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Gender Attendance Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Gender & Attendance</h3>
                <p className="text-xs text-gray-500 mt-1">RSVP vs actual attendance</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <GenderAttendanceChart data={genderAttendanceData} height={280} />
          </div>

          {/* Location Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-[#001740]">Location Distribution</h3>
                <p className="text-xs text-gray-500 mt-1">Attendees by location</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="4" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
                  <circle cx="10" cy="16" r="1.5" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <LocationBreakdownChart data={locationBreakdownData} height={280} maxCapacity={220} />
          </div>
        </div>
      </div>
    </>
  );
}