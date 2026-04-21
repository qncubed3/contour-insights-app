"use client";

import { useCallback } from "react";
import DeckGL from "@deck.gl/react";
import Map, { MapRef } from "react-map-gl/maplibre";
import { useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import { Header } from "./Header";
import { useViewState } from "../app/hooks/useViewState";
import { useLayers } from "../app/hooks/useLayers";
import { MAP_STYLE } from "./constants";

export function MapView() {
    const { viewState, onViewStateChange } = useViewState();
    const { layers } = useLayers();
    const mapRef = useRef<MapRef>(null);

    const onMapLoad = useCallback(() => {
        // mapRef.current?.getMap().setProjection({ type: "globe" });
    }, []);

    return (
        <div className="relative w-full h-screen bg-zinc-100 font-mono">
            <DeckGL
                viewState={viewState}
                onViewStateChange={onViewStateChange}
                controller={true}
                layers={layers}
                getCursor={() => "grab"}
            >
                <Map
                    ref={mapRef}
                    mapStyle={MAP_STYLE}
                    onLoad={onMapLoad}
                />
            </DeckGL>
            <div className="absolute inset-0 bg-white/5 pointer-events-none z-10" />
            <Header />
        </div>
    );
}