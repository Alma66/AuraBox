import React from 'react';
import { Link } from 'react-router-dom';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ title, subtitle, ctaText, ctaLink, backgroundImage }) => {
  return (
    <div
      className="relative w-full h-96 md:h-[600px] bg-cover bg-center flex items-center justify-center text-center px-4 overflow-hidden"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Overlay con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800/70 to-purple-800/70 backdrop-blur-sm animate-gradient-shift"></div>
      
      <div className="relative z-10 text-white max-w-4xl">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 drop-shadow-lg animate-slideInUp">
          {title}
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-0 animate-fadeInUp delay-300 drop-shadow-md">
          {subtitle}
        </p>
        <Link
          to={ctaLink}
          className="inline-block bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-xl shadow-xl 
                     transform transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-100 
                     focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-70 opacity-0 animate-fadeInUp delay-500"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;