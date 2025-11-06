// HRDonna.jsx
import React from "react";

export default function HRDonna() {
  return (
    <div className="h-full w-full flex items-start justify-start p-8">
      {/* Use the full white space; control your own max width if desired */}
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900">HR Donna</h1>
        <p className="mt-4 text-gray-600">This is the HR Donna page.</p>
        {/* add whatever you want here; it will live ONLY in the white section */}
      </div>
    </div>
  );
}