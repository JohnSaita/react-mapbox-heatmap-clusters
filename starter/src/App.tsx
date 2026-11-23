import { useEffect, useState } from 'react';

import { MapView } from './components/MapView';
import { Panel } from './components/Panel';
import { loadMeta } from './data';
import type { Meta, Mode } from './types';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export const App = () => {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('heatmap');

  useEffect(() => {
    loadMeta().then(setMeta, (e: Error) => setError(e.message));
  }, []);

  if (!TOKEN) return <p className="message">Add VITE_MAPBOX_TOKEN to a .env file (see .env.example), then restart npm run dev.</p>;
  if (error) return <p className="message">{error}</p>;

  return (
    <div className="layout">
      <MapView token={TOKEN} mode={mode} />
      {meta && <Panel meta={meta} mode={mode} onMode={setMode} />}
    </div>
  );
};
