import type { ExpressionSpecification, LayerSpecification } from 'mapbox-gl';

export const STYLE = 'mapbox://styles/mapbox/dark-v11';

/** Two sources, same file: the heatmap needs every fire, the clusters need them grouped. */
export const HEAT_SOURCE = 'fires-heat';
export const CLUSTER_SOURCE = 'fires';

export const HEATMAP = 'fires-heatmap';
export const FIRE_POINTS = 'fire-points';
export const CLUSTERS = 'clusters';
export const CLUSTER_COUNT = 'cluster-count';
export const CLUSTER_POINTS = 'cluster-points';

/** Which layers each mode shows. */
export const MODE_LAYERS = {
  heatmap: [HEATMAP, FIRE_POINTS],
  clusters: [CLUSTERS, CLUSTER_COUNT, CLUSTER_POINTS],
} as const;

/** Colour of one fire by its radiative power (MW). */
const frpColor: ExpressionSpecification = [
  'interpolate', ['linear'], ['get', 'frp'],
  0, '#fdd49e',
  10, '#fc8d59',
  50, '#e34a33',
  150, '#b30000',
];

const firePoint = (id: string, source: string): LayerSpecification => ({
  id,
  type: 'circle',
  source,
  paint: {
    'circle-color': frpColor,
    'circle-radius': ['interpolate', ['linear'], ['zoom'], 7, 2.5, 14, 7],
    'circle-stroke-color': '#1a1a1a',
    'circle-stroke-width': 0.6,
  },
});

export const heatmapLayer: LayerSpecification = {
  id: HEATMAP,
  type: 'heatmap',
  source: HEAT_SOURCE,
  maxzoom: 9,
  paint: {
    // A hotter fire counts for more: 0 MW adds a little, 50 MW and up adds the most.
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'frp'], 0, 0.1, 50, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.03, 5, 0.1, 9, 0.5],
    // Radius is in screen pixels, so it has to grow as you zoom in or the heat thins out.
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 3, 4, 10, 9, 30],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0, 0, 0, 0)',
      0.15, '#5a1a0e',
      0.35, '#b3260f',
      0.6, '#f0602a',
      0.85, '#fdb54a',
      1, '#fff3c4',
    ],
    // Fade the heat out as the single fires fade in.
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0],
  },
};

/** Single fires take over from the heat between zoom 7 and 8. */
export const firePointsLayer: LayerSpecification = {
  ...firePoint(FIRE_POINTS, HEAT_SOURCE),
  minzoom: 7,
} as LayerSpecification;

export const clustersLayer: LayerSpecification = {
  id: CLUSTERS,
  type: 'circle',
  source: CLUSTER_SOURCE,
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#f7b267', 100, '#f4845f', 1000, '#f25c54', 5000, '#c0392b'],
    'circle-radius': ['step', ['get', 'point_count'], 14, 100, 19, 1000, 26, 5000, 34],
    'circle-stroke-color': 'rgba(255, 255, 255, 0.35)',
    'circle-stroke-width': 2,
  },
};

export const clusterCountLayer: LayerSpecification = {
  id: CLUSTER_COUNT,
  type: 'symbol',
  source: CLUSTER_SOURCE,
  filter: ['has', 'point_count'],
  layout: {
    'text-field': ['get', 'point_count_abbreviated'],
    'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
    'text-size': 13,
    'text-allow-overlap': true,
  },
  paint: { 'text-color': '#1a0a06' },
};

/** Clusters are features too, with point_count. Leave them out, or every cluster is also a "fire". */
export const clusterPointsLayer: LayerSpecification = {
  ...firePoint(CLUSTER_POINTS, CLUSTER_SOURCE),
  filter: ['!', ['has', 'point_count']],
} as LayerSpecification;
