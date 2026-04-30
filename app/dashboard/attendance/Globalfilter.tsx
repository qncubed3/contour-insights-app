import React from "react";
import { COLORS, FONT_FAMILY } from "./lib";
import { Card, FilterSelect } from "./ui";

export interface FilterState {
    yearLevel: string;
    campus: string;
    suburb: string;
    school: string;
    tutor: string;
    timeBucket: string;
    distanceMax: number;
    includeOver50: boolean;
    excludePurelyOnline: boolean;
}

export interface FilterOptions {
    yearLevel: string[];
    campus: string[];
    suburb: string[];
    school: string[];
    tutor: string[];
    timeBucket: string[];
}

interface Props {
    filters: FilterState;
    options: FilterOptions;
    onChange: (patch: Partial<FilterState>) => void;
}

export function GlobalFilters({ filters, options, onChange }: Props) {
    const handleDistanceSlider = (v: number) => {
        onChange({ distanceMax: v });
    };

    const handleIncludeOver50 = (checked: boolean) => {
        onChange({
            includeOver50: checked,
            // When toggling on, snap slider to 50 (its max); toggling off, restore
            distanceMax: checked ? 50 : filters.distanceMax,
        });
    };

    return (
        <Card className="p-6">
            <h2 className="text-base font-semibold mb-2" style={{ color: COLORS.text }}>
                Global Filters
            </h2>
            <div className="flex flex-wrap gap-3 items-end">
                <FilterSelect
                    label="Year Level"
                    value={filters.yearLevel}
                    onChange={(v) => onChange({ yearLevel: v })}
                    options={options.yearLevel}
                />
                <FilterSelect
                    label="Campus"
                    value={filters.campus}
                    onChange={(v) => onChange({ campus: v })}
                    options={options.campus}
                />
                <FilterSelect
                    label="Suburb"
                    value={filters.suburb}
                    onChange={(v) => onChange({ suburb: v })}
                    options={options.suburb.slice(0, 300)}
                />
                <FilterSelect
                    label="School"
                    value={filters.school}
                    onChange={(v) => onChange({ school: v })}
                    options={options.school.slice(0, 300)}
                />
                <FilterSelect
                    label="Tutor"
                    value={filters.tutor}
                    onChange={(v) => onChange({ tutor: v })}
                    options={options.tutor.slice(0, 300)}
                />
                <FilterSelect
                    label="Start Time"
                    value={filters.timeBucket}
                    onChange={(v) => onChange({ timeBucket: v })}
                    options={options.timeBucket}
                />

                {/* Distance slider */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>
                        Max Distance:{" "}
                        <span className="font-semibold" style={{ color: COLORS.text }}>
                            {filters.includeOver50 ? "50+ km" : `${filters.distanceMax} km`}
                        </span>
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={5}
                            max={50}
                            step={5}
                            value={Math.min(filters.distanceMax, 50)}
                            disabled={filters.includeOver50}
                            onChange={(e) => handleDistanceSlider(Number(e.target.value))}
                            className="w-32 accent-blue-500 disabled:opacity-40"
                        />
                        
                    </div>
                </div>

                {/* Exclude purely online */}
                <div className="flex gap-4 justify-end pb-0.5">
                    <label
                        className="flex items-center gap-1.5 cursor-pointer select-none text-xs"
                        style={{ color: COLORS.subtext }}
                    >
                        <input
                            type="checkbox"
                            checked={filters.includeOver50}
                            onChange={(e) => handleIncludeOver50(e.target.checked)}
                            className="rounded accent-blue-500"
                        />
                        <span>50+ km</span>
                    </label>
                    <label
                        className="flex items-center gap-1.5 cursor-pointer select-none text-xs"
                        style={{ color: COLORS.subtext }}
                    >
                        <input
                            type="checkbox"
                            checked={filters.excludePurelyOnline}
                            onChange={(e) => onChange({ excludePurelyOnline: e.target.checked })}
                            className="rounded accent-blue-500"
                        />
                        <span>Exclude purely online students</span>
                    </label>
                </div>
            </div>
        </Card>
    );
}