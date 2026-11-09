import React, { useEffect, useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt = '', className, fallbackIcon, ...rest }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    const initial = (fallbackIcon ?? alt.trim().charAt(0) ?? '').toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className ?? ''} flex items-center justify-center bg-gradient-to-br from-aurora-gold/25 to-aurora-terracotta/15 font-display font-bold text-aurora-navy/60`}
      >
        <span className="text-2xl leading-none">{initial}</span>
      </div>
    );
  }

  return <img {...rest} src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
};

export default SafeImage;