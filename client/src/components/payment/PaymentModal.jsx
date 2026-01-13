import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import { paymentAPI } from '../../services/api';
import { XMarkIcon } from '@heroicons/react/24/outline';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentModal = ({ isOpen, onClose, data, type }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && (data.bookingId || data.courseId)) {
      const getIntent = async () => {
        try {
          const response = await paymentAPI.createPaymentIntent(data);
          setClientSecret(response.data.clientSecret);
          setLoading(false);
        } catch (error) {
          console.error('Error creating payment intent:', error);
          setLoading(false);
        }
      };
      getIntent();
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Order Summary</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-gray-700 font-medium">{data.title || (type === 'course' ? 'Course Enrollment' : 'Session Booking')}</span>
              <span className="text-xl font-bold text-gray-900">${data.amount}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                clientSecret={clientSecret} 
                amount={data.amount} 
                onEmailSuccess={() => {
                  setTimeout(() => {
                    onClose();
                    window.location.reload();
                  }, 2000);
                }} 
              />
            </Elements>
          ) : (
            <p className="text-center text-red-500 py-4">Failed to initialize payment. Please try again.</p>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
