"use client";

import { useMemo } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";
import { useSnowflakeData } from "./useSnowflakeData";

function getYearLevelColor(yearLevel: string | number) {
    const year = String(yearLevel).trim();

    switch (year) {
        case "Year 7":
            return [34, 197, 94, 110];   // green
        case "Year 8":
            return [59, 130, 246, 110];  // blue
        case "Year 9":
            return [168, 85, 247, 110];  // purple
        case "Year 10":
            return [251, 146, 60, 110];  // orange
        case "Year 11":
            return [239, 68, 68, 110];   // red
        case "Year 12":
            return [236, 72, 153, 110];  // pink
        default:
            return [161, 161, 170, 80];  // zinc-ish fallback
    }
}

export function useLayers() {
    const { data, loading, error } = useSnowflakeData();

    const layers = useMemo(() => {
        if (loading || error) return [];

        return [
            new ScatterplotLayer({
                id: "students",
                data,
                pickable: true,
                stroked: false,
                filled: true,

                getPosition: (d: any) => [d.lon, d.lat],

                getRadius: 100,
                radiusUnits: "meters",
                radiusMinPixels: 2,
                radiusMaxPixels: 5,

                opacity: 0.8,
                getFillColor: (d: any) => getYearLevelColor(d.year_level),
            }),
        ];
    }, [data, loading, error]);

    return { layers, loading, error };
}