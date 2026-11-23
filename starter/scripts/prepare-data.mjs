// Build public/data/fires.geojson and public/data/meta.json. Run once:
//   npm run data -- <firms.csv> <countries.geojson> <first day> <last day>
// Fires: NASA FIRMS, VIIRS NOAA-20 (J1_VIIRS_C2_Global_7d.csv), https://firms.modaps.eosdis.nasa.gov/active_fire/
// Countries: Natural Earth 1:50m admin 0 (public domain), used to keep the fires that fall inside Africa.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [csvPath, countriesPath, from, to] = process.argv.slice(2);
if (!to) throw new Error('Usage: npm run data -- <firms.csv> <countries.geojson> <first day> <last day>');

// FIRMS CSVs have no quoted fields, so a plain split is enough.
const [head, ...body] = readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const cols = head.split(',');
const rows = body.map((line) => Object.fromEntries(line.split(',').map((v, i) => [cols[i], v])));

// African countries, each with its bounding box so most points skip the full test.
const countries = JSON.parse(readFileSync(countriesPath, 'utf8')).features
  .filter((f) => f.properties.CONTINENT === 'Africa')
  .map((f) => {
    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const xs = polys.flat(2).map((p) => p[0]);
    const ys = polys.flat(2).map((p) => p[1]);
    return { name: f.properties.NAME, polys, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
  });

// Ray casting: a point is inside when a line from it crosses the rings an odd number of times.
const inRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const inPolygon = (p, rings) => inRing(p, rings[0]) && !rings.slice(1).some((hole) => inRing(p, hole));
const countryOf = (p) =>
  countries.find(({ box: [x0, y0, x1, y1], polys }) =>
    p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1 && polys.some((rings) => inPolygon(p, rings)),
  )?.name;

const features = [];
for (const r of rows) {
  if (r.acq_date < from || r.acq_date > to) continue;
  const lngLat = [Number(r.longitude), Number(r.latitude)];
  const country = countryOf(lngLat);
  if (!country) continue;
  features.push({
    type: 'Feature',
    properties: {
      // Fire radiative power in megawatts: how much heat the fire gives off.
      frp: Math.round(Number(r.frp) * 10) / 10,
      date: r.acq_date,
      time: r.acq_time,
      night: r.daynight === 'N',
      country,
    },
    // 3 decimals is about 100 m; a VIIRS pixel is 375 m across.
    geometry: { type: 'Point', coordinates: lngLat.map((v) => Number(v.toFixed(3))) },
  });
}

mkdirSync('public/data', { recursive: true });
writeFileSync('public/data/fires.geojson', JSON.stringify({ type: 'FeatureCollection', features }));
writeFileSync('public/data/meta.json', JSON.stringify({ count: features.length, from, to }));
console.log(`fires.geojson: ${features.length} fires, ${from} to ${to}`);
