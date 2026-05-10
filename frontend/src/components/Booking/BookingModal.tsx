import React, { useState } from 'react';
import { Calendar, User, Phone, Mail, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    _id: string;
    title: string;
    pricing: {
      pricePerMonth: number;
      securityDeposit: number;
    };
    owner: {
      _id: string;
      fullName: string;
      email: string;
      phone: string;
    };
  };
}

interface BookingData {
  startDate: string;
  endDate: string;
  tenantInfo: {
    fullName: string;
    email: string;
    phone: string;
    idNumber?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  specialRequests?: string;
  agreeToTerms: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, property }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    startDate: '',
    endDate: '',
    tenantInfo: {
      fullName: '',
      email: '',
      phone: '',
      idNumber: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      }
    },
    specialRequests: '',
    agreeToTerms: false
  });

  const calculateTotalCost = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    return (months * property.pricing.pricePerMonth) + property.pricing.securityDeposit;
  };

  const validateStep1 = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select start and end dates');
      return false;
    }
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const today = new Date();
    
    if (start <= today) {
      toast.error('Start date must be in the future');
      return false;
    }
    
    if (end <= start) {
      toast.error('End date must be after start date');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    const { tenantInfo } = bookingData;
    
    if (!tenantInfo.fullName.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    
    if (!tenantInfo.email.trim() || !tenantInfo.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    if (!tenantInfo.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2 as 1 | 2 | 3);
    } else if (step === 2 && validateStep2()) {
      setStep(3 as 1 | 2 | 3);
    }
  };

  const handleBack = () => {
    setStep((step - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async () => {
    if (!bookingData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    try {
      const bookingPayload = {
        property: property._id,
        owner: property.owner._id,
        ...bookingData,
        totalCost: calculateTotalCost()
      };

      const response = await api.post('/bookings', bookingPayload);
      
      if (response.data.success) {
        toast.success('Booking request submitted successfully!');
        onClose();
        // Redirect to payment page
        window.location.href = `/payments/booking/${response.data.data._id}`;
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to submit booking request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Book Property</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNum ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Dates</span>
            <span>Information</span>
            <span>Review</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Step 1: Dates */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Rental Period</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                      className="input-field w-full"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.endDate}
                      onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                      className="input-field w-full"
                      min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>

              {/* Property Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Property Details</h4>
                <p className="text-sm text-gray-700">{property.title}</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Monthly Rent: ETB {property.pricing.pricePerMonth.toLocaleString()}</p>
                  <p>Security Deposit: ETB {property.pricing.securityDeposit.toLocaleString()}</p>
                  {bookingData.startDate && bookingData.endDate && (
                    <p className="font-medium text-primary">
                      Total Cost: ETB {calculateTotalCost().toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Tenant Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={bookingData.tenantInfo.fullName}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        tenantInfo: { ...bookingData.tenantInfo, fullName: e.target.value }
                      })}
                      className="input-field w-full"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={bookingData.tenantInfo.email}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        tenantInfo: { ...bookingData.tenantInfo, email: e.target.value }
                      })}
                      className="input-field w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={bookingData.tenantInfo.phone}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        tenantInfo: { ...bookingData.tenantInfo, phone: e.target.value }
                      })}
                      className="input-field w-full"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={bookingData.tenantInfo.idNumber}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        tenantInfo: { ...bookingData.tenantInfo, idNumber: e.target.value }
                      })}
                      className="input-field w-full"
                      placeholder="National ID or Passport number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <textarea
                      value={bookingData.specialRequests}
                      onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                      className="input-field w-full min-h-[100px] resize-y"
                      placeholder="Any special requirements or requests..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review and Confirm */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Booking</h3>
                
                {/* Booking Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Property</h4>
                    <p className="text-sm text-gray-700">{property.title}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Rental Period</h4>
                    <p className="text-sm text-gray-700">
                      {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Your Information</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{bookingData.tenantInfo.fullName}</p>
                      <p>{bookingData.tenantInfo.email}</p>
                      <p>{bookingData.tenantInfo.phone}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Monthly Rent ({Math.ceil((new Date(bookingData.endDate).getTime() - new Date(bookingData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months)</span>
                        <span>ETB {property.pricing.pricePerMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Security Deposit</span>
                        <span>ETB {property.pricing.securityDeposit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total Cost</span>
                        <span className="text-primary">ETB {calculateTotalCost().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <h4 className="font-medium mb-2">Important Information</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Security deposit is refundable upon property inspection</li>
                        <li>First month's rent is due upon move-in</li>
                        <li>Cancellation policy applies as per terms</li>
                        <li>Property owner will contact you within 24 hours</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={bookingData.agreeToTerms}
                    onChange={(e) => setBookingData({ ...bookingData, agreeToTerms: e.target.checked })}
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-700">
                    I agree to the terms and conditions and understand that this is a booking request subject to approval by the property owner.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={step === 1 ? onClose : handleBack}
              className="btn-secondary"
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                step === 3 ? 'Submit Booking' : 'Next'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
