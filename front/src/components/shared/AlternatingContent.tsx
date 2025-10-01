import React from 'react';

interface AlternatingContentProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  reverse: boolean; // true para imagen a la derecha, false para imagen a la izquierda
}

const AlternatingContent: React.FC<AlternatingContentProps> = ({ title, description, imageUrl, imageAlt, reverse }) => {
  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-8 py-12 px-4 ${reverse ? 'md:flex-row-reverse' : ''} animate-fadeInUp`}>
      <div className="md:w-1/2">
        <img 
          src={imageUrl} 
          alt={imageAlt} 
          className="rounded-xl shadow-lg w-full h-64 md:h-96 object-cover transform transition-transform duration-500 hover:scale-[1.02] hover:shadow-xl" 
        />
      </div>
      <div className="md:w-1/2 text-center md:text-left">
        <h3 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{title}</h3>
        <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default AlternatingContent;