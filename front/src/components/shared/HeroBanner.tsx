import React from 'react';
import { Link } from 'react-router-dom';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ title, subtitle, ctaText, ctaLink, backgroundImage }) => {
  return (
    <div
      className="relative flex h-96 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-aurora-navy to-aurora-terracottaDark bg-cover bg-center px-4 text-center md:h-[600px]"
      style={backgroundImage ? { backgroundImage: `url("${backgroundImage}")` } : undefined}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-aurora-navy/80 to-aurora-terracottaDark/60 animate-gradient-shift"></div>

      <div className="relative z-10 max-w-4xl text-white">
        <h1 className="mb-4 text-4xl font-extrabold leading-tight drop-shadow-lg animate-slideInUp md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mb-8 text-lg opacity-0 drop-shadow-md animate-fadeInUp delay-300 md:text-xl lg:text-2xl">
          {subtitle}
        </p>
        <Link
          to={ctaLink}
          className="inline-block transform rounded-full bg-white px-10 py-4 text-xl font-bold text-aurora-terracotta opacity-0 shadow-xl transition-all duration-300 ease-in-out animate-fadeInUp delay-500 hover:scale-105 hover:bg-aurora-cream focus:outline-none focus:ring-4 focus:ring-aurora-gold focus:ring-opacity-70"
        >
          {ctaText}
        </Link>
      </div>
    </div>
  );
};

export default HeroBanner;