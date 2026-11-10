import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AssistantChat from '../common/AssistantChat';
import { tapFeedback } from '../../utils/native';
import { getHeaderTitle, isRootPath } from './nativeRoutes';

interface NativeHeaderProps {
  isCustomer: boolean;
}

const NativeHeader: React.FC<NativeHeaderProps> = ({ isCustomer }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const atRoot = isRootPath(pathname);
  const atHome = pathname === '/';
  const title = getHeaderTitle(pathname);

  const goBack = () => {
    tapFeedback();
    if (window.history.length > 1) navigate(-1);
    else navigate('/', { replace: true });
  };

  const iconButton =
    'flex h-11 w-11 items-center justify-center rounded-full text-aurora-cream transition-colors active:bg-white/15';

  return (
    <>
      <header className="sticky top-0 z-40 bg-aurora-navy text-aurora-cream safe-top safe-x">
        <div className="flex h-14 items-center gap-1 px-1">
          {!atRoot && (
            <button type="button" onClick={goBack} aria-label="Volver" className={iconButton}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}

          {atHome ? (
            <Link to="/" aria-label="AuraBox" className="flex items-center gap-2 pl-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-cream p-1">
                <img src="/aurabox-mark.svg" alt="" className="h-full w-full" />
              </span>
              <span className="font-display text-xl font-bold tracking-tight">AuraBox</span>
            </Link>
          ) : (
            <h1 className={`min-w-0 flex-1 truncate font-display text-lg font-bold ${atRoot ? 'pl-3' : 'pl-1'}`}>{title}</h1>
          )}

          <div className="ml-auto flex items-center">
            {isCustomer && (
              <Link to="/customer/wishlist" aria-label="Mis favoritos" onClick={() => tapFeedback()} className={iconButton}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                setChatOpen(true);
              }}
              aria-label="Abrir asistente virtual"
              aria-haspopup="dialog"
              className={iconButton}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default NativeHeader;