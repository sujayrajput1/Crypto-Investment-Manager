import React from 'react';

const PieChart = ({ data, title, size = 200 }) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EAB308', '#34D399'];
  
  const calculatePercentage = (value) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return ((value / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => (
            <g key={index}>
              <path
                d={`M 50,50 L ${50 + (50 * Math.cos(2 * Math.PI * index / data.length))} A 50,50 L 50`}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
              <text
                x={50 + (50 * Math.cos(2 * Math.PI * index / data.length)) * 0.7}
                y={50 + (50 * Math.sin(2 * Math.PI * index / data.length)) * 0.7}
                textAnchor="middle"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-white text-xs font-semibold"
              >
                {item.symbol}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-4 h-4 rounded-full mr-2" 
              style={{ backgroundColor: colors[index % colors.length] }}
            ></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">{item.symbol}</span>
              <span className="text-sm text-gray-600 ml-2">{calculatePercentage(item.value)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
