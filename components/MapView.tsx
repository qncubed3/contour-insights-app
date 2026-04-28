"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import Map, { MapRef } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapViewState } from "@deck.gl/core";

import { useLayers } from "@/app/hooks/useLayers";
import { useSnowflakeData } from "@/app/hooks/useSnowflakeData";
import { MAP_STYLE } from "@/components/constants";
import { StudentInfoPanel } from "./StudentInfoPanel";
import { CampusInfoPanel } from "./CampusInfoPanel";
import TimelineConsole from "./TimelineConsole";

const INITIAL_VIEW_STATE: MapViewState = {
    longitude: 145,
    latitude: -37.85,
    zoom: 9,
};

export function MapView() {
    const { data, loading, error } = useSnowflakeData();

    const [viewState, setViewState] =
        useState<MapViewState>(INITIAL_VIEW_STATE);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const [startDateState, setStartDate] = useState<Date | null>(null);
    const [endDateState, setEndDate] = useState<Date | null>(null);
    const [currentDateState, setCurrentDate] = useState<Date | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mapRef = useRef<MapRef>(null);

    const { minDate, maxDate } = useMemo(() => {
        const timestamps = data.students
            .map((student) => new Date(student.created_at).getTime())
            .filter((timestamp) => !Number.isNaN(timestamp));

        if (!timestamps.length) {
            return {
                minDate: null,
                maxDate: null,
            };
        }

        return {
            minDate: new Date(Math.min(...timestamps)),
            maxDate: new Date(Math.max(...timestamps)),
        };
    }, [data.students]);

    const startDate = startDateState ?? minDate;
    const endDate = endDateState ?? maxDate;
    const currentDate = currentDateState ?? startDate;

    const filteredData = useMemo(() => {
        if (!currentDate) return data;

        return {
            students: data.students.filter(
                (student) => new Date(student.created_at) <= currentDate
            ),
            campuses: data.campuses,
        };
    }, [data, currentDate]);

    const { layers, selectedObject, setSelectedObject } = useLayers({
        data: filteredData,
        zoom: viewState.zoom,
    });

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== "Escape") return;

            if (selectedObject) {
                setSelectedObject(null);
                return;
            }

            if (isFullscreen) {
                setIsFullscreen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedObject, isFullscreen, setSelectedObject]);

    return (
        <div
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 bg-zinc-100"
                    : "relative w-full h-[600px] rounded-2xl overflow-hidden bg-zinc-100 shadow-2xl"
            }
        >
            <DeckGL
                viewState={viewState}
                onViewStateChange={({ viewState }) => {
                    setViewState(viewState as MapViewState);
                }}
                controller
                layers={layers}
                getCursor={() => "grab"}
            >
                <Map
                    ref={mapRef}
                    mapStyle={MAP_STYLE}
                    attributionControl={false}
                />
            </DeckGL>

            <TimelineConsole
                minDate={minDate}
                maxDate={maxDate}
                startDate={startDate}
                endDate={endDate}
                currentDate={currentDate}
                isPlaying={isPlaying}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onCurrentDateChange={setCurrentDate}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
            />

            {selectedObject && (
                <div className="absolute left-4 top-4 z-20 w-80 rounded-2xl bg-white p-4 shadow-xl text-sm text-zinc-800">
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <h2 className="text-base font-semibold">
                            {selectedObject.type === "student"
                                ? `Student ${selectedObject.object.student_id}`
                                : selectedObject.object.name}
                        </h2>

                        <button
                            onClick={() => setSelectedObject(null)}
                            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100"
                            aria-label="Close popup"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {selectedObject.type === "student" && (
                        <StudentInfoPanel student={selectedObject.object} />
                    )}

                    {selectedObject.type === "campus" && (
                        <CampusInfoPanel campus={selectedObject.object} />
                    )}
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="rounded-xl bg-white px-4 py-2 shadow text-sm font-medium text-gray-700">
                        Loading map data...
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-red-50/80 backdrop-blur-sm">
                    <div className="rounded-xl bg-white px-4 py-2 shadow text-sm font-medium text-red-600">
                        Failed to load data
                    </div>
                </div>
            )}

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
                        <polyline points="9 3 9 9 3 9" />
                        <polyline points="15 3 15 9 21 9" />
                        <polyline points="9 21 9 15 3 15" />
                        <polyline points="15 21 15 15 21 15" />
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
                        <polyline points="3 9 3 3 9 3" />
                        <polyline points="21 9 21 3 15 3" />
                        <polyline points="3 15 3 21 9 21" />
                        <polyline points="21 15 21 21 15 21" />
                    </svg>
                )}
            </button>
        </div>
    );
}