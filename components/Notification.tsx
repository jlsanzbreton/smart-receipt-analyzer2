
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (onClose && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  let bgColor = 'bg-blue-500';
  let IconComponent = InformationCircleIcon;

  if (type === 'success') {
    bgColor = 'bg-green-500';
    IconComponent = CheckCircleIcon;
  } else if (type === 'error') {
    bgColor = 'bg-red-500';
    IconComponent = XCircleIcon;
  }

  return (
    <div className={`fixed top-20 right-1/2 translate-x-1/2 sm:right-5 sm:translate-x-0 p-4 rounded-md shadow-lg text-white ${bgColor} z-[100] w-11/12 sm:w-auto max-w-md transition-all duration-300 ease-in-out animate-fadeInOut`}>
      <div className="flex items-center">
        <IconComponent className="h-6 w-6 mr-3" />
        <p className="flex-grow">{message}</p>
        {onClose && (
          <button onClick={onClose} className="ml-4 text-xl font-bold hover:text-gray-200">&times;</button>
        )}
      </div>
      {/* Ensure this is a standard style tag, not <style jsx> */}
      <style>{`
        .animate-fadeInOut {
          animation: fadeIn 0.5s ease-out, fadeOut 0.5s ease-in ${duration/1000 - 0.5}s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px) translateX(50%); }
          to { opacity: 1; transform: translateY(0) translateX(50%); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0) translateX(50%); }
          to { opacity: 0; transform: translateY(-20px) translateX(50%); }
        }
        @media (min-width: 640px) { /* sm breakpoint */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px) translateX(0); }
            to { opacity: 1; transform: translateY(0) translateX(0); }
          }
          @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0) translateX(0); }
            to { opacity: 0; transform: translateY(-20px) translateX(0); }
          }
        }
      `}</style>
    </div>
  );
};
