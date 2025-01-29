import React from 'react';

interface CircularProgressProps {
  percentage: number;
  icon: React.ElementType;
  value: number;
  label: string; // Add a label prop for additional context
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, icon: Icon, value, label }) => (
  <div className="flex items-center gap-4">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle
          className="stroke-gray-200"
          strokeWidth="10"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <circle
          className="stroke-green-500 transition-all duration-1000"
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          style={{
            strokeDasharray: `${2 * Math.PI * 45}`,
            strokeDashoffset: `${2 * Math.PI * 45 * (1 - percentage / 100)}`,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-8 h-8 text-gray-600" />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-2xl font-bold text-gray-700">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  </div>
);

export default CircularProgress;
