import React, { useEffect, useState } from 'react';
import { StudyConfig, UserResponse } from '@/types/study';
import NumberLineInput from './NumberLineInput';
import HistogramInput from './HistogramInput';

interface QuestionFrameProps {
  config: StudyConfig;
  onSubmit: (response: UserResponse) => void;
  previousResponses?: Record<number, number[]>;
}

export default function QuestionFrame({ config, onSubmit, previousResponses = {} }: QuestionFrameProps) {
  const [previousResponse, setPreviousResponse] = useState<number[] | null>(null);
  
  useEffect(() => {
    // Check if there's a previous response for this scenario
    if (previousResponses && previousResponses[config.scenario_id]) {
      setPreviousResponse(previousResponses[config.scenario_id]);
      
      // If it's a number line input, also check if we have saved point positions
      if (config.input_method === 'number_line') {
        // Try to load exact point positions from localStorage for this scenario
        const savedPositions = localStorage.getItem(`pointPositions_${config.scenario_id}`);
        if (savedPositions) {
          try {
            JSON.parse(savedPositions);
            // The NumberLineInput component will handle the point positions data
          } catch (err) {
            console.error('Error parsing saved point positions:', err);
          }
        }
      }
    } else {
      setPreviousResponse(null);
    }
  }, [config.scenario_id, previousResponses, config.input_method]);

  const handleNumberLineSubmit = (distribution: number[], points?: number[]) => {
    const response: UserResponse = {
      task_name: config.task_name,
      scenario_id: config.scenario_id,
      response_data: {
        selected_value: distribution.reduce((a, b) => a + b, 0), // Sum for compatibility
        distribution: distribution,
        timestamp: new Date().toISOString(),
      },
    };
    
    // Add points data if available (for continuous values preservation)
    if (points && points.length > 0) {
      response.response_data.points = points;
    }
    
    onSubmit(response);
  };

  const handleHistogramSubmit = (values: number[]) => {
    const response: UserResponse = {
      task_name: config.task_name,
      scenario_id: config.scenario_id,
      response_data: {
        selected_value: values.reduce((a, b) => a + b, 0), // Sum for compatibility
        values: values, // Store the full distribution
        timestamp: new Date().toISOString(),
      },
    };
    onSubmit(response);
  };

  return (
    <div className="space-y-4">
      {config.input_method === 'number_line' && (
        <NumberLineInput
          options={config.options}
          onSubmit={handleNumberLineSubmit}
          total_allocation={config.total_allocation}
          initialDistribution={previousResponse}
          scenarioId={config.scenario_id}
        />
      )}
      {config.input_method === 'histogram' && (
        <HistogramInput
          options={config.options}
          onSubmit={handleHistogramSubmit}
          total_allocation={config.total_allocation}
          initialValues={previousResponse}
        />
      )}
    </div>
  );
} 