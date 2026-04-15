import React, { useMemo } from 'react';
import background from '../assets/background.png';
import stardust from '../assets/stardust.png';
import GeometricShape from './GeometricShape';

const BackgroundLayer = () => {
  // Generate random stars only once
  const stars = useMemo(() => Array.from({ length: 70 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${10 + Math.random() * 20}s`,
    size: `${Math.random() * 3 + 1}px`,
    tx: `${(Math.random() - 0.5) * 150}px`,
    ty: `${(Math.random() - 0.5) * 150}px`,
  })), []);

  // Generate some shapes
  const shapes = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 90}%`,
    top: `${Math.random() * 90}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${20 + Math.random() * 20}s`,
    scale: 0.3 + Math.random() * 0.8,
    opacity: 0.2 + Math.random() * 0.5,
    tx: `${(Math.random() - 0.5) * 100}px`,
    ty: `${(Math.random() - 0.5) * 100}px`,
    rot: `${(Math.random() - 0.5) * 180}deg`,
  })), []);

  return (
    <div className="background-layer">
      <img src={background} alt="" className="bg-image" />
      <img src={stardust} alt="" className="stardust" />
      
      {/* Animated Stars */}
      <div className="galaxy-container">
        {stars.map(star => (
          <div 
            key={star.id} 
            className="moving-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              '--tx': star.tx,
              '--ty': star.ty,
            }}
          />
        ))}
      </div>

      {/* Animated Shapes */}
      <div className="shapes-container">
        {shapes.map(s => (
          <div 
            key={s.id}
            className="shape-wrapper"
            style={{
              left: s.left,
              top: s.top,
              width: `${100 * s.scale}px`,
              height: `${100 * s.scale}px`,
              opacity: s.opacity,
            }}
          >
            <GeometricShape 
              className="floating-shape"
              style={{
                animationDelay: s.animationDelay,
                animationDuration: s.animationDuration,
                '--tx': s.tx,
                '--ty': s.ty,
                '--rot': s.rot,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundLayer;
