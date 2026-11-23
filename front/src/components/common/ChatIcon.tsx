import React from 'react';

interface ChatIconProps {
  className?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({ className = 'h-6 w-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5.5 4h13A2.5 2.5 0 0121 6.5v8a2.5 2.5 0 01-2.5 2.5H11l-4.2 3.5a.6.6 0 01-1-.46V17h-.3A2.5 2.5 0 013 14.5v-8A2.5 2.5 0 015.5 4z" />
    <circle cx="8.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export default ChatIcon;