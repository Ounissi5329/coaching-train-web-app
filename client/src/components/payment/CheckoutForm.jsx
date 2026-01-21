import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { paymentAPI } from '../../services/api';
import { CreditCardIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const CheckoutForm = ({ clientSecret, onEmailSuccess, amount, courseId }) => {
  const [processing, setProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4);
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 13) {
      newErrors.number = 'Please enter a valid card number';
    }

    if (!cardDetails.expiry || !/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
      newErrors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC';
    }

    if (!cardDetails.name.trim()) {
      newErrors.name = 'Please enter the cardholder name';
    }

    if (!cardDetails.email || !/\S+@\S+\.\S+/.test(cardDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!cardDetails.zipCode.trim()) {
      newErrors.zipCode = 'Please enter a ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // For demo purposes, always simulate success
        // In a real app, this would call your payment processor
        await paymentAPI.confirmPayment({
          paymentIntentId: 'demo_' + Date.now(),
          amount: amount,
          cardDetails: {
            last4: cardDetails.number.slice(-4),
            brand: 'visa' // You could detect this from the card number
          },
          type: 'course',
          courseId: courseId
        });

        toast.success(`Payment successful! Please wait for confirmation before accessing the course.`);
        onEmailSuccess();
      } catch (error) {
        console.error('Confirmation error:', error);
        toast.error('Payment succeeded but failed to update status. Please contact support.');
      } finally {
        setProcessing(false);
      }
    }, 2000); // 2 second delay to simulate processing
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Demo Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-3">
        <p className="text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <ShieldCheckIcon className="w-3 h-3" />
          Demo Payment - All payments approved
        </p>
      </div>
      {/* Card Number */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardDetails.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder="1234 5678 9012 3456"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
              errors.number ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength="19"
          />
          <CreditCardIcon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use any 16-digit number for testing</p>
        {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
      </div>

      {/* Expiry and CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            value={cardDetails.expiry}
            onChange={(e) => handleInputChange('expiry', e.target.value)}
            placeholder="MM/YY"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
              errors.expiry ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength="5"
          />
          {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use any future date (e.g., 12/25)</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            CVC
          </label>
          <input
            type="text"
            value={cardDetails.cvc}
            onChange={(e) => handleInputChange('cvc', e.target.value)}
            placeholder="123"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
              errors.cvc ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength="4"
          />
          {errors.cvc && <p className="text-red-500 text-sm mt-1">{errors.cvc}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use any 3-digit number</p>
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardDetails.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="John Doe"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={cardDetails.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="john@example.com"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* ZIP Code */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          ZIP Code
        </label>
        <input
          type="text"
          value={cardDetails.zipCode}
          onChange={(e) => handleInputChange('zipCode', e.target.value)}
          placeholder="12345"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-100 ${
            errors.zipCode ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
      </div>

      {/* Payment Button */}
      <button
        type="submit"
        disabled={processing}
        className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-400 dark:disabled:bg-dark-600 transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <LockClosedIcon className="w-5 h-5" />
            Pay ${amount}
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <LockClosedIcon className="w-4 h-4" />
        <span>Your payment information is secure</span>
      </div>
    </form>
  );
};

export default CheckoutForm;
