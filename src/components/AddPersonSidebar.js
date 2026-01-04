import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useBackHandler } from '../hooks/useBackButton';

const customSelectStyles = `
  select.custom-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%230f2a71' d='M4 6l4 4 4-4z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px;
    padding-right: 2.5rem;
  }
  
  select.custom-select option {
    padding: 0.5rem;
  }
  
  select.custom-select option:hover {
    background-color: #f3f4f6 !important;
  }
`;


// Success Toast Component
function SuccessToast({ message, subMessage, show, onClose }) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[60] transform transition-all duration-300 ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
    >
      <div className="bg-green-600 text-white rounded-lg shadow-2xl p-4 flex items-start gap-3 min-w-[320px]">
        <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
          <Check size={16} className="text-green-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
          {subMessage && <p className="text-sm text-green-100 mt-1">{subMessage}</p>}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-green-100 transition"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

// Main AddPersonSidebar Component
export default function AddPersonSidebar({ isOpen, onClose, onPersonAdded }) {
  // Handle back button
  useBackHandler(isOpen, onClose);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    location: '',
    contactNumber: '',
    attendanceStatus: 'attending',
    shirtSize: '',
    paid: false,
    shirtGiven: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const locations = ['Main', 'Cobol', 'Malacañang', 'GUEST'];
  const genders = ['Male', 'Female'];
  const shirtSizes = ['#4 (XS) 1-2', '#6 (S) 3-4', '#8 (M) 5-6', '#10 (L) 7-8', '#12 (XL) 9-10', '#14 (2XL) 11-12', 'XS', 'S', 'M', 'L', 'XL', '2XL'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (formData.age && (isNaN(formData.age) || formData.age < 0 || formData.age > 150)) {
      newErrors.age = 'Please enter a valid age';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onPersonAdded(formData);
      setShowSuccessToast(true);
      setFormData({
        firstName: '', lastName: '', age: '', gender: '', location: '',
        contactNumber: '', attendanceStatus: 'attending', shirtSize: '', paid: false, shirtGiven: false
      });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error creating person:', error);
      alert('Failed to create person. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '', lastName: '', age: '', gender: '', location: '',
      contactNumber: '', attendanceStatus: 'attending', shirtSize: '', paid: false, shirtGiven: false
    });
    setErrors({});
    onClose();
  };

  return (
    <>
      <style>{customSelectStyles}</style>

      <SuccessToast
        message="Person added successfully!"
        subMessage={`${formData.firstName} ${formData.lastName} has been created.`}
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full z-50 w-full sm:w-3/5 md:w-2/5 lg:w-2/5 bg-white shadow-2xl border-l border-gray-200 transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add New Person</h3>
            <div className="mt-1 text-sm text-gray-500">Create a new account</div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-auto h-full">
          <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-semibold text-[#001740] mb-4">
              Personal Information
            </h3>
            
            <div className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition ${
  errors.firstName ? 'border-red-500' : 'border-gray-200'
}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition ${
  errors.firstName ? 'border-red-500' : 'border-gray-200'
}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Age and Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition ${
  errors.firstName ? 'border-red-500' : 'border-gray-200'
}`}
                    placeholder="Age"
                    min="0"
                    max="150"
                  />
                  {errors.age && (
                    <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="custom-select w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition bg-white"
                  >
                    <option value="">Select gender</option>
                    {genders.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div>
            <h3 className="text-sm font-semibold text-[#001740] mb-4">
              Contact & Location
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="custom-select w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition bg-white"
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc === 'GUEST' ? 'Guest' : loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  className="custom-select w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition bg-white"
                  placeholder="Enter contact number"
                />
              </div>
              </div>
              </div>

              {/* Attendance Status */}
              <div>
                <h3 className="text-sm font-semibold text-[#001740] mb-4">
                  Attendance Status
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-blue-50"
                    style={{
                      borderColor: formData.attendanceStatus === 'attending' ? '#0f2a71' : '#e5e7eb',
                      backgroundColor: formData.attendanceStatus === 'attending' ? '#eff6ff' : 'white'
                    }}
                  >
                    <input 
                      type="radio" 
                      value="attending"
                      checked={formData.attendanceStatus === 'attending'}
                      onChange={(e) => handleInputChange('attendanceStatus', e.target.value)}
                      className="w-4 h-4 accent-[#0f2a71]"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">Attending Event</span>
                      <p className="text-xs text-gray-500 mt-0.5">Will attend the anniversary celebration</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition hover:bg-purple-50"
                    style={{
                      borderColor: formData.attendanceStatus === 'shirt_only' ? '#9333ea' : '#e5e7eb',
                      backgroundColor: formData.attendanceStatus === 'shirt_only' ? '#faf5ff' : 'white'
                    }}
                  >
                    <input 
                      type="radio" 
                      value="shirt_only"
                      checked={formData.attendanceStatus === 'shirt_only'}
                      onChange={(e) => handleInputChange('attendanceStatus', e.target.value)}
                      className="w-4 h-4 accent-purple-600"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">Shirt Order Only</span>
                      <p className="text-xs text-gray-500 mt-0.5">Not attending, ordering shirt only</p>
                    </div>
                  </label>
                </div>
                
                {/* Info message for shirt-only */}
                {formData.attendanceStatus === 'shirt_only' && (
                  <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs text-purple-800">
                      <span className="font-semibold">Note:</span> This person won't be counted toward the 230 event capacity but will be included in shirt order counts.
                    </p>
                  </div>
                )}
              </div>

              {/* Shirt Details */}
              <div>
          </div>

          {/* Shirt Details */}
          <div>
            <h3 className="text-sm font-semibold text-[#001740] mb-4">
              Shirt Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shirt Size</label>
                <select
                  value={formData.shirtSize}
                  onChange={(e) => handleInputChange('shirtSize', e.target.value)}
                  className="custom-select w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2a71] focus:border-[#0f2a71] transition bg-white"
                >
                  <option value="">Select size</option>
                  {shirtSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              {/* Payment Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Payment Status</span>
                <div className="flex items-center gap-4">
                  <button
                  type="button"
                  onClick={() => handleInputChange('paid', !formData.paid)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.paid ? 'bg-[#0f2a71]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.paid ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                  <span className={`text-sm font-medium ${formData.paid ? 'text-[#0f2a71]' : 'text-gray-500'}`}>
                    {formData.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>

              {/* Distribution Status Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Distribution</span>
                <div className="flex items-center gap-4">
                  <button
                  type="button"
                  onClick={() => handleInputChange('shirtGiven', !formData.shirtGiven)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.shirtGiven ? 'bg-[#0f2a71]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.shirtGiven ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                  <span className={`text-sm font-medium ${formData.shirtGiven ? 'text-[#0f2a71]' : 'text-gray-500'}`}>
                    {formData.shirtGiven ? 'Given' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#001740] hover:bg-[#0f2a71] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <Check size={20} />
                Create Person
              </>
            )}
          </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export { SuccessToast };