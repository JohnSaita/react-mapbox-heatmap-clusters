import type { Meta, Mode } from '../types';

interface Props {
  meta: Meta;
  mode: Mode;
  onMode: (mode: Mode) => void;
}

const MODES: { id: Mode; label: string; help: string }[] = [
  { id: 'heatmap', label: 'Heatmap', help: 'Where fires are densest and hottest. Zoom in past 8 for single fires.' },
  { id: 'clusters', label: 'Clusters', help: 'How many fires in each area. Click a cluster to zoom in.' },
];

const day = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const Panel = ({ meta, mode, onMode }: Props) => (
  <aside className="panel" aria-label="Map view">
    <header>
      <p className="eyebrow">Satellite fire detections</p>
      <h1>Fires across Africa</h1>
    </header>
    <div className="count">
      <output>{meta.count.toLocaleString('en-US')}</output>
      <span>fire detections, {day(meta.from)} to {day(meta.to)} {meta.to.slice(0, 4)}</span>
    </div>
    <div className="modes" role="radiogroup" aria-label="Show as">
      {MODES.map((m) => (
        <label key={m.id} className="mode">
          <input type="radio" name="mode" checked={mode === m.id} onChange={() => onMode(m.id)} />
          {m.label}
        </label>
      ))}
    </div>
    <p className="help">{MODES.find((m) => m.id === mode)?.help}</p>
    <p className="source">NASA FIRMS, VIIRS on NOAA-20. One point is one 375 m pixel the satellite saw burning.</p>
  </aside>
);
