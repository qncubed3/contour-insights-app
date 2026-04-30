import React, { useState, useMemo } from "react";
import { Row, COLORS, FONT_FAMILY, avg, pct } from "./lib";
import { Card, SectionTitle } from "./ui";

const DIMENSIONS = [
    "year_level", "prim_tutor", "campus", "suburb",
    "postcode", "school_name", "start_time_bucket", "region",
];

const SORT_OPTIONS = [
    { value: "avgAbsent", label: "Avg Absent Rate" },
    { value: "avgBurden", label: "Avg Travel Burden" },
    { value: "n", label: "Student Count" },
    { value: "avgDist", label: "Avg Distance" },
];

interface Props {
    data: Row[];
}

export function SegmentBreakdownTable({ data }: Props) {
    const [dimension, setDimension] = useState("year_level");
    const [sortField, setSortField] = useState("avgAbsent");
    const [minN, setMinN] = useState(10);

    const rows = useMemo(() => {
        const groups = new Map<string, Row[]>();
        data.forEach((r) => {
            const key = String((r as Record<string, unknown>)[dimension] ?? "Unknown");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(r);
        });
        return Array.from(groups.entries())
            .filter(([, rows]) => rows.length >= minN)
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
                const va = a[sortField as keyof typeof a] as number;
                const vb = b[sortField as keyof typeof b] as number;
                return vb - va;
            });
    }, [data, dimension, sortField, minN]);

    return (
        <Card className="p-5">
            <SectionTitle>Segment Breakdown</SectionTitle>
            <p className="text-xs mb-3" style={{ color: COLORS.subtext }}>
                Identifies where commute friction is concentrated across tutors, schools, suburbs, and year levels.
            </p>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 mb-4">
                <Control label="Group by">
                    <select
                        value={dimension}
                        onChange={(e) => setDimension(e.target.value)}
                        className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                        style={selectStyle}
                    >
                        {DIMENSIONS.map((d) => (
                            <option key={d} value={d}>{d.replace(/_/g, " ")}</option>
                        ))}
                    </select>
                </Control>

                <Control label="Sort by">
                    <select
                        value={sortField}
                        onChange={(e) => setSortField(e.target.value)}
                        className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                        style={selectStyle}
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </Control>

                <Control label="Min group size">
                    <input
                        type="number"
                        min={1}
                        max={100}
                        value={minN}
                        onChange={(e) => setMinN(Number(e.target.value))}
                        className="w-20 text-sm px-3 py-1.5 rounded-lg border outline-none"
                        style={selectStyle}
                    />
                </Control>
            </div>

            {/* Table */}
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
                        {rows.map((r, i) => (
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
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-3 py-6 text-center" style={{ color: COLORS.muted }}>
                                    No segments with ≥ {minN} records.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>{label}</label>
            {children}
        </div>
    );
}

const selectStyle: React.CSSProperties = {
    borderColor: COLORS.border,
    fontFamily: FONT_FAMILY,
    color: COLORS.text,
    background: "#F8FAFC",
};