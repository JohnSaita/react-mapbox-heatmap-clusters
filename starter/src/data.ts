import type { Meta } from './types';

/** Mapbox fetches and parses the GeoJSON itself, off the main thread. */
export const FIRES_URL = `${import.meta.env.BASE_URL}data/fires.geojson`;

export const loadMeta = async (): Promise<Meta> => {
  const res = await fetch(`${import.meta.env.BASE_URL}data/meta.json`);
  if (!res.ok) throw new Error(`Could not load meta.json (${res.status})`);
  return (await res.json()) as Meta;
};
