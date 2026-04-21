"use client";

import { Map, useControl } from "react-map-gl/maplibre";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { DeckProps } from "@deck.gl/core";

export default function DeckGLOverlay(props: DeckProps) {
    const overlay = useControl<MapboxOverlay>(
        () => new MapboxOverlay({ interleaved: true, ...props })
    );
    overlay.setProps(props);
    return null;
}