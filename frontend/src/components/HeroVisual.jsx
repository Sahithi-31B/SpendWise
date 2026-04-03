import React from 'react';
import { motion } from 'framer-motion';

const HeroVisual = () => {
  return (
    <div className="hero-visual-area">
      <div className="circular-clipper">
        <motion.img 
          src="/chart_illustration.png" // Ensure image is in public/chart_illustration.png
          alt="Spend Analysis" 
          className="inner-hero-image"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          onError={(e) => { e.target.src = "https://via.placeholder.com/350"; }} 
        />
      </div>
      <div className="hero-glow-effect" />
    </div>
  );
};

export default HeroVisual;