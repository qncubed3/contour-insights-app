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


// Blue marker color [R, G, B, A]
export const MARKER_COLOR: [number, number, number, number] = [59, 130, 246, 220];
export const MARKER_OUTLINE_COLOR: [number, number, number, number] = [59, 130, 246, 80];