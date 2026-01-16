import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../Header';
import ExecutiveSummary from './ExecutiveSummary';
import LeadershipReport from './LeadershipReport';
import CommitteeReport from './CommitteeReport';
import FinanceReport from './FinanceReport';
import { FileSpreadsheet, Printer } from 'lucide-react';
import {
  getLeadershipReportData,
  getCommitteeReportData,
  getVolunteerActivityData,
  getFinanceReportData,
  getExecutiveSummary,
  generateReportCSV
} from '../../services/reportService';

export default function ReportsView({ people = [] }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
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
    const maxCapacity = 230;

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

  // Export handlers
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

  // Generate professional print content based on active tab
  const generatePrintContent = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Common header for all reports
    const header = `
      <div class="report-header">
        <div class="org-name">FFSC 20th Anniversary</div>
        <h1 class="report-title">${activeTab === 'summary' ? 'Executive Summary Report' :
          activeTab === 'leadership' ? 'Leadership Demographics Report' :
          activeTab === 'committee' ? 'Committee Operations Report' : 'Financial Report'}</h1>
        <div class="report-meta">
          <span>Generated: ${currentDate} at ${currentTime}</span>
        </div>
      </div>
    `;

    // Generate content based on active tab
    let content = '';

    if (activeTab === 'summary' && executiveData && financeData) {
      content = `
        <section class="section">
          <h2 class="section-title">Key Performance Indicators</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th class="text-right">Value</th>
                <th class="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Event Attendance</td>
                <td class="text-right">${stats.registered} / ${stats.maxCapacity}</td>
                <td class="text-right">${stats.capacityPercentage}% capacity</td>
              </tr>
              <tr>
                <td>Pending Check-ins</td>
                <td class="text-right">${stats.preRegistered}</td>
                <td class="text-right">Awaiting</td>
              </tr>
              <tr>
                <td>Total Registrations</td>
                <td class="text-right">${stats.total}</td>
                <td class="text-right">-</td>
              </tr>
              <tr>
                <td>Shirt Only Registrations</td>
                <td class="text-right">${stats.shirtOnlyCount}</td>
                <td class="text-right">-</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Financial Overview</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-right">Amount (PHP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pledges Received</td>
                <td class="text-right">${(financeData.income.pledges.received || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Collected Shirt Payments</td>
                <td class="text-right">${(financeData.income.shirtSales.collected || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Other Funds</td>
                <td class="text-right">${(financeData.income.other || 0).toLocaleString()}</td>
              </tr>
              <tr class="total-row highlight-green">
                <td><strong>Total Funds</strong></td>
                <td class="text-right"><strong>${financeData.income.totalReceived.toLocaleString()}</strong></td>
              </tr>
              <tr class="total-row highlight-red">
                <td><strong>Total Expenses</strong></td>
                <td class="text-right"><strong>${financeData.expenses.total.toLocaleString()}</strong></td>
              </tr>
              <tr class="total-row ${financeData.netBalance >= 0 ? 'highlight-green' : 'highlight-red'}">
                <td><strong>Net Balance</strong></td>
                <td class="text-right"><strong>${financeData.netBalance >= 0 ? '' : '('}${Math.abs(financeData.netBalance).toLocaleString()}${financeData.netBalance >= 0 ? '' : ')'}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Capacity Status</h2>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(stats.capacityPercentage, 100)}%"></div>
            </div>
            <div class="progress-labels">
              <span>0</span>
              <span>${stats.registered} checked in (${stats.capacityPercentage}%)</span>
              <span>${stats.maxCapacity}</span>
            </div>
          </div>
        </section>
      `;
    } else if (activeTab === 'leadership' && leadershipData) {
      content = `
        <section class="section">
          <h2 class="section-title">Age Distribution</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Age Bracket</th>
                <th class="text-right">Count</th>
                <th class="text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${leadershipData.ageBrackets.map(b => `
                <tr>
                  <td>${b.name}</td>
                  <td class="text-right">${b.value}</td>
                  <td class="text-right">${leadershipData.totalPeople > 0 ? ((b.value / leadershipData.totalPeople) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td class="text-right"><strong>${leadershipData.totalPeople}</strong></td>
                <td class="text-right"><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Gender Distribution</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Gender</th>
                <th class="text-right">Total</th>
                <th class="text-right">Registered</th>
                <th class="text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              ${leadershipData.genderBreakdown.map(g => `
                <tr>
                  <td>${g.gender}</td>
                  <td class="text-right">${g.total}</td>
                  <td class="text-right">${g.registered}</td>
                  <td class="text-right">${g.preRegistered}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Location Distribution</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Location</th>
                <th class="text-right">Total</th>
                <th class="text-right">Registered</th>
                <th class="text-right">Pending</th>
              </tr>
            </thead>
            <tbody>
              ${leadershipData.locationBreakdown.map(l => `
                <tr>
                  <td>${l.location}</td>
                  <td class="text-right">${l.total}</td>
                  <td class="text-right">${l.registered}</td>
                  <td class="text-right">${l.preRegistered}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      `;
    } else if (activeTab === 'committee' && committeeData) {
      content = `
        <section class="section">
          <h2 class="section-title">Registration Summary - ${committeeData.selectedDate}</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th class="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Registrations (Selected Date)</td>
                <td class="text-right">${committeeData.totalRegistrations}</td>
              </tr>
              <tr>
                <td>Peak Hour</td>
                <td class="text-right">${committeeData.peakHour.hour || 'N/A'}</td>
              </tr>
              <tr>
                <td>Peak Hour Registrations</td>
                <td class="text-right">${committeeData.peakHour.count || 0}</td>
              </tr>
              <tr>
                <td>Active Volunteers</td>
                <td class="text-right">${volunteerData.length}</td>
              </tr>
            </tbody>
          </table>
        </section>

        ${committeeData.hourlyData.filter(h => h.checkedIn > 0).length > 0 ? `
        <section class="section">
          <h2 class="section-title">Hourly Registration Breakdown</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th class="text-right">Check-ins</th>
                <th class="text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${committeeData.hourlyData.filter(h => h.checkedIn > 0).map(h => `
                <tr${h.time === committeeData.peakHour.hour ? ' class="highlight-row"' : ''}>
                  <td>${h.time}${h.time === committeeData.peakHour.hour ? ' (Peak)' : ''}</td>
                  <td class="text-right">${h.checkedIn}</td>
                  <td class="text-right">${committeeData.totalRegistrations > 0 ? ((h.checkedIn / committeeData.totalRegistrations) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
        ` : ''}

        ${volunteerData.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Volunteer Activity</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Volunteer Name</th>
                <th class="text-right">Registrations Processed</th>
              </tr>
            </thead>
            <tbody>
              ${volunteerData.map(v => `
                <tr>
                  <td>${v.name}</td>
                  <td class="text-right">${v.count}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td><strong>Total</strong></td>
                <td class="text-right"><strong>${volunteerData.reduce((sum, v) => sum + v.count, 0)}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>
        ` : ''}
      `;
    } else if (activeTab === 'finance' && financeData) {
      content = `
        <section class="section">
          <h2 class="section-title">Funds Summary</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Source</th>
                <th class="text-right">Amount (PHP)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pledges Received</td>
                <td class="text-right">${(financeData.income.pledges.received || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Collected Shirt Payments</td>
                <td class="text-right">${(financeData.income.shirtSales.collected || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Other Funds</td>
                <td class="text-right">${(financeData.income.other || 0).toLocaleString()}</td>
              </tr>
              <tr class="total-row highlight-green">
                <td><strong>Total Funds Received</strong></td>
                <td class="text-right"><strong>${financeData.income.totalReceived.toLocaleString()}</strong></td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Pledge Details</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th class="text-right">Amount / Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Pledged</td>
                <td class="text-right">PHP ${(financeData.income.pledges.total || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Received</td>
                <td class="text-right">PHP ${(financeData.income.pledges.received || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pending</td>
                <td class="text-right">PHP ${((financeData.income.pledges.total || 0) - (financeData.income.pledges.received || 0)).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Fulfillment Rate</td>
                <td class="text-right">${financeData.income.pledges.total > 0 ? ((financeData.income.pledges.received / financeData.income.pledges.total) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="section">
          <h2 class="section-title">Shirt Payment Details</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th class="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Orders</td>
                <td class="text-right">${financeData.income.shirtSales.totalOrders || 0}</td>
              </tr>
              <tr>
                <td>Total Expected</td>
                <td class="text-right">PHP ${(financeData.income.shirtSales.totalExpected || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Collected</td>
                <td class="text-right">PHP ${(financeData.income.shirtSales.collected || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pending Collection</td>
                <td class="text-right">PHP ${(financeData.income.shirtSales.pending || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Paid / Unpaid</td>
                <td class="text-right">${financeData.income.shirtSales.paidCount || 0} / ${financeData.income.shirtSales.unpaidCount || 0}</td>
              </tr>
            </tbody>
          </table>
        </section>

        ${financeData.expenses.byCategory.length > 0 ? `
        <section class="section">
          <h2 class="section-title">Expenses by Category (Detailed)</h2>
          ${financeData.expenses.byCategory.map(c => `
            <div class="category-section">
              <h3 class="category-header">${c.name}</h3>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody>
                  ${(c.items || []).map(item => `
                    <tr>
                      <td>${item.description}</td>
                      <td class="text-right">${item.amount.toLocaleString()}</td>
                    </tr>
                  `).join('')}
                  <tr class="subtotal-row">
                    <td><strong>Subtotal - ${c.name}</strong></td>
                    <td class="text-right"><strong>${c.amount.toLocaleString()}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          `).join('')}
          <table class="data-table" style="margin-top: 15px;">
            <tr class="total-row highlight-red">
              <td><strong>TOTAL EXPENSES</strong></td>
              <td class="text-right"><strong>PHP ${financeData.expenses.total.toLocaleString()}</strong></td>
            </tr>
          </table>
        </section>
        ` : ''}

        <section class="section summary-box ${financeData.netBalance >= 0 ? 'surplus' : 'deficit'}">
          <h2 class="section-title">Net Balance Summary</h2>
          <table class="summary-table">
            <tr>
              <td>Total Funds</td>
              <td class="text-right positive">+ PHP ${financeData.income.totalReceived.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td class="text-right negative">- PHP ${financeData.expenses.total.toLocaleString()}</td>
            </tr>
            <tr class="net-row">
              <td><strong>Net Balance</strong></td>
              <td class="text-right ${financeData.netBalance >= 0 ? 'positive' : 'negative'}">
                <strong>PHP ${Math.abs(financeData.netBalance).toLocaleString()} ${financeData.netBalance < 0 ? '(Deficit)' : '(Surplus)'}</strong>
              </td>
            </tr>
          </table>
        </section>
      `;
    }

    // Footer
    const footer = `
      <div class="report-footer">
        <p>This is a computer-generated report. For questions, please contact the event committee.</p>
        <p class="confidential">CONFIDENTIAL - For internal use only</p>
      </div>
    `;

    return header + content + footer;
  };

  const handlePrint = () => {
    // Create an iframe for printing (invisible, no extra window)
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-10000px';
    printFrame.style.left = '-10000px';
    document.body.appendChild(printFrame);

    const printContent = generatePrintContent();

    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Anniversary Event Report</title>
          <style>
            @page {
              size: A4;
              margin: 1in 0.75in;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #000;
              background: #fff;
            }
            .report-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 15px;
              border-bottom: 2px solid #000;
            }
            .org-name {
              font-size: 14pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 8px;
            }
            .report-title {
              font-size: 18pt;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .report-meta {
              font-size: 10pt;
              color: #444;
            }
            .section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 12px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ccc;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 10px;
            }
            .data-table th,
            .data-table td {
              padding: 8px 12px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table th {
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 10pt;
            }
            .data-table td {
              font-size: 10pt;
            }
            .data-table .text-right {
              text-align: right;
            }
            .data-table .total-row {
              background-color: #f9f9f9;
              font-weight: 500;
            }
            .data-table .total-row td {
              border-top: 2px solid #999;
            }
            .data-table .highlight-green td {
              background-color: #e8f5e9;
            }
            .data-table .highlight-red td {
              background-color: #ffebee;
            }
            .data-table .highlight-row {
              background-color: #fff3e0;
            }
            .data-table .subtotal-row {
              background-color: #f5f5f5;
            }
            .data-table .subtotal-row td {
              border-top: 1px solid #999;
            }
            .category-section {
              margin-bottom: 20px;
            }
            .category-header {
              font-size: 11pt;
              font-weight: bold;
              margin-bottom: 8px;
              padding: 6px 10px;
              background-color: #f0f0f0;
              border-left: 4px solid #0f2a71;
            }
            .progress-container {
              margin: 15px 0;
            }
            .progress-bar {
              height: 20px;
              background-color: #e0e0e0;
              border: 1px solid #ccc;
              position: relative;
            }
            .progress-fill {
              height: 100%;
              background-color: #4caf50;
              transition: width 0.3s;
            }
            .progress-labels {
              display: flex;
              justify-content: space-between;
              margin-top: 5px;
              font-size: 9pt;
              color: #666;
            }
            .summary-box {
              padding: 15px;
              border: 2px solid #000;
              margin-top: 20px;
            }
            .summary-box.surplus {
              border-color: #2e7d32;
              background-color: #e8f5e9;
            }
            .summary-box.deficit {
              border-color: #c62828;
              background-color: #ffebee;
            }
            .summary-table {
              width: 100%;
            }
            .summary-table td {
              padding: 8px 0;
              font-size: 11pt;
            }
            .summary-table .text-right {
              text-align: right;
            }
            .summary-table .positive {
              color: #2e7d32;
            }
            .summary-table .negative {
              color: #c62828;
            }
            .summary-table .net-row td {
              border-top: 2px solid #000;
              padding-top: 12px;
              font-size: 12pt;
            }
            .report-footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 1px solid #ccc;
              font-size: 9pt;
              color: #666;
              text-align: center;
            }
            .report-footer .confidential {
              margin-top: 10px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `;

    const frameDoc = printFrame.contentWindow || printFrame.contentDocument;
    const doc = frameDoc.document || frameDoc;
    doc.open();
    doc.write(printDocument);
    doc.close();

    // Wait for content to load then print
    printFrame.onload = () => {
      setTimeout(() => {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      }, 250);
    };
  };

  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'committee', label: 'Committee' },
    { id: 'finance', label: 'Finance' }
  ];

  return (
    <>
      <Header viewTitle="Reports" showSearch={false} />

      <div className="p-6 bg-[#f9fafa] min-h-screen print:p-0 print:bg-white">
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-[#001740]">Anniversary Event Reports</h1>
            <p className="text-sm text-gray-600 mt-1">Comprehensive event analytics and financial overview</p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileSpreadsheet size={16} />
              Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f2a71] text-white rounded-lg text-sm font-medium hover:bg-[#0d2461] transition-colors"
            >
              <Printer size={16} />
              Print Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 print:hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#0f2a71] text-[#0f2a71]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0f2a71]"></div>
          </div>
        ) : (
          <div id="report-print-area">
            {/* Print Header - Only visible when printing */}
            <div className="hidden print:block mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Anniversary Event Report</h1>
              <p className="text-sm text-gray-600">Generated: {new Date().toLocaleString()}</p>
            </div>

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

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide everything by default */
          body > * {
            display: none !important;
          }

          /* Show only the root app container */
          #root {
            display: block !important;
          }

          /* Hide sidebar, header, and navigation */
          nav,
          header,
          .fixed,
          [class*="sidebar"],
          [class*="Sidebar"],
          .md\\:translate-x-0 {
            display: none !important;
          }

          /* Hide non-print elements */
          .print\\:hidden {
            display: none !important;
          }

          /* Show print elements */
          .print\\:block {
            display: block !important;
          }

          /* Make sure the report area is visible and properly positioned */
          #report-print-area {
            display: block !important;
            visibility: visible !important;
            position: relative !important;
            width: 100% !important;
            padding: 0 !important;
          }

          #report-print-area * {
            visibility: visible !important;
          }

          /* Ensure proper backgrounds for colored elements */
          .bg-white,
          [class*="bg-green"],
          [class*="bg-red"],
          [class*="bg-blue"],
          [class*="bg-yellow"],
          [class*="bg-purple"],
          [class*="bg-gray"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Page settings */
          @page {
            margin: 0.5in;
            size: portrait;
          }

          /* Remove margins from container */
          .p-6 {
            padding: 0 !important;
          }

          /* Ensure charts don't break across pages */
          .recharts-wrapper {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
