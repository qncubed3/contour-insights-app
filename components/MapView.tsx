"use client";

import { useCallback, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import Map, { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { useViewState } from "@/app/hooks/useViewState";
import { useLayers } from "@/app/hooks/useLayers";
import { MAP_STYLE } from "@/components/constants";

export function MapView() {
    const { viewState, onViewStateChange } = useViewState();
    const { layers } = useLayers();
    const mapRef = useRef<MapRef>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const onMapLoad = useCallback(() => {
        // mapRef.current?.getMap().setProjection({ type: "globe" });
    }, []);

    return (
        <div
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 bg-zinc-100 font-mono"
                    : "relative w-full h-[600px] rounded-2xl overflow-hidden bg-zinc-100 font-mono shadow-2xl"
            }
        >
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

            <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-200 shadow hover:bg-zinc-100 text-black cursor-pointer"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
                {isFullscreen ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M8 3v5H3" />
                        <path d="M16 3v5h5" />
                        <path d="M8 21v-5H3" />
                        <path d="M16 21v-5h5" />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                    >
                        <path d="M8 3H3v5" />
                        <path d="M16 3h5v5" />
                        <path d="M8 21H3v-5" />
                        <path d="M16 21h5v-5" />
                    </svg>
                )}
            </button>
        </div>
    );
}