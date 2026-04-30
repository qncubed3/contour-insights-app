// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawRow {
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

export interface Row extends RawRow {
    absent_rate: number;
    travel_burden: number;
    distance_bin: string;
    start_time_bucket: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DISTANCE_BINS = [
    "0–5km",
    "5–10km",
    "10–15km",
    "15–20km",
    "20–30km",
    "30–40km",
    "40–50km",
    "50+km",
] as const;

export const COLORS = {
    inPerson: "#2563EB",
    online: "#7C3AED",
    absent: "#F59E0B",
    accent: "#0EA5E9",
    danger: "#EF4444",
    muted: "#94A3B8",
    bg: "#F7FAFC",
    card: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    subtext: "#64748B",
};

export const FONT_FAMILY = "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";

export const PLOT_H = 320;

// ─── Data helpers ─────────────────────────────────────────────────────────────

export function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

export function getDistanceBin(d: number): string {
    if (d < 5) return "0–5km";
    if (d < 10) return "5–10km";
    if (d < 15) return "10–15km";
    if (d < 20) return "15–20km";
    if (d < 30) return "20–30km";
    if (d < 40) return "30–40km";
    if (d < 50) return "40–50km";
    return "50+km";
}

export function getStartTimeBucket(t?: string): string {
    if (!t) return "Unknown";
    const [h] = t.split(":").map(Number);
    if (h < 12) return "Morning";
    if (h < 16) return "Afternoon";
    if (h < 18) return "After School";
    return "Evening";
}

export function enrich(raw: RawRow): Row {
    const absent_rate = clamp(1 - (raw.in_person_rate ?? 0) - (raw.online_rate ?? 0), 0, 1);
    const travel_burden = (raw.distance_km ?? 0) * (raw.in_person_rate ?? 0);
    const distance_bin = getDistanceBin(raw.distance_km ?? 0);
    const start_time_bucket = getStartTimeBucket(raw.start_time);
    return { ...raw, absent_rate, travel_burden, distance_bin, start_time_bucket };
}

export function pct(v: number, decimals = 1) {
    return `${(v * 100).toFixed(decimals)}%`;
}

export function avg(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function median(arr: number[]): number {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function groupBy<T>(arr: T[], key: (r: T) => string): Map<string, T[]> {
    const m = new Map<string, T[]>();
    arr.forEach((r) => {
        const k = key(r);
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(r);
    });
    return m;
}

// ─── Plotly defaults ──────────────────────────────────────────────────────────

export function baseLayout(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        paper_bgcolor: "transparent",
        plot_bgcolor: "transparent",
        font: { family: FONT_FAMILY, color: COLORS.text, size: 12 },
        margin: { t: 10, b: 52, l: 56, r: 16 },
        legend: { orientation: "h", y: -0.22, x: 0, font: { size: 11 } },
        hoverlabel: {
            bgcolor: "#1E293B",
            bordercolor: "#334155",
            font: { color: "#F8FAFC", family: FONT_FAMILY, size: 12 },
        },
        ...overrides,
    };
}

export const plotConfig = { displayModeBar: false, responsive: true };

// ─── Derived data builders ────────────────────────────────────────────────────

export function buildTutorSeries(data: Row[]) {
    const map = groupBy(data, (r) => r.prim_tutor ?? "Unknown");
    return Array.from(map.entries())
        .filter(([, rows]) => rows.length >= 5)
        .map(([tutor, rows]) => ({
            tutor,
            n: rows.length,
            inPerson: avg(rows.map((r) => r.in_person_rate)),
            online: avg(rows.map((r) => r.online_rate)),
            absent: avg(rows.map((r) => r.absent_rate)),
        }))
        .sort((a, b) => a.absent - b.absent);
}

export function buildSuburbRanking(data: Row[], topN: number) {
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
        .slice(0, topN);
}

export function buildCampusSuburbData(
    data: Row[],
    campusList: string[],
    selectedCampus: string,
    metric: "absent" | "inPerson" | "online",
    topN: number
) {
    const filter = selectedCampus === "All" ? campusList : [selectedCampus];
    const result: Record<
        string,
        { suburb: string; n: number; absent: number; inPerson: number; online: number; avgDist: number }[]
    > = {};
    filter.forEach((campus) => {
        const campusRows = data.filter((r) => r.campus === campus);
        const subMap = groupBy(campusRows, (r) => r.suburb ?? "Unknown");
        const all = Array.from(subMap.entries())
            .filter(([, rows]) => rows.length >= 3)
            .map(([suburb, rows]) => ({
                suburb,
                n: rows.length,
                absent: avg(rows.map((r) => r.absent_rate)),
                inPerson: avg(rows.map((r) => r.in_person_rate)),
                online: avg(rows.map((r) => r.online_rate)),
                avgDist: avg(rows.map((r) => r.distance_km)),
            }));
        result[campus] = all.sort((a, b) => b[metric] - a[metric]).slice(0, topN);
    });
    return result;
}