import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

import { FIRES_URL } from '../data';
import {
  CLUSTER_POINTS, CLUSTER_SOURCE, CLUSTERS, clusterCountLayer, clusterPointsLayer, clustersLayer,
  heatmapLayer, MODE_LAYERS, STYLE,
} from '../map/layers';
import { firePopup } from '../map/popup';
import type { FireProps, Mode } from '../types';

const ATTRIBUTION = 'Fires: NASA FIRMS, VIIRS NOAA-20. Borders: Natural Earth.';

interface Props {
  token: string;
  mode: Mode;
}

export const MapView = ({ token, mode }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Create the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken: token,
      style: STYLE,
      projection: 'mercator',
      center: [18, 2],
      zoom: 2.9,
      customAttribution: ATTRIBUTION,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('style.load', () => {
      map.addSource(CLUSTER_SOURCE, {
        type: 'geojson',
        data: FIRES_URL,
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 12,
      });
      [heatmapLayer, clustersLayer, clusterCountLayer, clusterPointsLayer].forEach((l) => map.addLayer(l));
      showMode(map, modeRef.current);
    });

    // One fire: show what the satellite saw.
    const popup = new mapboxgl.Popup({ offset: 8 });
    for (const layer of [CLUSTER_POINTS]) {
      map.on('click', layer, (e) => {
        const fire = e.features?.[0];
        if (!fire || fire.geometry.type !== 'Point') return;
        popup
          .setLngLat(fire.geometry.coordinates as [number, number])
          .setDOMContent(firePopup(fire.properties as FireProps))
          .addTo(map);
      });
    }
    for (const layer of [CLUSTERS, CLUSTER_POINTS]) {
      map.on('mouseenter', layer, () => (map.getCanvas().style.cursor = 'pointer'));
      map.on('mouseleave', layer, () => (map.getCanvas().style.cursor = ''));
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer(CLUSTERS)) showMode(map, mode);
  }, [mode]);

  return <div ref={containerRef} className="map" />;
};

/** Show one mode's layers and hide the other's. */
const showMode = (map: mapboxgl.Map, mode: Mode) => {
  for (const [m, layers] of Object.entries(MODE_LAYERS)) {
    for (const id of layers) map.setLayoutProperty(id, 'visibility', m === mode ? 'visible' : 'none');
  }
};
