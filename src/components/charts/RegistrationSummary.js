import React from 'react';
import { Users, CheckCircle, Clock, DollarSign, X, ShoppingBag } from 'lucide-react';

const summaryItems = [
  { 
    key: 'total', 
    label: 'Total Attendees', 
    icon: Users, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-100'
  },
  { 
    key: 'registered', 
    label: 'Checked-In', 
    icon: CheckCircle, 
    color: 'text-green-500', 
    bgColor: 'bg-green-100'
  },
  { 
    key: 'preRegistered', 
    label: 'Pending Check-in', 
    icon: Clock, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-100'
  },
  { 
    key: 'paid', 
    label: 'Paid', 
    icon: DollarSign, 
    color: 'text-green-500', 
    bgColor: 'bg-green-100'
  },
  { 
    key: 'unpaid', 
    label: 'Unpaid', 
    icon: X, 
    color: 'text-red-500', 
    bgColor: 'bg-red-100'
  },
  { 
    key: 'shirtsGiven', 
    label: 'Shirts Given', 
    icon: ShoppingBag, 
    color: 'text-green-500', 
    bgColor: 'bg-green-100'
  }
];

export default function RegistrationSummary({ stats }) {
  return (
    <div className="space-y-3">
      {summaryItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key] || 0;
        const suffix = item.key === 'paid' ? 'Paid' : 'Attendees';
        
        return (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center`}>
                <Icon size={20} className={item.color} />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{suffix}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}