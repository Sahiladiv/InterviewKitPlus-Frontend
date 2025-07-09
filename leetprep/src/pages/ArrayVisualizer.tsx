// src/components/ArrayVisualizer.tsx
import React from 'react';

interface ArrayVisualizerProps {
  array: number[];
}

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = ({ array }) => {
  return (
    <div className="flex gap-3 mt-6 flex-wrap">
      {array.map((value, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-sm text-gray-500 mb-1">i={index}</div>
          <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-700 font-semibold border border-blue-400 rounded">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArrayVisualizer;
