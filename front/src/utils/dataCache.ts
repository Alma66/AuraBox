import api, { getResponseData } from '../api/config';

export interface ClubSummary {
  id: number;
  name: string;
  logoUrl?: string;
}

export interface PlanSummary {
  id: number;
  idClub: number;
  name: string;
  basePrice: string;
  frequency: string;
  imageUrl?: string | null;
}

const clubCache = new Map<number, Promise<ClubSummary | null>>();
const planCache = new Map<number, Promise<PlanSummary | null>>();

const load = <T>(cache: Map<number, Promise<T | null>>, id: number, path: string): Promise<T | null> => {
  const cached = cache.get(id);
  if (cached) return cached;
  const request = api
    .get(path)
    .then((response: unknown) => getResponseData(response) as T)
    .catch(() => {
      cache.delete(id);
      return null;
    });
  cache.set(id, request);
  return request;
};

export const getClubSummary = (id: number): Promise<ClubSummary | null> => load<ClubSummary>(clubCache, id, `/clubs/${id}`);

export const getPlanSummary = (id: number): Promise<PlanSummary | null> =>
  load<PlanSummary>(planCache, id, `/subscription-types/${id}`);