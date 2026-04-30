import React, { useState, useMemo, useCallback } from "react";
import { Row, COLORS, FONT_FAMILY, pct } from "./lib";
import { Card, SectionTitle } from "./ui";

type SortField = keyof Row;

interface Props {
    data: Row[];
}

const PAGE_SIZE = 10;

const COLUMNS: [SortField, string][] = [
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
];

export function HighFrictionTable({ data }: Props) {
    const [search, setSearch] = useState("");
    const [sortField, setSortField] = useState<SortField>("travel_burden");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(0);

    const filtered = useMemo(() => {
        return data
            .filter((r) => r.distance_km > 20 && r.in_person_rate >= 0.5)
            .filter((r) => {
                if (!search) return true;
                const q = search.toLowerCase();
                return (
                    String(r.student_id).includes(q) ||
                    (r.suburb ?? "").toLowerCase().includes(q) ||
                    (r.school_name ?? "").toLowerCase().includes(q) ||
                    (r.prim_tutor ?? "").toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                const va = a[sortField] as number;
                const vb = b[sortField] as number;
                return sortDir === "desc" ? vb - va : va - vb;
            });
    }, [data, search, sortField, sortDir]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
        else { setSortField(field); setSortDir("desc"); }
        setPage(0);
    };

    const exportCSV = useCallback(() => {
        const cols: (keyof Row)[] = [
            "student_id", "suburb", "postcode", "school_name", "year_level",
            "campus", "distance_km", "in_person_rate", "online_rate", "absent_rate",
            "travel_burden", "prim_tutor", "start_time",
        ];
        const header = cols.join(",");
        const rows = filtered.map((r) =>
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
    }, [filtered]);

    return (
        <Card className="p-5">
            {/* Title row */}
            <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
                <SectionTitle>High-Friction Students for Review</SectionTitle>
                <button
                    onClick={exportCSV}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "#EFF6FF", color: COLORS.inPerson, border: `1px solid #BFDBFE` }}
                >
                    Export CSV ({filtered.length.toLocaleString()})
                </button>
            </div>
            <p className="text-xs mb-3" style={{ color: COLORS.subtext }}>
                Students with distance &gt; 20 km and in-person rate ≥ 50%. These are candidates for operational
                review — not automatic flags.
            </p>

            {/* Search */}
            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Search by student ID, suburb, school or tutor…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="w-full max-w-sm text-sm px-3 py-1.5 rounded-lg border outline-none"
                    style={{ borderColor: COLORS.border, fontFamily: FONT_FAMILY, color: COLORS.text, background: "#F8FAFC" }}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: COLORS.border }}>
                <table className="w-full text-xs" style={{ fontFamily: FONT_FAMILY }}>
                    <thead>
                        <tr style={{ background: "#F1F5F9", borderBottom: `1px solid ${COLORS.border}` }}>
                            {COLUMNS.map(([field, label]) => (
                                <th
                                    key={field}
                                    className="px-3 py-2 text-left font-semibold cursor-pointer select-none whitespace-nowrap"
                                    style={{ color: COLORS.subtext }}
                                    onClick={() => handleSort(field)}
                                >
                                    {label}{" "}
                                    {sortField === field && (
                                        <span style={{ color: COLORS.inPerson }}>{sortDir === "desc" ? "↓" : "↑"}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((r, i) => (
                            <tr
                                key={`${r.student_id}-${page * PAGE_SIZE + i}`}
                                style={{
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    background: i % 2 === 0 ? "#FFFFFF" : "#FAFBFC",
                                }}
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
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={13} className="px-3 py-6 text-center" style={{ color: COLORS.muted }}>
                                    No records match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                    <span className="text-xs" style={{ color: COLORS.subtext }}>
                        Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                        {filtered.length.toLocaleString()} records
                    </span>
                    <div className="flex items-center gap-1">
                        <PageButton onClick={() => setPage(0)} disabled={page === 0} label="«" />
                        <PageButton onClick={() => setPage((p) => p - 1)} disabled={page === 0} label="‹" />
                        {/* Page number pills — show a window of 5 */}
                        {Array.from({ length: totalPages }, (_, i) => i)
                            .filter((i) => i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 2)
                            .reduce<(number | "…")[]>((acc, i, idx, arr) => {
                                if (idx > 0 && typeof arr[idx - 1] === "number" && (i as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                                acc.push(i);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === "…" ? (
                                    <span key={`ellipsis-${idx}`} className="px-1 text-xs" style={{ color: COLORS.muted }}>…</span>
                                ) : (
                                    <button
                                        key={item}
                                        onClick={() => setPage(item as number)}
                                        className="w-7 h-7 rounded text-xs font-medium transition-colors"
                                        style={{
                                            background: page === item ? COLORS.inPerson : "#F1F5F9",
                                            color: page === item ? "#fff" : COLORS.subtext,
                                        }}
                                    >
                                        {(item as number) + 1}
                                    </button>
                                )
                            )}
                        <PageButton onClick={() => setPage((p) => p + 1)} disabled={page === totalPages - 1} label="›" />
                        <PageButton onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} label="»" />
                    </div>
                </div>
            )}
        </Card>
    );
}

function PageButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-7 h-7 rounded text-xs font-medium transition-colors disabled:opacity-30"
            style={{ background: "#F1F5F9", color: COLORS.subtext }}
        >
            {label}
        </button>
    );
}