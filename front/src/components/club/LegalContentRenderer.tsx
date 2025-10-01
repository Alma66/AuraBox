import React from 'react';
import { LegalSection } from '../../types/legalSection';

interface Props {
  sections: LegalSection[];
}

const LegalContentRenderer: React.FC<Props> = ({ sections }) => {
  return (
    <div className="space-y-10">
      {sections.map((section) => {
        switch (section.type) {
          case 'title':
            return (
              <h2
                key={section.id}
                className="text-4xl font-extrabold text-gray-900 border-b-4 border-blue-600 pb-2"
              >
                {section.content}
              </h2>
            );
          case 'paragraph':
            return (
              <p
                key={section.id}
                className={`text-gray-700 max-w-4xl mx-auto leading-relaxed ${
                  section.layout === 'left'
                    ? 'text-left'
                    : section.layout === 'right'
                    ? 'text-right'
                    : 'text-center'
                }`}
              >
                {section.content}
              </p>
            );
          case 'list':
            return (
              <ul
                key={section.id}
                className={`list-disc max-w-3xl mx-auto text-gray-700 ${
                  section.layout === 'left'
                    ? 'text-left'
                    : section.layout === 'right'
                    ? 'text-right'
                    : 'text-center'
                }`}
              >
                {(section.content as string[]).map((item, idx) => (
                  <li key={idx} className="mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            );
          case 'image':
            return (
              <div
                key={section.id}
                className={`max-w-4xl mx-auto my-8 flex ${
                  section.layout === 'left'
                    ? 'justify-start'
                    : section.layout === 'right'
                    ? 'justify-end'
                    : 'justify-center'
                }`}
              >
                <img
                  src={section.content as string}
                  alt="Legal Section"
                  className="rounded-lg shadow-lg max-h-96 object-contain"
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default LegalContentRenderer;