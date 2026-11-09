import { useEffect, useState } from 'react';
import api, { getResponseData } from '../api/config';

type SiteContent = Record<string, string>;

let cache: SiteContent | null = null;
let pending: Promise<SiteContent> | null = null;

const loadSiteContent = (): Promise<SiteContent> => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = api
      .get('/site-content')
      .then((response) => {
        const data = getResponseData(response);
        const content: SiteContent = data && typeof data === 'object' ? data : {};
        cache = content;
        return content;
      })
      .catch(() => ({} as SiteContent))
      .then((content) => {
        pending = null;
        return content;
      });
  }
  return pending;
};

export const clearSiteContentCache = () => {
  cache = null;
};

export const useSiteContent = (): SiteContent => {
  const [content, setContent] = useState<SiteContent>(cache ?? {});

  useEffect(() => {
    let active = true;
    loadSiteContent().then((data) => {
      if (active) setContent(data);
    });
    return () => {
      active = false;
    };
  }, []);

  return content;
};