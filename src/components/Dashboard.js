import React, { useMemo } from 'react';
import Header from './Header';
import StatCard from './StatCard';
import { Users, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import AgeBracketChart from './charts/AgeBracketChart';
import HourlyTrendChart from './charts/HourlyTrendChart';
import ShirtDistributionChart from './charts/ShirtDistributionChart';
import RegistrationSummary from './charts/RegistrationSummary';

export default function Dashboard({ people = [], stats = {} }) {
  
  // Calculate age bracket distribution
  const ageBracketData = useMemo(() => {
    const brackets = { Adult: 0, Youth: 0, Kid: 0, Toddler: 0 };
    people.forEach(p => {
      if (brackets.hasOwnProperty(p.ageBracket)) {
        brackets[p.ageBracket]++;
      }
    });
    return Object.entries(brackets).map(([name, value]) => ({ name, value }));
  }, [people]);

  // Generate hourly trend data for today
  const hourlyTrendData = useMemo(() => {
    const data = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Generate data for 8 AM to 10 PM (or current hour if later)
    const startHour = 8;
    const endHour = Math.max(22, currentHour);
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const hourStr = hour === 12 ? '12 pm' : hour > 12 ? `${hour - 12} pm` : `${hour} am`;
      
      // Filter people registered at this hour today
      const hourStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 0, 0);
      const hourEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, 59, 59);
      
      const checkedInThisHour = people.filter(p => {
        if (!p.registeredAt || !p.registered) return false;
        const regDate = new Date(p.registeredAt);
        return regDate >= hourStart && regDate <= hourEnd;
      }).length;
      
      const totalThisHour = people.filter(p => {
        if (!p.registeredAt) return false;
        const regDate = new Date(p.registeredAt);
        return regDate >= hourStart && regDate <= hourEnd;
      }).length;
      
      data.push({
        time: hourStr,
        checkedIn: checkedInThisHour,
        total: totalThisHour
      });
    }
    
    return data;
  }, [people]);

  // Calculate shirt distribution by size
  const shirtDistributionData = useMemo(() => {
    const sizes = ['M', 'L', 'XL', 'SL', 'XL', 'TS', 'X', '2XL', 'TS', '2XL', 'TS'];
    const sizeData = {};
    
    // Initialize all sizes
    sizes.forEach(size => {
      if (!sizeData[size]) {
        sizeData[size] = { size, pending: 0, given: 0, unpaid: 0, paid: 0 };
      }
    });
    
    // Count people by size and status
    people.forEach(p => {
      if (p.shirtSize && sizeData[p.shirtSize]) {
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
    
    return Object.values(sizeData);
  }, [people]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Total Pre-registered" 
            value={stats.total || 0} 
            Icon={Users} 
            color="blue"
            variant="expanded"
          />
          <StatCard 
            title="Checked In" 
            value={stats.registered || 0} 
            Icon={CheckCircle} 
            color="green"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Registration Trend */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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
            <HourlyTrendChart data={hourlyTrendData} height={280} />
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Shirt Distribution Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
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
      </div>
    </>
  );
}