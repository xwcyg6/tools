'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ProgressBarProps {
  progress: number; // 0-100
  status: string;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

export default function ProgressBar({
  progress,
  status,
  onCancel,
  showCancel = true,
  className = ''
}: ProgressBarProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-300">{status}</span>
        <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {showCancel && onCancel && (
        <div className="flex justify-end">
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1"
          >
            <FontAwesomeIcon icon={faTimes} />
            取消
          </button>
        </div>
      )}
    </div>
  );
} 