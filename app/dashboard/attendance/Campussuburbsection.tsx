import React, { useState, useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    Row,
    COLORS,
    FONT_FAMILY,
    baseLayout,
    plotConfig,
    buildCampusSuburbData,
} from "./lib";
import { Card, FilterSelect, InsightBadge, SectionTitle, MiniSelect } from "./ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

type Metric = "absent" | "inPerson" | "online";

const METRIC_LABEL: Record<Metric, string> = {
    absent: "Absent Rate",
    inPerson: "In-Person Rate",
    online: "Online Rate",
};

const METRIC_COLOR: Record<Metric, string> = {
    absent: COLORS.absent,
    inPerson: COLORS.inPerson,
    online: COLORS.online,
};

interface CampusChartProps {
    campus: string;
    suburbs: {
        suburb: string;
        n: number;
        absent: number;
        inPerson: number;
        online: number;
        avgDist: number;
    }[];
    metric: Metric;
    topN: number;
    /** When true the chart fills the full card width; when false it sits inside a grid cell */
    fullWidth: boolean;
}

/** Isolated chart card — remounts when fullWidth flips, forcing Plotly to measure fresh width */
function CampusChart({ campus, suburbs, metric, topN, fullWidth }: CampusChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    // Measure container width after mount / after fullWidth changes (remount handles this)
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.offsetWidth);
        }
    }, []);

    const barColor = METRIC_COLOR[metric];
    const chartH = fullWidth
        ? Math.max(380, topN * 38 + 100)
        : Math.max(220, topN * 30 + 80);
    const tickFontSize = fullWidth ? 12 : 9;
    const textFontSize = fullWidth ? 11 : 9;
    const bottomMargin = fullWidth ? 110 : 80;

    // Pass explicit width to Plotly when we have it, so it never uses a stale cached value
    const layoutWidth = containerWidth > 0 ? containerWidth - 32 : undefined; // subtract card padding

    return (
        <div
            ref={containerRef}
            className="rounded-xl border p-4"
            style={{ borderColor: COLORS.border }}
        >
            <h4 className="text-sm font-semibold mb-3" style={{ color: COLORS.text }}>
                {campus}
            </h4>
            <Plot
                data={[
                    {
                        type: "bar",
                        x: suburbs.map((s) => s.suburb),
                        y: suburbs.map((s) => s[metric]),
                        text: suburbs.map((s) => `${s.avgDist.toFixed(1)} km`),
                        textposition: "outside" as const,
                        textfont: { size: textFontSize, color: COLORS.subtext },
                        marker: { color: barColor },
                        customdata: suburbs.map((s) => [
                            s.n,
                            s.avgDist.toFixed(1),
                            s.inPerson,
                            s.online,
                            s.absent,
                        ]),
                        hovertemplate:
                            `<b>%{x}</b><br>n=%{customdata[0]}<br>Avg dist: %{customdata[1]} km<br>` +
                            `In-person: %{customdata[2]:.1%}<br>Online: %{customdata[3]:.1%}<br>` +
                            `Absent: %{customdata[4]:.1%}<extra></extra>`,
                    } as Plotly.Data,
                ]}
                layout={{
                    ...baseLayout({ height: chartH }),
                    ...(layoutWidth ? { width: layoutWidth } : {}),
                    margin: { t: 28, b: bottomMargin, l: 56, r: 16 },
                    xaxis: {
                        tickangle: -40,
                        tickfont: { size: tickFontSize },
                        automargin: true,
                        gridcolor: "#F1F5F9",
                    },
                    yaxis: {
                        tickformat: ".0%",
                        gridcolor: "#F1F5F9",
                        title: METRIC_LABEL[metric],
                        titlefont: { size: 11 },
                    },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: chartH }}
                useResizeHandler
            />
        </div>
    );
}

interface Props {
    data: Row[];
    campusList: string[];
}

export function CampusSuburbSection({ data, campusList }: Props) {
    const [selectedCampus, setSelectedCampus] = useState("All");
    const [metric, setMetric] = useState<Metric>("absent");
    const [topN, setTopN] = useState(8);

    const campusSuburbData = useMemo(
        () => buildCampusSuburbData(data, campusList, selectedCampus, metric, topN),
        [data, campusList, selectedCampus, metric, topN]
    );

    const isSingleCampus = selectedCampus !== "All";
    const entries = Object.entries(campusSuburbData).filter(([, suburbs]) => suburbs.length > 0);

    return (
        <Card className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
                <SectionTitle>Top Suburbs by Modality — Per Campus</SectionTitle>
                <div className="flex gap-3 flex-wrap">
                    <FilterSelect
                        label="Campus"
                        value={selectedCampus}
                        onChange={setSelectedCampus}
                        options={["All", ...campusList]}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>Metric</label>
                        <select
                            value={metric}
                            onChange={(e) => setMetric(e.target.value as Metric)}
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
                        <MiniSelect
                            value={topN}
                            onChange={(v) => setTopN(Number(v))}
                            options={[5, 8, 10, 15]}
                        />
                    </div>
                </div>
            </div>

            <InsightBadge text="For each campus, shows which suburbs have the highest rates of the selected metric. Useful for identifying geographic clusters of friction or engagement per campus." />

            {/*
        Grid wrapper:
        - "All" selected  → 3-column responsive grid
        - Single campus   → no grid; the single CampusChart div is block-level and fills 100%

        The `key` on CampusChart encodes both campus name AND the mode (single vs grid).
        When the mode flips, React unmounts + remounts the component so Plotly measures
        the correct container width from scratch rather than reusing its cached size.
      */}
            <div className={`mt-4 ${isSingleCampus ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"}`}>
                {entries.map(([campus, suburbs]) => (
                    <CampusChart
                        key={`${campus}-${isSingleCampus ? "full" : "grid"}`}
                        campus={campus}
                        suburbs={suburbs}
                        metric={metric}
                        topN={topN}
                        fullWidth={isSingleCampus}
                    />
                ))}

                {entries.length === 0 && (
                    <p className="text-sm py-6 text-center" style={{ color: COLORS.muted }}>
                        No data available for the current selection.
                    </p>
                )}
            </div>
        </Card>
    );
}