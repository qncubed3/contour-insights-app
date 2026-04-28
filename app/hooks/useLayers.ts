"use client";

import { useMemo, useState } from "react";
import { ScatterplotLayer, IconLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type {
    CampusSnowflakeRow,
    SnowflakeDataBundle,
    StudentSnowflakeRow,
} from "./useSnowflakeData";

export type SelectedMapObject =
    | { type: "student"; object: StudentSnowflakeRow }
    | { type: "campus"; object: CampusSnowflakeRow }
    | null;

type UseLayersArgs = {
    data: SnowflakeDataBundle;
    zoom: number;
};

function getYearLevelColor(yearLevel: string | number) {
    const year = String(yearLevel).trim();

    switch (year) {
        case "Year 7":
            return [34, 197, 94, 110];
        case "Year 8":
            return [59, 130, 246, 110];
        case "Year 9":
            return [168, 85, 247, 110];
        case "Year 10":
            return [251, 146, 60, 110];
        case "Year 11":
            return [239, 68, 68, 110];
        case "Year 12":
            return [236, 72, 153, 110];
        default:
            return [161, 161, 170, 80];
    }
}

function getOpacity(zoom: number) {
    const minZoom = 9;
    const maxZoom = 14;

    const t = Math.min(
        1,
        Math.max(0, (zoom - minZoom) / (maxZoom - minZoom))
    );

    return 0.3 + (1 - 0.3) * t;
}

export function useLayers({ data, zoom }: UseLayersArgs) {
    const [selectedObject, setSelectedObject] =
        useState<SelectedMapObject>(null);

    const layers = useMemo(() => {
        const opacity = getOpacity(zoom);

        return [
            new ScatterplotLayer<StudentSnowflakeRow>({
                id: "students",
                data: data.students,
                pickable: true,
                stroked: false,
                filled: true,

                getPosition: (d) => [d.lon, d.lat],

                getRadius: 100,
                radiusUnits: "meters",
                radiusMinPixels: 2,
                radiusMaxPixels: 5,

                opacity,
                getFillColor: (d) => getYearLevelColor(d.year_level),

                onClick: (info: PickingInfo<StudentSnowflakeRow>) => {
                    if (!info.object) return;

                    setSelectedObject({
                        type: "student",
                        object: info.object,
                    });
                },
            }),

            new IconLayer<CampusSnowflakeRow>({
                id: "campuses",
                data: data.campuses,
                pickable: true,
                opacity: 0.5,

                getPosition: (d) => [d.lon, d.lat],

                getIcon: () => ({
                    url: "/icons/contour_logo.png",
                    width: 128,
                    height: 128,
                    anchorY: 128,
                }),

                getSize: 24,
                sizeUnits: "pixels",

                onClick: (info: PickingInfo<CampusSnowflakeRow>) => {
                    if (!info.object) return;

                    setSelectedObject({
                        type: "campus",
                        object: info.object,
                    });
                },
            }),
        ];
    }, [data, zoom]);

    return {
        layers,
        selectedObject,
        setSelectedObject,
    };
}