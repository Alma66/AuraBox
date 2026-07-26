import React from 'react';

interface AlternatingContentProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  reverse: boolean;
}

const AlternatingContent: React.FC<AlternatingContentProps> = ({ title, description, imageUrl, imageAlt, reverse }) => {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-10 py-12 px-4 ${reverse ? 'md:flex-row-reverse' : ''} animate-fadeInUp`}>
      <div className="md:w-1/2 relative">
        <div className={`absolute -inset-3 rounded-2xl bg-gradient-to-br from-aurora-gold/20 to-aurora-terracotta/10 blur-xl ${reverse ? '-rotate-2' : 'rotate-2'}`} />
        <img
          src={imageUrl}
          alt={imageAlt}
          className="relative rounded-2xl shadow-aurora w-full h-64 md:h-96 object-cover transform transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
      <div className="md:w-1/2 text-center md:text-left">
        <h3 className="font-display text-3xl md:text-4xl font-bold text-aurora-navy mb-4 leading-tight">{title}</h3>
        <p className="text-aurora-navy/70 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default AlternatingContent;