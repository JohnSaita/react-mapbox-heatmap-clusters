import type { FireProps } from '../types';

/** Popup content for one fire. Built from text nodes, so nothing in the data runs as HTML. */
export const firePopup = (p: FireProps): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'popup';
  const rows: [string, string][] = [
    ['Power', `${p.frp} MW`],
    ['Seen', `${p.date} ${p.time.slice(0, 2)}:${p.time.slice(2)} UTC (${p.night ? 'night' : 'day'})`],
    ['Country', p.country],
  ];
  for (const [label, value] of rows) {
    const row = el.appendChild(document.createElement('p'));
    row.appendChild(document.createElement('b')).textContent = label;
    row.append(` ${value}`);
  }
  return el;
};
