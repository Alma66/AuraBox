// src/components/ClubSocialMedia.tsx
import React from 'react';

export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
}

interface ClubSocialMediaProps {
  socialMedia?: SocialMediaLinks;
}

const ClubSocialMedia: React.FC<ClubSocialMediaProps> = ({ socialMedia }) => {
  if (!socialMedia) return null;

  const socialIcons = [
    {
      name: 'Instagram',
      url: socialMedia.instagram,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2.16c3.2 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.899.42.42.68.818.899 1.382.166.422.36 1.057.415 2.227.056 1.265.07 1.65.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.9 1.382-.42.42-.818.68-1.382.899-.422.166-1.057.36-2.227.415-1.265.056-1.65.07-4.85.07s-3.585-.015-4.85-.074c-1.17-.061-1.805-.256-2.227-.421-.224-.562-.479-.96-.9-1.382-.42-.42-.818-.68-1.382-.899-.422-.166-1.057-.36-2.227-.415C2.175 15.585 2.16 15.2 2.16 12s.015-3.585.074-4.85c.061-1.17.256-1.805.421-2.227.224-.562.479-.96.9-1.382.42-.42.818-.68 1.382-.899.422-.166 1.057-.36 2.227-.415C8.415 2.176 8.8 2.16 12 2.16zm0 3.635a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM18.406 6.95a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: socialMedia.facebook,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" />
        </svg>
      ),
    },
    {
      name: 'Twitter',
      url: socialMedia.twitter,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012 10.77a4.096 4.096 0 003.29 4.027 4.115 4.115 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      ),
    },
    {
      name: 'TikTok',
      url: socialMedia.tiktok,
      icon: (
        // Simple music-note-like icon as a TikTok placeholder
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
        </svg>
      ),
    },
    {
      name: 'YouTube',
      url: socialMedia.youtube,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 15l5-3-5-3v6z" />
          <path d="M21 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C15.6 4.8 12 4.8 12 4.8s-3.6 0-5.9.3c-.4.1-1.3.1-2.1.9-.6.6-.8 2-.8 2S2 9.8 2 11.6v.8C2 14.2 2 15.6 2 15.6s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.2 7.8.3 7.8.3s3.6 0 5.9-.3c.4-.1 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.1-1.4.1-3.2v-.8C21 9.8 21 8 21 8z" />
        </svg>
      ),
    },
    {
      name: 'Website',
      url: socialMedia.website,
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17a7 7 0 01-1 0V5a7 7 0 011 0v14z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex space-x-4 mt-4">
      {socialIcons.map(
        (social) =>
          social.url && (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visitar ${social.name} de este club`}
              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              {social.icon}
            </a>
          )
      )}
    </div>
  );
};

export default ClubSocialMedia;
