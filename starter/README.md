# Heatmaps and Clustering for 100k Points in Mapbox GL JS (starter)

The broken version from the Geo Intelligence Lab video. It has three bugs:

1. `src/map/layers.ts` + `src/components/MapView.tsx`: the heatmap reads the clustered source, so it gets clusters (no `frp`) and stays empty
2. `src/map/layers.ts`: `heatmap-radius` is a fixed number of screen pixels, so the heat fades away when you zoom in
3. `src/map/layers.ts` + `src/components/MapView.tsx`: the single-fire layer has no filter, so it draws every cluster as a fire, and clicking a cluster throws an error

Run it the same way as `final`, then fix each one along with the video.
