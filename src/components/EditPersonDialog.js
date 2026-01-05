import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, MapPin, Phone, Users as UsersIcon } from 'lucide-react';
import { capitalizeWords, formatPhoneInput, extractPhoneNumber } from '../utils/formatters';
import { updatePerson } from '../services/api';
import SuccessDialog from './SuccessDialog';
import ErrorDialog from './ErrorDialog';

export default function EditPersonDialog({ person, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    location: '',
    contactNumber: '',
    attendanceStatus: 'attending'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState({ isOpen: false, title: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ isOpen: false, title: '', message: '' });


  // Initialize form data when person changes
  useEffect(() => {
    if (person) {
      setFormData({
        firstName: person.firstName || '',
        lastName: person.lastName || '',
        age: person.age || '',
        gender: person.gender || '',
        location: person.location === 'Guest' ? 'GUEST' : person.location || '',
        contactNumber: person.contactNumber ? formatPhoneInput(person.contactNumber) : '',
        attendanceStatus: person.attendanceStatus || 'attending'
      });
    }
  }, [person]);

  // Handle mobile back button
  useEffect(() => {
    if (!isOpen) return;
    
    const handlePopState = (e) => {
      e.preventDefault();
      onClose();
    };
    
    // Push a state when dialog opens
    window.history.pushState({ editDialogOpen: true }, '');
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up: if dialog is still in history, go back
      if (window.history.state?.editDialogOpen) {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    // Auto-capitalize first letter of names
    if (field === 'firstName' || field === 'lastName') {
      processedValue = capitalizeWords(value);
    }
    
    // Format phone number as user types
    if (field === 'contactNumber') {
      processedValue = formatPhoneInput(value);
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || !person?.id) return;

    setIsLoading(true);
    
    try {
      // Prepare data with raw phone number (remove formatting)
      const dataToSave = {
        ...formData,
        contactNumber: extractPhoneNumber(formData.contactNumber)
      };
      
      const result = await updatePerson(person.id, dataToSave);
      
      if (result.success) {
        setSuccessDialog({
          isOpen: true,
          title: 'Updated!',
          message: 'Person information has been successfully updated.'
        });
        
        // Trigger refresh
        window.dispatchEvent(new Event('registrationUpdated'));
        
        // Close dialog after user acknowledges success
        // Don't auto-close - let user click OK on success dialog
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      setErrorDialog({
        isOpen: true,
        title: 'Update Failed',
        message: 'Failed to update person information. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg animate-scale-in">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#001740] to-[#0f2a71] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Person</h3>
                  <p className="text-xs text-blue-100">Update details below</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                    <User size={14} className="text-gray-400" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] transition-all ${
                      errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                    <User size={14} className="text-gray-400" />
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] transition-all ${
                      errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] transition-all ${
                      errors.age ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="25"
                    min="0"
                    max="150"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-xs mt-1">{errors.age}</p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                    <UsersIcon size={14} className="text-gray-400" />
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] bg-white transition-all"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <MapPin size={14} className="text-gray-400" />
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] bg-white transition-all ${
                    errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select</option>
                  <option value="Main">Main</option>
                  <option value="Cobol">Cobol</option>
                  <option value="Malacañang">Malacañang</option>
                  <option value="GUEST">Guest</option>
                </select>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1.5">
                  <Phone size={14} className="text-gray-400" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f2a71] transition-all"
                  placeholder="(09xx) xxx-xxxx"
                />
              </div>

              {/* Attendance Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Attendance Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange('attendanceStatus', 'attending')}
                    className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                      formData.attendanceStatus === 'attending'
                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                    }`}
                  >
                    Attending Event
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleInputChange('attendanceStatus', 'shirt_only')}
                    className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${
                      formData.attendanceStatus === 'shirt_only'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    Shirt Only
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-[#001740] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => {
          setSuccessDialog({ isOpen: false, title: '', message: '' });
          onClose(); // Close the edit dialog when success dialog is dismissed
        }}
        title={successDialog.title}
        message={successDialog.message}
      />

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, title: '', message: '' })}
        title={errorDialog.title}
        message={errorDialog.message}
      />

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.92);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
}