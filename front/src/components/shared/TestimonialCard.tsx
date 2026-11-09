import React from 'react';
import SafeImage from '../common/SafeImage';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, image }) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-aurora-navy/5 bg-white p-8 text-center shadow-aurora-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-aurora">
      <div>
        <span className="mb-2 block font-display text-5xl leading-none text-aurora-gold">"</span>
        <p className="mb-6 text-lg italic leading-relaxed text-aurora-navy/75">{quote}</p>
      </div>
      <div className="flex flex-col items-center">
        <SafeImage
          src={image}
          alt={author}
          className="mb-3 h-16 w-16 rounded-full border-2 border-aurora-gold object-cover shadow-sm"
        />
        <h4 className="font-display text-lg font-bold text-aurora-navy">{author}</h4>
        <p className="text-sm font-medium text-aurora-terracotta">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;