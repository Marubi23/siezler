import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white dark:bg-dark-100 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-200 p-6 transition-all duration-300 ${hover ? 'hover:shadow-xl hover:-translate-y-1' : ''} ${className}`}>
      {children}
    </div>
  );
};