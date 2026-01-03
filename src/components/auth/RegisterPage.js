import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, verifyRegistrationCode } from '../../services/supabase';
import { UserPlus, Lock } from 'lucide-react';
import SuccessDialog from '../SuccessDialog';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'secretCode' ? value.toUpperCase() : value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify secret code
      if (formData.secretCode !== 'FFSC2026') {
        setError('Invalid registration code. Please contact an administrator.');
        setLoading(false);
        return;
      }

      // Step 2: Create user account
      const { data, error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (signUpError) {
        setError(signUpError.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      if (data?.user) {
        setLoading(false);
        setShowSuccess(true);
      } else {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/church-logo.svg" 
              alt="FFSC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">FFSC Anniversary Management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Dela Cruz"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your.email@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <div className="pt-2 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Lock size={16} />
              Registration Code
            </label>
            <input
              type="text"
              name="secretCode"
              value={formData.secretCode}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center tracking-wider"
              placeholder="XXXX-XXXX"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1 text-center">
              Ask an administrator for the registration code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate('/login');
        }}
        title="Account Created!"
        message="Please check your email to confirm your account before signing in."
        buttonText="Go to Sign In"
      />
    </div>
  );
}