import type { ExpressionSpecification, LayerSpecification } from 'mapbox-gl';

export const STYLE = 'mapbox://styles/mapbox/dark-v11';

export const CLUSTER_SOURCE = 'fires';

export const HEATMAP = 'fires-heatmap';
export const FIRE_POINTS = 'fire-points';
export const CLUSTERS = 'clusters';
export const CLUSTER_COUNT = 'cluster-count';
export const CLUSTER_POINTS = 'cluster-points';

/** Which layers each mode shows. */
export const MODE_LAYERS = {
  heatmap: [HEATMAP],
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
  source: CLUSTER_SOURCE,
  paint: {
    // A hotter fire counts for more: 0 MW adds a little, 50 MW and up adds the most.
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'frp'], 0, 0.1, 50, 1],
    'heatmap-intensity': 0.07,
    'heatmap-radius': 8,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0, 0, 0, 0)',
      0.15, '#5a1a0e',
      0.35, '#b3260f',
      0.6, '#f0602a',
      0.85, '#fdb54a',
      1, '#fff3c4',
    ],
  },
};

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

export const clusterPointsLayer: LayerSpecification = firePoint(CLUSTER_POINTS, CLUSTER_SOURCE);
