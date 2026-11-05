import React from 'react';
import { LegalSection } from '../../types/legalSection';

interface Props {
  sections: LegalSection[];
}

const alignClass = (layout?: string) =>
  layout === 'left' ? 'text-left' : layout === 'right' ? 'text-right' : 'text-center';

const justifyClass = (layout?: string) =>
  layout === 'left' ? 'justify-start' : layout === 'right' ? 'justify-end' : 'justify-center';

const LegalContentRenderer: React.FC<Props> = ({ sections }) => {
  return (
    <div className="space-y-10">
      {sections.map((section) => {
        switch (section.type) {
          case 'title':
            return (
              <h2
                key={section.id}
                className="text-4xl font-extrabold text-aurora-navy border-b-4 border-aurora-terracotta pb-2"
              >
                {section.content}
              </h2>
            );
          case 'paragraph':
            return (
              <p
                key={section.id}
                className={`text-aurora-navy/80 max-w-4xl mx-auto leading-relaxed ${alignClass(section.layout)}`}
              >
                {section.content}
              </p>
            );
          case 'list':
            return (
              <ul
                key={section.id}
                className={`list-disc max-w-3xl mx-auto text-aurora-navy/80 ${alignClass(section.layout)}`}
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
                className={`max-w-4xl mx-auto my-8 flex ${justifyClass(section.layout)}`}
              >
                <img
                  src={section.content as string}
                  alt="Legal Section"
                  className="rounded-lg shadow-aurora-sm max-h-96 object-contain"
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