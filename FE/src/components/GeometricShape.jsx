import React from 'react';

const GeometricShape = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 10 L190 60 L100 190 L10 60 Z" fill="url(#paint0_linear)" />
    <path d="M10 60 L100 10 L100 190 Z" fill="rgba(255, 255, 255, 0.1)" />
    <defs>
      <linearGradient id="paint0_linear" x1="10" y1="60" x2="190" y2="190" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A855F7" />
        <stop offset="1" stopColor="#3B0764" />
      </linearGradient>
    </defs>
  </svg>
);

export default GeometricShape;
