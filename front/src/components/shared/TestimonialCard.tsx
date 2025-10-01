import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, image }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center h-full flex flex-col justify-between transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
      <p className="text-gray-700 text-lg italic mb-6 flex-grow">"{quote}"</p>
      <div className="flex flex-col items-center">
        <img src={image} alt={author} className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-blue-200 shadow-md" />
        <h4 className="font-bold text-gray-900 text-xl">{author}</h4>
        <p className="text-blue-600 text-sm">{role}</p>
      </div>
    </div>
  );
};

export default TestimonialCard;