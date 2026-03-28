import React, { useState } from 'react';
import { Star, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../utils/api';

const PremiumUpgrade: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const simulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(async () => {
      try {
        await api.post('/premium/upgrade', { phoneNumber, amount: 500 });
        setSuccess(true);
      } catch (err) {
        console.error('Payment simulation failed', err);
      } finally {
        setLoading(false);
      }
    }, 2000); // simulate 2 second m-pesa delay
  };

  if (success) {
    return (
      <div className="pb-24 pt-12 px-4 max-w-xl mx-auto text-center animate-fade-in">
        <div className="h-24 w-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Payment Successful!</h2>
        <p className="text-textSecondary mb-8 text-lg">
          You are now a Premium Owner. Enjoy unlimited listings and priority placements.
        </p>
        <button onClick={() => window.location.href = '/owner'} className="btn-primary w-full">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 md:px-8 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold mb-2 text-center">Upgrade to Premium</h2>
      <p className="text-textSecondary text-center mb-10 max-w-xl mx-auto">
        Unlock the full potential of your property rental business with unlimited listings and premium features.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Features Card */}
        <div className="flex-1 bg-surface border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6 flex-col sm:flex-row">
            <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Premium Plan</h3>
              <p className="text-textSecondary font-medium">KES 500 / month</p>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 text-lg">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <span>Unlimited Property Listings</span>
            </li>
            <li className="flex gap-3 text-lg">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <span>Featured placement in Search</span>
            </li>
            <li className="flex gap-3 text-lg">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <span>Verified Host Badge</span>
            </li>
            <li className="flex gap-3 text-lg">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <span>Advanced Analytics Dashboard</span>
            </li>
          </ul>
        </div>

        {/* Payment Form */}
        <div className="flex-1 bg-white border border-border rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold mb-6 text-center">M-Pesa Payment</h3>
          
          <form onSubmit={simulatePayment}>
            <div className="mb-6">
              <label className="block font-semibold mb-2">M-Pesa Phone Number</label>
              <input 
                type="text" 
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="input-field text-lg tracking-wide bg-gray-50 border-gray-300"
                required
              />
              <p className="text-xs text-textSecondary mt-2 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Secure payment simulation
              </p>
            </div>

            <div className="bg-surface p-4 rounded-xl mb-8 flex justify-between items-center">
              <span className="font-semibold text-textSecondary">Total Amount</span>
              <span className="text-2xl font-bold">KES 500</span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-75 transition-colors shadow-green-600/30 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" /> Processing Payment...
                </>
              ) : 'Secure Checkout'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PremiumUpgrade;
