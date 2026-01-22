import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';

const CountdownTimer = () => {
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await settingsAPI.getSettings('countdown_timer');
        setSettings(response.data.value);
      } catch (error) {
        console.error('Error fetching countdown settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings || !settings.isActive) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(settings.targetDate) - +new Date();
      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings]);

  if (loading || !settings || !settings.isActive) return null;

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] === undefined) return;

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center mx-2">
        <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
          {timeLeft[interval].toString().padStart(2, '0')}
        </span>
        <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {interval}
        </span>
      </div>
    );
  });

  return (
    <div className="bg-primary-50/95 dark:bg-dark-800/95 backdrop-blur-sm border-b border-primary-100 dark:border-dark-700 py-3 px-4 shadow-sm sticky top-16 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </span>
          <h3 className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
            {settings.eventName} starts in:
          </h3>
        </div>
        
        <div className="flex items-center">
          {timerComponents.length ? timerComponents : (
            <span className="text-primary-600 dark:text-primary-400 font-bold">Event has started!</span>
          )}
        </div>

        <button className="mt-2 md:mt-0 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-full transition-colors shadow-sm shadow-primary-900/20">
          Join Now
        </button>
      </div>
    </div>
  );
};

export default CountdownTimer;