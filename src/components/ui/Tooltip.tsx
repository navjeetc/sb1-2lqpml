import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number>();

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(true);
  };

  const hideTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className="absolute z-50 w-48 px-3 py-2 text-sm bg-gray-800 text-white rounded-md shadow-lg -left-20 top-12"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="border-8 border-transparent border-b-gray-800" />
          </div>
          {content}
        </div>
      )}
    </div>
  );
}