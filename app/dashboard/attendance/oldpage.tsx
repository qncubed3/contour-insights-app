"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawRow {
    student_id: number;
    address?: string;
    suburb?: string;
    postcode?: string;
    country?: string;
    year_level?: string;
    school_name?: string;
    region?: string;
    gender?: string;
    grad_yr?: number;
    prim_tutor?: string;
    secondary_tutor?: string;
    in_person_rate: number;
    online_rate: number;
    campus?: string;
    start_time?: string;
    distance_km: number;
    friction_score?: number;
    distance_bucket?: string;
}

interface Row extends RawRow {
    absent_rate: number;
    travel_burden: number;
    distance_bin: string;
    start_time_bucket: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISTANCE_BINS = [
    "0–5km",
    "5–10km",
    "10–15km",
    "15–20km",
    "20–30km",
    "30–40km",
    "40–50km",
    "50+km",
];

const COLORS = {
    inPerson: "#2563EB",
    online: "#7C3AED",
    absent: "#F59E0B",
    accent: "#0EA5E9",
    danger: "#EF4444",
    muted: "#94A3B8",
    bg: "#F8FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    subtext: "#64748B",
};

const FONT_FAMILY = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

function getDistanceBin(d: number): string {
    if (d < 5) return "0–5km";
    if (d < 10) return "5–10km";
    if (d < 15) return "10–15km";
    if (d < 20) return "15–20km";
    if (d < 30) return "20–30km";
    if (d < 40) return "30–40km";
    if (d < 50) return "40–50km";
    return "50+km";
}

function getStartTimeBucket(t?: string): string {
    if (!t) return "Unknown";
    const [h] = t.split(":").map(Number);
    if (h < 12) return "Morning";
    if (h < 16) return "Afternoon";
    if (h < 18) return "After School";
    return "Evening";
}

function enrich(raw: RawRow): Row {
    const absent_rate = clamp(
        1 - (raw.in_person_rate ?? 0) - (raw.online_rate ?? 0),
        0,
        1
    );
    const travel_burden = (raw.distance_km ?? 0) * (raw.in_person_rate ?? 0);
    const distance_bin = getDistanceBin(raw.distance_km ?? 0);
    const start_time_bucket = getStartTimeBucket(raw.start_time);
    return { ...raw, absent_rate, travel_burden, distance_bin, start_time_bucket };
}

function pct(v: number, decimals = 1) {
    return `${(v * 100).toFixed(decimals)}%`;
}

function avg(arr: number[]) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr: number[]) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function groupBy<T>(arr: T[], key: (r: T) => string): Map<string, T[]> {
    const m = new Map<string, T[]>();
    arr.forEach((r) => {
        const k = key(r);
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(r);
    });
    return m;
}

// ─── Plotly layout defaults ───────────────────────────────────────────────────

function baseLayout(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: FONT_FAMILY, color: COLORS.text, size: 12 },
        margin: { t: 10, b: 48, l: 56, r: 16 },
        legend: { orientation: "h", y: -0.22, x: 0, font: { size: 11 } },
        hoverlabel: {
            bgcolor: "#1E293B",
            bordercolor: "#334155",
            font: { color: "#F8FAFC", family: FONT_FAMILY, size: 12 },
        },
        ...overrides,
    };
}

const plotConfig = { displayModeBar: false, responsive: true };

// ─── Sub-components ───────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-xl border bg-white shadow-sm ${className}`}
            style={{ borderColor: COLORS.border }}
        >
            {children}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="text-base font-semibold tracking-tight mb-4"
            style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}
        >
            {children}
        </h2>
    );
}

function InsightBadge({ text }: { text: string }) {
    return (
        <p
            className="mt-3 text-xs leading-relaxed px-3 py-2 rounded-lg"
            style={{ color: COLORS.subtext, background: "#F1F5F9", fontFamily: FONT_FAMILY }}
        >
            <span className="font-semibold" style={{ color: COLORS.accent }}>
                Insight:{" "}
            </span>
            {text}
        </p>
    );
}

function ChartCard({
    title,
    insight,
    children,
    controls,
}: {
    title: string;
    insight: string;
    children: React.ReactNode;
    controls?: React.ReactNode;
}) {
    return (
        <Card className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <h3 className="text-sm font-semibold" style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}>
                    {title}
                </h3>
                {controls}
            </div>
            <div className="flex-1">{children}</div>
            <InsightBadge text={insight} />
        </Card>
    );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: COLORS.subtext }}>
                {label}
            </span>
            <span className="text-3xl font-bold" style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}>
                {value}
            </span>
            {sub && <span className="text-xs" style={{ color: COLORS.muted }}>{sub}</span>}
        </Card>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                style={{
                    borderColor: COLORS.border,
                    fontFamily: FONT_FAMILY,
                    color: COLORS.text,
                    background: "#F8FAFC",
                    maxWidth: 180,
                }}
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function StudentCommuteFrictionDashboard() {
    const [rawData, setRawData] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Global filters
    const [filterYearLevel, setFilterYearLevel] = useState("All");
    const [filterSuburb, setFilterSuburb] = useState("All");
    const [filterSchool, setFilterSchool] = useState("All");
    const [filterTutor, setFilterTutor] = useState("All");
    const [filterCampus, setFilterCampus] = useState("All");
    const [filterDistanceMax, setFilterDistanceMax] = useState(9999);
    const [filterTimeBucket, setFilterTimeBucket] = useState("All");
    const [includeOver50, setIncludeOver50] = useState(true);

    // Table state
    const [tableSearch, setTableSearch] = useState("");
    const [tableSortField, setTableSortField] = useState<keyof Row>("travel_burden");
    const [tableSortDir, setTableSortDir] = useState<"asc" | "desc">("desc");
    const [segmentDimension, setSegmentDimension] = useState("year_level");
    const [segmentMinN, setSegmentMinN] = useState(10);
    const [segmentSortField, setSegmentSortField] = useState("avgAbsent");

    // Chart-level controls
    const [pieMode, setPieMode] = useState<"overall" | "tutor">("overall");
    const [suburbTopN, setSuburbTopN] = useState(15);
    const [campusTopN, setCampusTopN] = useState(8);
    const [selectedCampusForSuburb, setSelectedCampusForSuburb] = useState("All");
    const [campusSuburbMetric, setCampusSuburbMetric] = useState<"absent" | "inPerson" | "online">("absent");

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/snowflake/attendance");
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const rows: Row[] = (json.data as RawRow[]).map(enrich);
                setRawData(rows);
            } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // ── Global filtered dataset ───────────────────────────────────────────────
    const data = useMemo(() => {
        return rawData.filter((r) => {
            if (!includeOver50 && r.distance_km >= 50) return false;
            if (filterDistanceMax < 9999 && r.distance_km > filterDistanceMax) return false;
            if (filterYearLevel !== "All" && r.year_level !== filterYearLevel) return false;
            if (filterSuburb !== "All" && r.suburb !== filterSuburb) return false;
            if (filterSchool !== "All" && r.school_name !== filterSchool) return false;
            if (filterTutor !== "All" && r.prim_tutor !== filterTutor) return false;
            if (filterCampus !== "All" && r.campus !== filterCampus) return false;
            if (filterTimeBucket !== "All" && r.start_time_bucket !== filterTimeBucket) return false;
            return true;
        });
    }, [
        rawData,
        includeOver50,
        filterDistanceMax,
        filterYearLevel,
        filterSuburb,
        filterSchool,
        filterTutor,
        filterCampus,
        filterTimeBucket,
    ]);

    // Under-50 slice for distance-sensitive charts
    const dataUnder50 = useMemo(() => data.filter((r) => r.distance_km < 50), [data]);

    // ── Filter options ────────────────────────────────────────────────────────
    const opts = useMemo(() => {
        const uniq = (arr: (string | undefined | null)[]) =>
            ["All", ...Array.from(new Set(arr.filter(Boolean))).sort()] as string[];
        return {
            yearLevel: uniq(rawData.map((r) => r.year_level)),
            suburb: uniq(rawData.map((r) => r.suburb)),
            school: uniq(rawData.map((r) => r.school_name)),
            tutor: uniq(rawData.map((r) => r.prim_tutor)),
            campus: uniq(rawData.map((r) => r.campus)),
            timeBucket: ["All", "Morning", "Afternoon", "After School", "Evening"],
        };
    }, [rawData]);

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const kpis = useMemo(() => {
        const totalStudents = new Set(data.map((r) => r.student_id)).size;
        const medianDist = median(data.map((r) => r.distance_km));
        const gt10 = data.filter((r) => r.distance_km > 10).length;
        const gt20 = data.filter((r) => r.distance_km > 20).length;
        const pct10 = data.length ? gt10 / data.length : 0;
        const pct20 = data.length ? gt20 / data.length : 0;
        const le10 = dataUnder50.filter((r) => r.distance_km <= 10);
        const grt20 = dataUnder50.filter((r) => r.distance_km > 20);
        const avgAbsLe10 = avg(le10.map((r) => r.absent_rate));
        const avgAbsGt20 = avg(grt20.map((r) => r.absent_rate));
        const absUplift = avgAbsLe10 > 0 ? avgAbsGt20 / avgAbsLe10 : 0;
        return { totalStudents, medianDist, pct10, pct20, absUplift };
    }, [data, dataUnder50]);

    // ── Chart 1: Stacked bar by distance bin ─────────────────────────────────
    const chart1Data = useMemo(() => {
        return DISTANCE_BINS.map((bin) => {
            const rows = data.filter((r) => r.distance_bin === bin);
            return {
                bin,
                n: rows.length,
                inPerson: avg(rows.map((r) => r.in_person_rate)),
                online: avg(rows.map((r) => r.online_rate)),
                absent: avg(rows.map((r) => r.absent_rate)),
            };
        }).filter((d) => d.n > 0);
    }, [data]);

    const chart1Traces = useMemo(() => {
        const bins = chart1Data.map((d) => d.bin);

        const make = (
            name: string,
            values: number[],
            color: string
        ): Record<string, unknown> => ({
            name,
            type: "bar",
            x: bins,
            y: values,
            marker: { color },
            customdata: chart1Data.map((d) => [d.n, d.inPerson, d.online, d.absent]),
            hovertemplate:
                "<b>%{x}</b><br>" +
                "n = %{customdata[0]}<br>" +
                "In-person: %{customdata[1]:.1%}<br>" +
                "Online: %{customdata[2]:.1%}<br>" +
                "Absent: %{customdata[3]:.1%}" +
                "<extra></extra>",
        });

        return [
            make("In-Person", chart1Data.map((d) => d.inPerson), COLORS.inPerson),
            make("Online", chart1Data.map((d) => d.online), COLORS.online),
            make("Absent", chart1Data.map((d) => d.absent), COLORS.absent),
        ];
    }, [chart1Data]);

    // ── Chart 2: Boxplot by distance bin ─────────────────────────────────────
    const chart2Traces = useMemo(() => {
        return DISTANCE_BINS.map((bin) => {
            const rows = data.filter((r) => r.distance_bin === bin);
            if (!rows.length) return null;
            return {
                type: "box",
                name: bin,
                y: rows.map((r) => r.in_person_rate),
                boxpoints: false,
                marker: { color: COLORS.inPerson },
                line: { color: COLORS.inPerson },
                fillcolor: `${COLORS.inPerson}22`,
                hovertemplate: `<b>${bin}</b><br>n=${rows.length}<br>Median: %{median:.1%}<br>Q1: %{q1:.1%}<br>Q3: %{q3:.1%}<extra></extra>`,
                x0: bin,
            };
        }).filter(Boolean);
    }, [data]);

    // ── Chart 3: Absence by threshold (under 50km) ────────────────────────────
    const chart3Data = useMemo(() => {
        return [
            { label: "≤ 10 km", rows: dataUnder50.filter((r) => r.distance_km <= 10) },
            { label: "> 10 km", rows: dataUnder50.filter((r) => r.distance_km > 10) },
            { label: "> 15 km", rows: dataUnder50.filter((r) => r.distance_km > 15) },
            { label: "> 20 km", rows: dataUnder50.filter((r) => r.distance_km > 20) },
            { label: "> 30 km", rows: dataUnder50.filter((r) => r.distance_km > 30) },
        ].map((g) => ({
            label: g.label,
            n: g.rows.length,
            avgAbsent: avg(g.rows.map((r) => r.absent_rate)),
        }));
    }, [dataUnder50]);

    // ── Chart 4: Travel burden histogram ─────────────────────────────────────
    const chart4Burdens = useMemo(() => data.map((r) => r.travel_burden), [data]);

    // ── Pie / per-tutor stacked bar ───────────────────────────────────────────
    const tutorSeries = useMemo(() => {
        const tutorMap = groupBy(data, (r) => r.prim_tutor ?? "Unknown");
        return Array.from(tutorMap.entries())
            .filter(([, rows]) => rows.length >= 5)
            .map(([tutor, rows]) => ({
                tutor,
                n: rows.length,
                inPerson: avg(rows.map((r) => r.in_person_rate)),
                online: avg(rows.map((r) => r.online_rate)),
                absent: avg(rows.map((r) => r.absent_rate)),
            }))
            .sort((a, b) => a.absent - b.absent); // low → high absence
    }, [data]);

    const overallMix = useMemo(() => ({
        inPerson: avg(data.map((r) => r.in_person_rate)),
        online: avg(data.map((r) => r.online_rate)),
        absent: avg(data.map((r) => r.absent_rate)),
    }), [data]);

    // ── Suburb absence ranking ────────────────────────────────────────────────
    const suburbRanking = useMemo(() => {
        const map = groupBy(data, (r) => r.suburb ?? "Unknown");
        return Array.from(map.entries())
            .filter(([, rows]) => rows.length >= 5)
            .map(([suburb, rows]) => ({
                suburb,
                n: rows.length,
                absent: avg(rows.map((r) => r.absent_rate)),
                inPerson: avg(rows.map((r) => r.in_person_rate)),
                online: avg(rows.map((r) => r.online_rate)),
                avgDist: avg(rows.map((r) => r.distance_km)),
                campus: Array.from(new Set(rows.map((r) => r.campus).filter(Boolean))).join(", "),
            }))
            .sort((a, b) => b.absent - a.absent)
            .slice(0, suburbTopN);
    }, [data, suburbTopN]);

    // ── Per-campus suburb breakdown ───────────────────────────────────────────
    const campusList = useMemo(
        () => Array.from(new Set(data.map((r) => r.campus).filter(Boolean))) as string[],
        [data]
    );

    const campusSuburbData = useMemo(() => {
        const filter = selectedCampusForSuburb === "All" ? campusList : [selectedCampusForSuburb];
        const result: Record<
            string,
            { suburb: string; n: number; absent: number; inPerson: number; online: number; avgDist: number }[]
        > = {};
        filter.forEach((campus) => {
            const campusRows = data.filter((r) => r.campus === campus);
            const subMap = groupBy(campusRows, (r) => r.suburb ?? "Unknown");
            result[campus] = Array.from(subMap.entries())
                .filter(([, rows]) => rows.length >= 3)
                .map(([suburb, rows]) => ({
                    suburb,
                    n: rows.length,
                    absent: avg(rows.map((r) => r.absent_rate)),
                    inPerson: avg(rows.map((r) => r.in_person_rate)),
                    online: avg(rows.map((r) => r.online_rate)),
                    avgDist: avg(rows.map((r) => r.distance_km)),
                }));
        });
        return result;
    }, [data, campusList, selectedCampusForSuburb]);

    // ── High-friction table ───────────────────────────────────────────────────
    const highFrictionRows = useMemo(() => {
        return data
            .filter((r) => r.distance_km > 20 && r.in_person_rate >= 0.5)
            .filter((r) => {
                if (!tableSearch) return true;
                const q = tableSearch.toLowerCase();
                return (
                    String(r.student_id).includes(q) ||
                    (r.suburb ?? "").toLowerCase().includes(q) ||
                    (r.school_name ?? "").toLowerCase().includes(q) ||
                    (r.prim_tutor ?? "").toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                const va = a[tableSortField] as number;
                const vb = b[tableSortField] as number;
                return tableSortDir === "desc" ? vb - va : va - vb;
            });
    }, [data, tableSearch, tableSortField, tableSortDir]);

    const exportCSV = useCallback(() => {
        const cols: (keyof Row)[] = [
            "student_id", "suburb", "postcode", "school_name", "year_level",
            "campus", "distance_km", "in_person_rate", "online_rate", "absent_rate",
            "travel_burden", "prim_tutor", "start_time",
        ];
        const header = cols.join(",");
        const rows = highFrictionRows.map((r) =>
            cols.map((c) => {
                const v = r[c];
                return typeof v === "string" && v.includes(",") ? `"${v}"` : (v ?? "");
            }).join(",")
        );
        const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "high_friction_students.csv";
        a.click();
    }, [highFrictionRows]);

    // ── Segment table ─────────────────────────────────────────────────────────
    const segmentRows = useMemo(() => {
        const groups = new Map<string, Row[]>();
        data.forEach((r) => {
            const key = String((r as Record<string, unknown>)[segmentDimension] ?? "Unknown");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(r);
        });
        return Array.from(groups.entries())
            .filter(([, rows]) => rows.length >= segmentMinN)
            .map(([key, rows]) => ({
                key,
                n: rows.length,
                avgDist: avg(rows.map((r) => r.distance_km)),
                avgInPerson: avg(rows.map((r) => r.in_person_rate)),
                avgOnline: avg(rows.map((r) => r.online_rate)),
                avgAbsent: avg(rows.map((r) => r.absent_rate)),
                avgBurden: avg(rows.map((r) => r.travel_burden)),
            }))
            .sort((a, b) => {
                const va = a[segmentSortField as keyof typeof a] as number;
                const vb = b[segmentSortField as keyof typeof b] as number;
                return vb - va;
            });
    }, [data, segmentDimension, segmentMinN, segmentSortField]);

    const plotH = 320;

    // ─── Loading / error ────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
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
                <Card className="p-8 max-w-md text-center">
                    <p className="text-red-500 font-semibold mb-2">Failed to load data</p>
                    <p style={{ color: COLORS.subtext, fontFamily: FONT_FAMILY }}>{error}</p>
                </Card>
            </div>
        );
    }

    // ─── Main render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen" style={{ background: COLORS.bg, fontFamily: FONT_FAMILY, color: COLORS.text }}>

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div
                className="border-b px-8 py-5 flex items-center justify-between flex-wrap gap-3"
                style={{ background: "#0F172A", borderColor: "#1E293B" }}
            >
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">
                        Student Commute Friction Dashboard
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                        Operational analytics · Distance vs attendance modality
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <span
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ background: "#1E3A5F", color: "#60A5FA" }}
                    >
                        {data.length.toLocaleString()} records
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={includeOver50}
                            onChange={(e) => setIncludeOver50(e.target.checked)}
                            className="rounded accent-blue-400"
                        />
                        <span className="text-xs" style={{ color: "#CBD5E1" }}>Include 50+ km</span>
                    </label>
                </div>
            </div>

            <div className="px-8 py-6 space-y-6 max-w-screen-2xl mx-auto">

                {/* ── Filters ───────────────────────────────────────────────────────── */}
                <Card className="p-4">
                    <div className="flex flex-wrap gap-3 items-end">
                        <FilterSelect label="Year Level" value={filterYearLevel} onChange={setFilterYearLevel} options={opts.yearLevel} />
                        <FilterSelect label="Campus" value={filterCampus} onChange={setFilterCampus} options={opts.campus} />
                        <FilterSelect label="Suburb" value={filterSuburb} onChange={setFilterSuburb} options={opts.suburb.slice(0, 300)} />
                        <FilterSelect label="School" value={filterSchool} onChange={setFilterSchool} options={opts.school.slice(0, 300)} />
                        <FilterSelect label="Tutor" value={filterTutor} onChange={setFilterTutor} options={opts.tutor.slice(0, 300)} />
                        <FilterSelect label="Start Time" value={filterTimeBucket} onChange={setFilterTimeBucket} options={opts.timeBucket} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>
                                Max Distance: {filterDistanceMax >= 9999 ? "No limit" : `${filterDistanceMax} km`}
                            </label>
                            <input
                                type="range" min={5} max={9999} step={5}
                                value={filterDistanceMax}
                                onChange={(e) => setFilterDistanceMax(Number(e.target.value))}
                                className="w-36 accent-blue-500"
                            />
                        </div>
                    </div>
                </Card>

                {/* ── Executive Summary ──────────────────────────────────────────────── */}
                <Card className="p-6" style={{ borderLeft: `4px solid ${COLORS.inPerson}` }}>
                    <h2 className="text-base font-semibold mb-2" style={{ color: COLORS.text }}>
                        Distance appears to create measurable attendance friction
                    </h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.subtext }}>
                        Students further from campus are less likely to attend in person and more likely to be absent.
                        Contour appears to adapt by shifting distant students more online, but absence still rises,
                        suggesting the current adjustment may not fully offset commute friction.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {[
                            {
                                label: "Absence uplift >20 km vs ≤10 km",
                                value: `${kpis.absUplift.toFixed(2)}×`,
                            },
                            {
                                label: "In-person rate ≤10 km",
                                value: pct(avg(dataUnder50.filter((r) => r.distance_km <= 10).map((r) => r.in_person_rate))),
                            },
                            {
                                label: "In-person rate >20 km",
                                value: pct(avg(dataUnder50.filter((r) => r.distance_km > 20).map((r) => r.in_person_rate))),
                            },
                        ].map((m) => (
                            <div key={m.label} className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ background: "#F1F5F9" }}>
                                <span className="text-xl font-bold" style={{ color: COLORS.inPerson }}>{m.value}</span>
                                <span className="text-xs" style={{ color: COLORS.subtext }}>{m.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <KpiCard label="Students analysed" value={kpis.totalStudents.toLocaleString()} sub="unique student IDs" />
                    <KpiCard label="Median distance" value={`${kpis.medianDist.toFixed(1)} km`} sub="to campus" />
                    <KpiCard label="Students > 10 km" value={pct(kpis.pct10)} sub={`${data.filter((r) => r.distance_km > 10).length.toLocaleString()} records`} />
                    <KpiCard label="Students > 20 km" value={pct(kpis.pct20)} sub={`${data.filter((r) => r.distance_km > 20).length.toLocaleString()} records`} />
                    <KpiCard label="Absence uplift" value={`${kpis.absUplift.toFixed(2)}×`} sub=">20 km vs ≤10 km" />
                </div>

                {/* ── Modality pie + tutor ranked bar ───────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Pie / per-tutor stacked bar */}
                    <ChartCard
                        title="Overall Modality Split"
                        insight="The aggregate modality mix across all filtered records. Switch to Per Tutor to see how each tutor's cohort is allocated."
                        controls={
                            <div className="flex gap-0 rounded-lg overflow-hidden border text-xs" style={{ borderColor: COLORS.border }}>
                                {(["overall", "tutor"] as const).map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setPieMode(m)}
                                        className="px-3 py-1 font-medium transition-colors"
                                        style={{
                                            background: pieMode === m ? COLORS.inPerson : "#F8FAFC",
                                            color: pieMode === m ? "#fff" : COLORS.subtext,
                                        }}
                                    >
                                        {m === "overall" ? "Overall" : "Per Tutor"}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        {pieMode === "overall" ? (
                            <Plot
                                data={[
                                    {
                                        type: "pie",
                                        labels: ["In-Person", "Online", "Absent"],
                                        values: [overallMix.inPerson, overallMix.online, overallMix.absent],
                                        marker: { colors: [COLORS.inPerson, COLORS.online, COLORS.absent] },
                                        hole: 0.45,
                                        textinfo: "label+percent",
                                        hovertemplate: "<b>%{label}</b><br>%{percent}<extra></extra>",
                                        textfont: { family: FONT_FAMILY, size: 12 },
                                    } as Plotly.Data,
                                ]}
                                layout={{
                                    ...baseLayout({ height: plotH }),
                                    margin: { t: 20, b: 20, l: 20, r: 20 },
                                    showlegend: true,
                                    legend: { orientation: "h", y: -0.1, x: 0.5, xanchor: "center" },
                                } as Partial<Plotly.Layout>}
                                config={plotConfig}
                                style={{ width: "100%", height: plotH }}
                                useResizeHandler
                            />
                        ) : (
                            <Plot
                                data={[
                                    {
                                        type: "bar",
                                        name: "In-Person",
                                        x: tutorSeries.map((t) => t.tutor),
                                        y: tutorSeries.map((t) => t.inPerson),
                                        marker: { color: COLORS.inPerson },
                                        hovertemplate: "<b>%{x}</b><br>In-person: %{y:.1%}<extra></extra>",
                                    } as Plotly.Data,
                                    {
                                        type: "bar",
                                        name: "Online",
                                        x: tutorSeries.map((t) => t.tutor),
                                        y: tutorSeries.map((t) => t.online),
                                        marker: { color: COLORS.online },
                                        hovertemplate: "<b>%{x}</b><br>Online: %{y:.1%}<extra></extra>",
                                    } as Plotly.Data,
                                    {
                                        type: "bar",
                                        name: "Absent",
                                        x: tutorSeries.map((t) => t.tutor),
                                        y: tutorSeries.map((t) => t.absent),
                                        marker: { color: COLORS.absent },
                                        hovertemplate: "<b>%{x}</b><br>Absent: %{y:.1%}<extra></extra>",
                                    } as Plotly.Data,
                                ]}
                                layout={{
                                    ...baseLayout({ barmode: "stack", height: plotH }),
                                    xaxis: { tickangle: -35, tickfont: { size: 10 }, gridcolor: "#F1F5F9" },
                                    yaxis: { tickformat: ".0%", range: [0, 1], gridcolor: "#F1F5F9" },
                                } as Partial<Plotly.Layout>}
                                config={plotConfig}
                                style={{ width: "100%", height: plotH }}
                                useResizeHandler
                            />
                        )}
                    </ChartCard>

                    {/* Tutors ranked by absence — horizontal bar */}
                    <ChartCard
                        title="Tutors Ranked by Absence Rate (low → high)"
                        insight="Tutors at the right end of this chart have higher cohort absence rates. Differences may reflect student cohort composition, subject mix, or timetabling rather than tutor performance alone."
                    >
                        <Plot
                            data={[
                                {
                                    type: "bar",
                                    orientation: "h",
                                    x: [...tutorSeries].map((t) => t.absent),
                                    y: [...tutorSeries].map((t) => t.tutor),
                                    marker: {
                                        color: [...tutorSeries].map((t) =>
                                            t.absent > 0.22 ? COLORS.danger : t.absent > 0.15 ? COLORS.absent : COLORS.inPerson
                                        ),
                                    },
                                    customdata: [...tutorSeries].map((t) => [t.n, t.inPerson, t.online, t.absent]),
                                    hovertemplate:
                                        "<b>%{y}</b><br>n = %{customdata[0]}<br>" +
                                        "In-person: %{customdata[1]:.1%}<br>" +
                                        "Online: %{customdata[2]:.1%}<br>" +
                                        "Absent: %{customdata[3]:.1%}<extra></extra>",
                                } as Plotly.Data,
                            ]}
                            layout={{
                                ...baseLayout({
                                    height: Math.max(plotH, tutorSeries.length * 22 + 60),
                                }),
                                margin: { t: 10, b: 40, l: 140, r: 16 },
                                xaxis: { tickformat: ".0%", gridcolor: "#F1F5F9" },
                                yaxis: { tickfont: { size: 10 }, automargin: true },
                                showlegend: false,
                            } as Partial<Plotly.Layout>}
                            config={plotConfig}
                            style={{ width: "100%", height: Math.max(plotH, tutorSeries.length * 22 + 60) }}
                            useResizeHandler
                        />
                    </ChartCard>
                </div>

                {/* ── Distance modality mix + boxplot ───────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard
                        title="Average Modality Mix by Distance Bin"
                        insight="As distance increases, in-person share falls and online share rises, but absence also increases, suggesting online substitution only partially offsets distance friction."
                    >
                        <Plot
                            data={chart1Traces as Plotly.Data[]}
                            layout={{
                                ...baseLayout({ barmode: "stack", height: plotH }),
                                xaxis: {
                                    tickfont: { size: 11 },
                                    gridcolor: "#F1F5F9",
                                    categoryarray: DISTANCE_BINS,
                                    categoryorder: "array",
                                },
                                yaxis: { tickformat: ".0%", range: [0, 1], gridcolor: "#F1F5F9" },
                            } as Partial<Plotly.Layout>}
                            config={plotConfig}
                            style={{ width: "100%", height: plotH }}
                            useResizeHandler
                        />
                    </ChartCard>

                    <ChartCard
                        title="In-Person Rate Distribution by Distance Bin"
                        insight="The distribution of in-person participation shifts downward with distance, showing that distant students are generally allocated less in-person delivery."
                    >
                        <Plot
                            data={chart2Traces as Plotly.Data[]}
                            layout={{
                                ...baseLayout({ height: plotH }),
                                xaxis: {
                                    tickfont: { size: 10 },
                                    gridcolor: "#F1F5F9",
                                    categoryarray: DISTANCE_BINS,
                                    categoryorder: "array",
                                },
                                yaxis: { tickformat: ".0%", range: [0, 1], gridcolor: "#F1F5F9" },
                                showlegend: false,
                            } as Partial<Plotly.Layout>}
                            config={plotConfig}
                            style={{ width: "100%", height: plotH }}
                            useResizeHandler
                        />
                    </ChartCard>
                </div>

                {/* ── Absence threshold + travel burden ─────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <ChartCard
                        title="Average Absence Rate by Distance Threshold (< 50 km)"
                        insight="This helps identify the distance threshold where absence begins to materially increase and where intervention rules could be introduced."
                    >
                        <Plot
                            data={[
                                {
                                    type: "bar",
                                    x: chart3Data.map((d) => d.label),
                                    y: chart3Data.map((d) => d.avgAbsent),
                                    marker: {
                                        color: chart3Data.map((d) =>
                                            d.avgAbsent > 0.18 ? COLORS.danger : d.avgAbsent > 0.14 ? COLORS.absent : COLORS.inPerson
                                        ),
                                    },
                                    customdata: chart3Data.map((d) => [d.n, d.avgAbsent]),
                                    hovertemplate:
                                        "<b>%{x}</b><br>n = %{customdata[0]}<br>Avg absent: %{customdata[1]:.1%}<extra></extra>",
                                } as Plotly.Data,
                            ]}
                            layout={{
                                ...baseLayout({ height: plotH }),
                                yaxis: { tickformat: ".0%", gridcolor: "#F1F5F9" },
                                xaxis: { gridcolor: "#F1F5F9" },
                                showlegend: false,
                            } as Partial<Plotly.Layout>}
                            config={plotConfig}
                            style={{ width: "100%", height: plotH }}
                            useResizeHandler
                        />
                    </ChartCard>

                    <ChartCard
                        title="Travel Burden Distribution (distance × in-person rate)"
                        insight="A subset of students carry disproportionately high travel burden and should be reviewed for possible timetable, modality, or campus reassignment."
                    >
                        <Plot
                            data={[
                                {
                                    type: "histogram",
                                    x: chart4Burdens,
                                    nbinsx: 40,
                                    marker: { color: COLORS.inPerson, opacity: 0.85 },
                                    hovertemplate: "Burden: %{x:.1f}<br>Count: %{y}<extra></extra>",
                                } as Plotly.Data,
                            ]}
                            layout={{
                                ...baseLayout({ height: plotH }),
                                xaxis: { title: "Travel Burden", gridcolor: "#F1F5F9" },
                                yaxis: { title: "Records", gridcolor: "#F1F5F9" },
                                showlegend: false,
                            } as Partial<Plotly.Layout>}
                            config={plotConfig}
                            style={{ width: "100%", height: plotH }}
                            useResizeHandler
                        />
                    </ChartCard>
                </div>

                {/* ── Suburb absence ranking ────────────────────────────────────────── */}
                <ChartCard
                    title="Suburbs with Highest Absence Rate"
                    insight="These suburbs have the highest average absence rates across all filtered records. Cross-referencing with distance and campus may indicate where transport friction is most acute."
                    controls={
                        <div className="flex items-center gap-2">
                            <label className="text-xs" style={{ color: COLORS.subtext }}>Top</label>
                            <select
                                value={suburbTopN}
                                onChange={(e) => setSuburbTopN(Number(e.target.value))}
                                className="text-xs px-2 py-1 rounded border outline-none"
                                style={{ borderColor: COLORS.border, background: "#F8FAFC", color: COLORS.text }}
                            >
                                {[10, 15, 20, 30].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                    }
                >
                    <Plot
                        data={[
                            {
                                type: "bar",
                                orientation: "h",
                                x: [...suburbRanking].reverse().map((s) => s.absent),
                                y: [...suburbRanking].reverse().map((s) => s.suburb),
                                marker: {
                                    color: [...suburbRanking].reverse().map((s) =>
                                        s.absent > 0.22 ? COLORS.danger : s.absent > 0.15 ? COLORS.absent : COLORS.inPerson
                                    ),
                                },
                                customdata: [...suburbRanking].reverse().map((s) => [
                                    s.n, s.avgDist.toFixed(1), s.inPerson, s.online, s.absent, s.campus,
                                ]),
                                hovertemplate:
                                    "<b>%{y}</b><br>n = %{customdata[0]}<br>Avg dist: %{customdata[1]} km<br>" +
                                    "In-person: %{customdata[2]:.1%}<br>Online: %{customdata[3]:.1%}<br>" +
                                    "Absent: %{customdata[4]:.1%}<br>Campus: %{customdata[5]}<extra></extra>",
                            } as Plotly.Data,
                        ]}
                        layout={{
                            ...baseLayout({ height: Math.max(300, suburbTopN * 26 + 60) }),
                            margin: { t: 10, b: 40, l: 160, r: 16 },
                            xaxis: { tickformat: ".0%", gridcolor: "#F1F5F9" },
                            yaxis: { tickfont: { size: 10 }, automargin: true },
                            showlegend: false,
                        } as Partial<Plotly.Layout>}
                        config={plotConfig}
                        style={{ width: "100%", height: Math.max(300, suburbTopN * 26 + 60) }}
                        useResizeHandler
                    />
                </ChartCard>

                {/* ── Per-campus suburb breakdown ────────────────────────────────────── */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
                        <SectionTitle>Top Suburbs by Modality — Per Campus</SectionTitle>
                        <div className="flex gap-3 flex-wrap">
                            <FilterSelect
                                label="Campus"
                                value={selectedCampusForSuburb}
                                onChange={setSelectedCampusForSuburb}
                                options={["All", ...campusList]}
                            />
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Metric</label>
                                <select
                                    value={campusSuburbMetric}
                                    onChange={(e) => setCampusSuburbMetric(e.target.value as "absent" | "inPerson" | "online")}
                                    className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                                    style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                                >
                                    <option value="absent">Absent Rate</option>
                                    <option value="inPerson">In-Person Rate</option>
                                    <option value="online">Online Rate</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Top N</label>
                                <select
                                    value={campusTopN}
                                    onChange={(e) => setCampusTopN(Number(e.target.value))}
                                    className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                                    style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                                >
                                    {[5, 8, 10, 15].map((n) => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <InsightBadge text="For each campus, shows which suburbs have the highest rates of the selected metric. Useful for identifying geographic clusters of friction or engagement per campus." />

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Object.entries(campusSuburbData).map(([campus, suburbs]) => {
                            if (!suburbs.length) return null;
                            const sorted = [...suburbs].sort((a, b) => b[campusSuburbMetric] - a[campusSuburbMetric]);
                            const topN = sorted.slice(0, campusTopN);
                            const color =
                                campusSuburbMetric === "absent"
                                    ? COLORS.absent
                                    : campusSuburbMetric === "inPerson"
                                        ? COLORS.inPerson
                                        : COLORS.online;
                            const metricLabel =
                                campusSuburbMetric === "absent" ? "Absent" : campusSuburbMetric === "inPerson" ? "In-Person" : "Online";

                            return (
                                <div key={campus} className="rounded-xl border p-4" style={{ borderColor: COLORS.border }}>
                                    <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.text }}>
                                        {campus}
                                    </h4>
                                    <Plot
                                        data={[
                                            {
                                                type: "bar",
                                                orientation: "h",
                                                x: [...topN].reverse().map((s) => s[campusSuburbMetric]),
                                                y: [...topN].reverse().map((s) => s.suburb),
                                                marker: { color },
                                                customdata: [...topN].reverse().map((s) => [
                                                    s.n, s.avgDist.toFixed(1), s.inPerson, s.online, s.absent,
                                                ]),
                                                hovertemplate:
                                                    `<b>%{y}</b><br>n=%{customdata[0]}<br>Avg dist: %{customdata[1]} km<br>` +
                                                    `In-person: %{customdata[2]:.1%}<br>Online: %{customdata[3]:.1%}<br>Absent: %{customdata[4]:.1%}<extra></extra>`,
                                            } as Plotly.Data,
                                        ]}
                                        layout={{
                                            ...baseLayout({ height: Math.max(180, campusTopN * 24 + 40) }),
                                            margin: { t: 4, b: 28, l: 120, r: 8 },
                                            xaxis: { tickformat: ".0%", gridcolor: "#F1F5F9", title: metricLabel },
                                            yaxis: { tickfont: { size: 9 }, automargin: true },
                                            showlegend: false,
                                        } as Partial<Plotly.Layout>}
                                        config={plotConfig}
                                        style={{ width: "100%", height: Math.max(180, campusTopN * 24 + 40) }}
                                        useResizeHandler
                                    />
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* ── High-friction student table ────────────────────────────────────── */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-1">
                        <SectionTitle>High-Friction Students for Review</SectionTitle>
                        <button
                            onClick={exportCSV}
                            className="text-xs px-3 py-1.5 rounded-lg font-medium"
                            style={{ background: "#EFF6FF", color: COLORS.inPerson, border: `1px solid #BFDBFE` }}
                        >
                            Export CSV
                        </button>
                    </div>
                    <p className="text-xs mb-3" style={{ color: COLORS.subtext }}>
                        These students are not automatically problems. They are candidates for operational review
                        because they combine long travel distance (&gt; 20 km) with high in-person exposure (≥ 50%).
                    </p>
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Search by student ID, suburb, school or tutor…"
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className="w-full max-w-sm text-sm px-3 py-1.5 rounded-lg border outline-none"
                            style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                        />
                    </div>
                    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: COLORS.border }}>
                        <table className="w-full text-xs" style={{ fontFamily: FONT_FAMILY }}>
                            <thead>
                                <tr style={{ background: "#F1F5F9", borderBottom: `1px solid ${COLORS.border}` }}>
                                    {(
                                        [
                                            ["student_id", "Student ID"],
                                            ["suburb", "Suburb"],
                                            ["postcode", "Postcode"],
                                            ["school_name", "School"],
                                            ["year_level", "Year"],
                                            ["campus", "Campus"],
                                            ["distance_km", "Distance"],
                                            ["in_person_rate", "In-Person"],
                                            ["online_rate", "Online"],
                                            ["absent_rate", "Absent"],
                                            ["travel_burden", "Burden"],
                                            ["prim_tutor", "Tutor"],
                                            ["start_time", "Start"],
                                        ] as [keyof Row, string][]
                                    ).map(([field, label]) => (
                                        <th
                                            key={field}
                                            className="px-3 py-2 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                                            style={{ color: COLORS.subtext }}
                                            onClick={() => {
                                                if (tableSortField === field) setTableSortDir((d) => (d === "desc" ? "asc" : "desc"));
                                                else { setTableSortField(field); setTableSortDir("desc"); }
                                            }}
                                        >
                                            {label}{" "}
                                            {tableSortField === field && (
                                                <span style={{ color: COLORS.inPerson }}>{tableSortDir === "desc" ? "↓" : "↑"}</span>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {highFrictionRows.slice(0, 100).map((r, i) => (
                                    <tr
                                        key={`${r.student_id}-${i}`}
                                        style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC" }}
                                    >
                                        <td className="px-3 py-2 font-mono">{r.student_id}</td>
                                        <td className="px-3 py-2">{r.suburb ?? "–"}</td>
                                        <td className="px-3 py-2">{r.postcode ?? "–"}</td>
                                        <td className="px-3 py-2">{r.school_name ?? "–"}</td>
                                        <td className="px-3 py-2">{r.year_level ?? "–"}</td>
                                        <td className="px-3 py-2 font-medium" style={{ color: COLORS.accent }}>{r.campus ?? "–"}</td>
                                        <td className="px-3 py-2 font-medium">{r.distance_km.toFixed(1)} km</td>
                                        <td className="px-3 py-2" style={{ color: COLORS.inPerson }}>{pct(r.in_person_rate)}</td>
                                        <td className="px-3 py-2" style={{ color: COLORS.online }}>{pct(r.online_rate)}</td>
                                        <td
                                            className="px-3 py-2 font-medium"
                                            style={{ color: r.absent_rate > 0.2 ? COLORS.danger : COLORS.text }}
                                        >
                                            {pct(r.absent_rate)}
                                        </td>
                                        <td className="px-3 py-2 font-medium">{r.travel_burden.toFixed(1)}</td>
                                        <td className="px-3 py-2">{r.prim_tutor ?? "–"}</td>
                                        <td className="px-3 py-2">{r.start_time ?? "–"}</td>
                                    </tr>
                                ))}
                                {highFrictionRows.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="px-3 py-6 text-center" style={{ color: COLORS.muted }}>
                                            No records match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {highFrictionRows.length > 100 && (
                        <p className="text-xs mt-2" style={{ color: COLORS.muted }}>
                            Showing top 100 of {highFrictionRows.length.toLocaleString()} records. Export CSV for full list.
                        </p>
                    )}
                </Card>

                {/* ── Segment breakdown ─────────────────────────────────────────────── */}
                <Card className="p-5">
                    <SectionTitle>Segment Breakdown</SectionTitle>
                    <p className="text-xs mb-3" style={{ color: COLORS.subtext }}>
                        This identifies where commute friction is concentrated and whether specific tutors, schools, suburbs, or year levels need closer review.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Group by</label>
                            <select
                                value={segmentDimension}
                                onChange={(e) => setSegmentDimension(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                                style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                            >
                                {["year_level", "prim_tutor", "campus", "suburb", "postcode", "school_name", "start_time_bucket", "region"].map((d) => (
                                    <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Sort by</label>
                            <select
                                value={segmentSortField}
                                onChange={(e) => setSegmentSortField(e.target.value)}
                                className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                                style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                            >
                                <option value="avgAbsent">Avg Absent Rate</option>
                                <option value="avgBurden">Avg Travel Burden</option>
                                <option value="n">Student Count</option>
                                <option value="avgDist">Avg Distance</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Min group size</label>
                            <input
                                type="number" min={1} max={100} value={segmentMinN}
                                onChange={(e) => setSegmentMinN(Number(e.target.value))}
                                className="w-20 text-sm px-3 py-1.5 rounded-lg border outline-none"
                                style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: COLORS.border }}>
                        <table className="w-full text-xs" style={{ fontFamily: FONT_FAMILY }}>
                            <thead>
                                <tr style={{ background: "#F1F5F9", borderBottom: `1px solid ${COLORS.border}` }}>
                                    {["Segment", "n", "Avg Distance", "In-Person", "Online", "Absent", "Burden"].map((h) => (
                                        <th key={h} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: COLORS.subtext }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {segmentRows.map((r, i) => (
                                    <tr
                                        key={r.key}
                                        style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC" }}
                                    >
                                        <td className="px-3 py-2 font-medium">{r.key}</td>
                                        <td className="px-3 py-2">{r.n}</td>
                                        <td className="px-3 py-2">{r.avgDist.toFixed(1)} km</td>
                                        <td className="px-3 py-2" style={{ color: COLORS.inPerson }}>{pct(r.avgInPerson)}</td>
                                        <td className="px-3 py-2" style={{ color: COLORS.online }}>{pct(r.avgOnline)}</td>
                                        <td
                                            className="px-3 py-2 font-medium"
                                            style={{ color: r.avgAbsent > 0.2 ? COLORS.danger : COLORS.text }}
                                        >
                                            {pct(r.avgAbsent)}
                                        </td>
                                        <td className="px-3 py-2">{r.avgBurden.toFixed(1)}</td>
                                    </tr>
                                ))}
                                {segmentRows.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-3 py-6 text-center" style={{ color: COLORS.muted }}>
                                            No segments with ≥ {segmentMinN} records.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* ── Recommendations ───────────────────────────────────────────────── */}
                <Card className="p-5">
                    <SectionTitle>Recommended Actions</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                n: "01",
                                title: "Introduce distance-aware allocation rules",
                                body: "Students above a distance threshold should default to online-first or closer-campus options where possible.",
                                color: COLORS.inPerson,
                            },
                            {
                                n: "02",
                                title: "Create a commute-friction watchlist",
                                body: "Flag students who are far from campus, heavily in-person, and showing higher absence.",
                                color: COLORS.online,
                            },
                            {
                                n: "03",
                                title: "Test interventions",
                                body: "Compare absence before and after changing modality or class allocation for high-distance students.",
                                color: COLORS.absent,
                            },
                        ].map((r) => (
                            <div key={r.n} className="rounded-xl p-4" style={{ background: "#F8FAFC", borderLeft: `3px solid ${r.color}` }}>
                                <span className="text-3xl font-black" style={{ color: `${r.color}33` }}>{r.n}</span>
                                <p className="text-sm font-semibold mt-1 mb-1" style={{ color: COLORS.text }}>{r.title}</p>
                                <p className="text-xs leading-relaxed" style={{ color: COLORS.subtext }}>{r.body}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ── Caveats ───────────────────────────────────────────────────────── */}
                <Card className="p-5 mb-8">
                    <SectionTitle>Methodology and Caveats</SectionTitle>
                    <ul className="space-y-2">
                        {[
                            "This analysis is correlational, not causal.",
                            "Distance is straight-line distance, not actual travel time.",
                            "Absence is inferred from absent_rate = 1 − in_person_rate − online_rate.",
                            "Students over 50 km can be included or excluded via the toggle in the page header. When included, they appear in the 50+km distance bin.",
                            "Absence may also be influenced by tutor, subject, class timing, student preference, school workload, and family circumstances.",
                            "Next step would be to connect actual attendance records, enrolment status, and re-enrolment outcomes.",
                        ].map((text, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: COLORS.subtext }}>
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: COLORS.muted }} />
                                {text}
                            </li>
                        ))}
                    </ul>
                </Card>

            </div>
        </div>
    );
}