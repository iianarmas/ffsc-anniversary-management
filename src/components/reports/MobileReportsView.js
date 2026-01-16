import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MobileHeader from '../mobile/MobileHeader';
import ExecutiveSummary from './ExecutiveSummary';
import LeadershipReport from './LeadershipReport';
import CommitteeReport from './CommitteeReport';
import FinanceReport from './FinanceReport';
import { FileSpreadsheet, ChevronDown } from 'lucide-react';
import {
  getLeadershipReportData,
  getCommitteeReportData,
  getVolunteerActivityData,
  getFinanceReportData,
  getExecutiveSummary,
  generateReportCSV
} from '../../services/reportService';

export default function MobileReportsView({ people = [] }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const phDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phDateObj = new Date(phDate);
    const year = phDateObj.getFullYear();
    const month = String(phDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(phDateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Report data state
  const [executiveData, setExecutiveData] = useState(null);
  const [leadershipData, setLeadershipData] = useState(null);
  const [committeeData, setCommitteeData] = useState(null);
  const [volunteerData, setVolunteerData] = useState([]);
  const [financeData, setFinanceData] = useState(null);

  // Calculate stats from people
  const stats = useMemo(() => {
    const attendingPeople = people.filter(p => p.attendanceStatus === 'attending');
    const shirtOnlyPeople = people.filter(p => p.attendanceStatus === 'shirt_only');
    const toddlers = attendingPeople.filter(p => p.ageBracket === 'Toddler');
    const attendingNonToddlers = attendingPeople.filter(p => p.ageBracket !== 'Toddler');
    const registeredAll = attendingPeople.filter(p => p.registered);
    const registeredNonToddlers = registeredAll.filter(p => p.ageBracket !== 'Toddler');
    const maxCapacity = 220;

    return {
      total: people.length,
      attendingCount: attendingPeople.length,
      shirtOnlyCount: shirtOnlyPeople.length,
      registered: registeredAll.length,
      registeredCapacity: registeredNonToddlers.length,
      toddlersCount: toddlers.length,
      preRegistered: attendingNonToddlers.filter(p => !p.registered).length,
      maxCapacity,
      slotsRemaining: maxCapacity - attendingNonToddlers.length,
      capacityPercentage: Math.round((attendingNonToddlers.length / maxCapacity) * 100)
    };
  }, [people]);

  // Load all report data
  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      const [executive, leadership, committee, volunteers, finance] = await Promise.all([
        getExecutiveSummary(people, stats),
        getLeadershipReportData(people),
        getCommitteeReportData(people, selectedDate),
        getVolunteerActivityData(),
        getFinanceReportData(people)
      ]);

      setExecutiveData(executive);
      setLeadershipData(leadership);
      setCommitteeData(committee);
      setVolunteerData(volunteers);
      setFinanceData(finance);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  }, [people, stats, selectedDate]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Update committee data when date changes
  useEffect(() => {
    const updateCommitteeData = async () => {
      const committee = await getCommitteeReportData(people, selectedDate);
      setCommitteeData(committee);
    };
    updateCommitteeData();
  }, [selectedDate, people]);

  // Export handler
  const handleExportCSV = async () => {
    try {
      const csv = await generateReportCSV(people, stats);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `anniversary-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'committee', label: 'Committee' },
    { id: 'finance', label: 'Finance' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen bg-[#f9fafa] pb-20">
      <MobileHeader
        title="Reports"
        subtitle="Event analytics"
      />

      <div className="px-4 pt-4">
        {/* Tab Selector & Export Button */}
        <div className="flex items-center gap-2 mb-4">
          {/* Tab Dropdown */}
          <div className="flex-1 relative">
            <button
              onClick={() => setShowTabDropdown(!showTabDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700"
            >
              <span>{currentTab?.label}</span>
              <ChevronDown size={16} className={`transition-transform ${showTabDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showTabDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTabDropdown(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowTabDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center px-4 py-3 bg-[#0f2a71] text-white rounded-lg"
          >
            <FileSpreadsheet size={18} />
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'summary' && executiveData && financeData && (
              <ExecutiveSummary
                data={executiveData}
                stats={stats}
                financeData={financeData}
              />
            )}
            {activeTab === 'leadership' && leadershipData && (
              <LeadershipReport
                data={leadershipData}
                stats={stats}
              />
            )}
            {activeTab === 'committee' && committeeData && (
              <CommitteeReport
                data={committeeData}
                volunteerData={volunteerData}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            )}
            {activeTab === 'finance' && financeData && (
              <FinanceReport
                data={financeData}
                people={people}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
