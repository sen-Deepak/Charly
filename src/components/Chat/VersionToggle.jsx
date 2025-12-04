import React, { useState, useEffect } from 'react';

export default function VersionToggle({ version = 'v1', onVersionChange }) {
  const [isV2, setIsV2] = useState(version === 'v2');

  useEffect(() => {
    setIsV2(version === 'v2');
  }, [version]);

  const handleToggle = () => {
    const newVersion = isV2 ? 'v1' : 'v2';
    setIsV2(!isV2);
    onVersionChange(newVersion);
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium transition-colors duration-300 ${isV2 ? 'text-gray-400' : 'text-primary'}`}>
        v1
      </span>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
          isV2 ? 'bg-secondary' : 'bg-gray-300'
        }`}
        title={`Switch to ${isV2 ? 'v1' : 'v2'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${
            isV2 ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className={`text-xs font-medium transition-colors duration-300 ${!isV2 ? 'text-gray-400' : 'text-secondary'}`}>
        v2
      </span>
    </div>
  );
}
