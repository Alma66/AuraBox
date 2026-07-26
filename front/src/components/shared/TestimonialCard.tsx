import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, image }) => {
  return (
    <div className="bg-white rounded-2xl shadow-aurora-sm p-8 text-center h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-aurora border border-aurora-navy/5">
      <div>
        <span className="font-display text-5xl text-aurora-gold leading-none block mb-2">"</span>
        <p className="text-aurora-navy/75 text-lg italic mb-6 leading-relaxed">{quote}</p>
      </div>
      <div className="flex flex-col items-center">
        <img src={image} alt={author} className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-aurora-gold shadow-sm" />
        <h4 className="font-display font-bold text-aurora-navy text-lg">{author}</h4>
        <p className="text-aurora-terracotta text-sm font-medium">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;