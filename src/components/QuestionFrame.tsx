import React from 'react';
import { StudyConfig, UserResponse } from '@/types/study';
import NumberLineInput from './NumberLineInput';
import HistogramInput from './HistogramInput';

interface QuestionFrameProps {
  config: StudyConfig;
  onSubmit: (response: UserResponse) => void;
}

export default function QuestionFrame({ config, onSubmit }: QuestionFrameProps) {
  const handleNumberLineSubmit = (distribution: number[]) => {
    const response: UserResponse = {
      task_name: config.task_name,
      scenario_id: config.scenario_id,
      response_data: {
        selected_value: distribution.reduce((a, b) => a + b, 0), // Sum for compatibility
        distribution: distribution,
        timestamp: new Date().toISOString(),
      },
    };
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
        />
      )}
      {config.input_method === 'histogram' && (
        <HistogramInput
          options={config.options}
          onSubmit={handleHistogramSubmit}
          total_allocation={config.total_allocation}
        />
      )}
    </div>
  );
} 