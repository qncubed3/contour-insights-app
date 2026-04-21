import { MapViewState } from "@deck.gl/core";

export const INITIAL_VIEW_STATE: MapViewState = {
    longitude: 144.9631,
    latitude: -37.8136,
    zoom: 11,
    pitch: 0,
    bearing: 0,
};

export const MAP_STYLE =
    "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const LANDMARKS = [
    { name: "Federation Square", coordinates: [144.9684, -37.8179] },
    { name: "Melbourne CBD", coordinates: [144.9631, -37.8136] },
    { name: "Flinders Street Station", coordinates: [144.967, -37.8183] },
    { name: "Royal Botanic Gardens", coordinates: [144.9796, -37.8304] },
    { name: "Melbourne Zoo", coordinates: [144.9522, -37.7847] },
    { name: "Port Melbourne", coordinates: [144.9269, -37.8373] },
    { name: "Fitzroy", coordinates: [144.9775, -37.7991] },
    { name: "St Kilda Beach", coordinates: [144.978, -37.8678] },
];

// Blue marker color [R, G, B, A]
export const MARKER_COLOR: [number, number, number, number] = [59, 130, 246, 220];
export const MARKER_OUTLINE_COLOR: [number, number, number, number] = [59, 130, 246, 80];