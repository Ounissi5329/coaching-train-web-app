import React, { useState } from 'react';
import CheckoutForm from './CheckoutForm';
import { XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const PaymentModal = ({ isOpen, onClose, data, type }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Complete Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Order Summary</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{data.title || (type === 'course' ? 'Course Enrollment' : 'Session Booking')}</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">${data.amount}</span>
            </div>
          </div>

          <CheckoutForm
            clientSecret="demo_client_secret"
            amount={data.amount}
            courseId={data.courseId}
            onEmailSuccess={() => {
              setTimeout(() => {
                onClose();
                window.location.reload();
              }, 2000);
            }}
          />
        </div>

        <div className="p-3 bg-gray-50 dark:bg-dark-700 border-t border-gray-200 dark:border-dark-600 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
            <ShieldCheckIcon className="w-3 h-3" />
            Secure payment processing
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
