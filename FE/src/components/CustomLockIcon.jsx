import React from 'react';

const CustomLockIcon = ({ className, size = 20 }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Head/Shoulders Silhouette */}
    <circle cx="9" cy="8" r="4" />
    <path d="M4 20c0-3.3 2.7-6 6-6h1" />
    
    {/* Small Lock Graphic */}
    <rect x="13" y="15" width="6" height="5" rx="1" />
    <path d="M14.5 15v-1.5a1.5 1.5 0 0 1 3 0V15" />
    <circle cx="16" cy="17.5" r="0.5" fill="currentColor" />
  </svg>
);

export default CustomLockIcon;
