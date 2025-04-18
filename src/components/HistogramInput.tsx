'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface HistogramInputProps {
  options: string[];
  onSubmit: (value: number[]) => void;
  total_allocation?: number;
  initialValues?: number[] | null;
  disabled?: boolean;
  randomize_order?: boolean;
}

export default function HistogramInput({ 
  options, 
  onSubmit, 
  total_allocation,
  initialValues = null,
  disabled = false,
  randomize_order = false
}: HistogramInputProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Create a mapping between original and displayed indices
  const [displayOrder, setDisplayOrder] = useState<number[]>([]);
  
  // Initialize display order
  useEffect(() => {
    if (randomize_order) {
      const order = [...Array(options.length).keys()];
      // Fisher-Yates shuffle
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      setDisplayOrder(order);
    } else {
      setDisplayOrder([...Array(options.length).keys()]);
    }
  }, [options.length, randomize_order]);

  const [values, setValues] = useState<number[]>(Array(options.length).fill(0));
  const maxValue = total_allocation || 10;

  // Initialize from saved values if present
  useEffect(() => {
    if (initialValues && initialValues.length === options.length) {
      setValues(initialValues);
    } else {
      setValues(Array(options.length).fill(0));
    }
  }, [initialValues, options.length]);
  
  const totalAllocated = values.reduce((sum, val) => sum + val, 0);
  const remainingAllocations = total_allocation ? total_allocation - totalAllocated : Infinity;

  const handleIncrement = (displayIndex: number) => {
    if (disabled) return;
    const originalIndex = displayOrder[displayIndex];
    if (values[originalIndex] < maxValue && remainingAllocations > 0) {
      const newValues = [...values];
      newValues[originalIndex] = newValues[originalIndex] + 1;
      setValues(newValues);
    }
  };

  const handleDecrement = (displayIndex: number) => {
    if (disabled) return;
    const originalIndex = displayOrder[displayIndex];
    if (values[originalIndex] > 0) {
      const newValues = [...values];
      newValues[originalIndex] = newValues[originalIndex] - 1;
      setValues(newValues);
    }
  };

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit(values); // Submit original order values
  };

  // Generate y-axis labels
  // const yAxisLabels = Array.from({ length: 6 }, (_, i) => maxValue - (i * 2));

  return (
    <div className="space-y-8">
      {total_allocation && (
        <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Remaining allocations: {remainingAllocations} / {total_allocation}
        </div>
      )}

      {/* Main histogram container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between items-end pr-2">
          {[100, 80, 60, 40, 20, 0].map((value) => (
            <span key={value} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {value}
            </span>
          ))}
        </div>

        {/* Y-axis line */}
        <div className={`absolute left-8 top-0 bottom-0 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        {/* X-axis line */}
        <div className={`absolute right-0 top-0 bottom-0 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />

        {/* Grid lines */}
        <div className={`absolute inset-0 left-8 flex flex-col justify-between`}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`border-t w-full ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ height: '1px' }}
            />
          ))}
        </div>

        {/* Histogram Bars */}
        <div className="relative h-60 flex items-end justify-between gap-1 pl-12 pr-4">
          {displayOrder.map((originalIndex, displayIndex) => (
            <div key={displayIndex} className="flex-1 flex flex-col items-center">
              <div className="w-full h-full flex items-end">
                <div
                  className={`w-full rounded-t transition-all duration-200 ease-in-out ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`}
                  style={{
                    height: values[originalIndex] > 0 ? `${(values[originalIndex] / maxValue) * 240}px` : '0',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-1 px-4 pl-12" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {displayOrder.map((originalIndex, displayIndex) => (
          <div key={displayIndex} className="flex flex-col items-center gap-2">
            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {options[originalIndex]}
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handleIncrement(displayIndex)}
                disabled={remainingAllocations <= 0 || disabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 active:bg-gray-500 disabled:bg-gray-800 disabled:border-gray-700' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100 disabled:bg-gray-100 disabled:border-gray-200'
                  } border`}
                aria-label={`Increase value for ${options[originalIndex]}`}
              >
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'} ${remainingAllocations <= 0 ? 'opacity-50' : ''}`}>+</span>
              </button>
              <button
                onClick={() => handleDecrement(displayIndex)}
                disabled={disabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 active:bg-gray-500' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                  } border`}
                aria-label={`Decrease value for ${options[originalIndex]}`}
              >
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>−</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={(total_allocation ? remainingAllocations > 0 : false) || disabled}
        className={`w-full py-2 px-4 rounded-md transition-colors text-white
          ${isDark 
            ? 'bg-blue-400 hover:bg-blue-500 active:bg-blue-600 disabled:bg-gray-600 disabled:hover:bg-gray-600' 
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:hover:bg-gray-300'
          } disabled:cursor-not-allowed`}
      >
        {total_allocation && remainingAllocations > 0 
          ? `Allocate ${remainingAllocations} more to submit` 
          : 'Submit Response'}
      </button>
    </div>
  );
} 