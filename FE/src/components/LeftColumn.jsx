import React from 'react';
import logo from '../assets/logo.png';
import computer from '../assets/computer.png';

const LeftColumn = () => {
  return (
    <div className="left-column">
      <div className="logo-container">
        <img src={logo} alt="HiNa Logo" className="logo-image" />
      </div>
      <div className="illustration-container">
        <img src={computer} alt="3D Digital Learning Environment" className="computer-image" />
      </div>
    </div>
  );
};

export default LeftColumn;
