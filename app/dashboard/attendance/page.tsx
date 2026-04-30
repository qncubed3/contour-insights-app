"use client";

import React, { useState, useEffect, useMemo } from "react";
import { RawRow, Row, COLORS, FONT_FAMILY, enrich } from "./lib";
import { GlobalFilters, FilterState, FilterOptions } from "./Globalfilter";
import { ExecutiveSummary, KpiRow } from "./Summarysection";
import { ModalityDonutRow } from "./Modalitydonutrow";
import { TutorAbsenceChart } from "./Tutorabsencechart";
import { DistanceAnalysisGrid } from "./Distancecharts";
import { SuburbAbsenceChart } from "./Suburbabsencechart";
import { CampusSuburbSection } from "./Campussuburbsection";
import { HighFrictionTable } from "./Highfrictiontable";
import { SegmentBreakdownTable } from "./Segmentbreakdowntable";
import { RecommendationsCard, CaveatsCard } from "./Staticcards";



// ─── Default filter state ─────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
    yearLevel: "All",
    campus: "All",
    suburb: "All",
    school: "All",
    tutor: "All",
    timeBucket: "All",
    distanceMax: 50,
    includeOver50: false,
    excludePurelyOnline: false,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentCommuteFrictionDashboard() {
    const [rawData, setRawData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/snowflake/attendance");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                setRawData((json.data as RawRow[]).map(enrich));
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── Filter options (derived from raw data, never changes) ──────────────────
    const filterOptions = useMemo<FilterOptions>(() => {
        const uniq = (arr: (string | undefined | null)[]) =>
            ["All", ...Array.from(new Set(arr.filter(Boolean))).sort()] as string[];
        return {
            yearLevel: uniq(rawData.map((r) => r.year_level)),
            campus: uniq(rawData.map((r) => r.campus)),
            suburb: uniq(rawData.map((r) => r.suburb)),
            school: uniq(rawData.map((r) => r.school_name)),
            tutor: uniq(rawData.map((r) => r.prim_tutor)),
            timeBucket: ["All", "Morning", "Afternoon", "After School", "Evening"],
        };
    }, [rawData]);

    // ── Globally filtered dataset ──────────────────────────────────────────────
    const data = useMemo<Row[]>(() => {
        return rawData.filter((r) => {
            if (!filters.includeOver50 && r.distance_km >= 50) return false;
            if (filters.includeOver50 && r.distance_km > filters.distanceMax && filters.distanceMax < 50) return false;
            if (!filters.includeOver50 && r.distance_km > filters.distanceMax) return false;
            if (filters.excludePurelyOnline && r.in_person_rate === 0) return false;
            if (filters.yearLevel !== "All" && r.year_level !== filters.yearLevel) return false;
            if (filters.suburb !== "All" && r.suburb !== filters.suburb) return false;
            if (filters.school !== "All" && r.school_name !== filters.school) return false;
            if (filters.tutor !== "All" && r.prim_tutor !== filters.tutor) return false;
            if (filters.campus !== "All" && r.campus !== filters.campus) return false;
            if (filters.timeBucket !== "All" && r.start_time_bucket !== filters.timeBucket) return false;
            return true;
        });
    }, [rawData, filters]);

    // Under-50 slice used for distance-sensitive threshold charts
    const dataUnder50 = useMemo(() => data.filter((r) => r.distance_km < 50), [data]);

    // Campus list for per-campus section
    const campusList = useMemo(
        () => Array.from(new Set(data.map((r) => r.campus).filter(Boolean))) as string[],
        [data]
    );

    const handleFilterChange = (patch: Partial<FilterState>) =>
        setFilters((prev) => ({ ...prev, ...patch }));

    // ─── Loading ─────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div
                        className="w-10 h-10 rounded-full border-4 animate-spin mx-auto mb-4"
                        style={{ borderColor: `${COLORS.border} ${COLORS.border} ${COLORS.border} ${COLORS.inPerson}` }}
                    />
                    <p style={{ color: COLORS.subtext, fontFamily: FONT_FAMILY }}>Loading attendance data…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
                <div className="rounded-xl border bg-white shadow-sm p-8 max-w-md text-center" style={{ borderColor: COLORS.border }}>
                    <p className="text-red-500 font-semibold mb-2">Failed to load data</p>
                    <p style={{ color: COLORS.subtext, fontFamily: FONT_FAMILY }}>{error}</p>
                </div>
            </div>
        );
    }

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-100">

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div
                className="px-8 py-5 flex items-center justify-between flex-wrap gap-3"
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[rgb(35,51,92)]">
                        Student Attendance Analysis
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        Operational analytics · Distance vs attendance modality
                    </p>
                </div>
                {/* <span
                    className="text-xs px-3 py-1 rounded-full font-medium"
                    style={{ background: "#1E3A5F", color: "#60A5FA" }}
                >
                    {data.length.toLocaleString()} records
                </span> */}
            </div>

            {/* ── Main content ───────────────────────────────────────────────────── */}
            <div className="px-6 space-y-6 max-w-screen-2xl mx-auto">

                {/* 1 · Executive summary */}
                <ExecutiveSummary data={data} dataUnder50={dataUnder50} />
                
                {/* 2 · Filters */}
                <GlobalFilters filters={filters} options={filterOptions} onChange={handleFilterChange} />                

                {/* 3 · KPI cards */}
                <KpiRow data={data} dataUnder50={dataUnder50} />

                {/* 4 · Modality donuts */}
                <ModalityDonutRow data={data} />

                {/* 5 · Tutor absence bar (full width) */}
                <TutorAbsenceChart data={data} />

                {/* 6 · Distance analysis 2×2 */}
                <DistanceAnalysisGrid data={data} dataUnder50={dataUnder50} />

                {/* 7 · Suburb absence (full width) */}
                <SuburbAbsenceChart data={data} />

                {/* 8 · Per-campus suburb breakdown */}
                <CampusSuburbSection data={data} campusList={campusList} />

                {/* 9 · High-friction student table */}
                <HighFrictionTable data={data} />

                {/* 10 · Segment breakdown */}
                <SegmentBreakdownTable data={data} />

                {/* 11 · Recommendations */}
                <RecommendationsCard />

                {/* 12 · Caveats */}
                <CaveatsCard />

            </div>
        </div>
    );
}