import React from 'react';
import { Truck } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading DeliTrack...' }) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative flex items-center justify-center mb-4">
        {/* Outer glowing pulsing ring */}
        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
        {/* Inner brand truck */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Truck className="w-6 h-6 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 tracking-wide">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
