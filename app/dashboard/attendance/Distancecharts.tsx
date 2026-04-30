import React from "react";
import dynamic from "next/dynamic";
import {
    Row,
    COLORS,
    DISTANCE_BINS,
    avg,
    baseLayout,
    plotConfig,
    PLOT_H,
} from "./lib";
import { ChartCard } from "./ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// ─── Chart: Stacked bar by distance bin ──────────────────────────────────────

export function ModalityMixByBinChart({ data }: { data: Row[] }) {
    const binData = DISTANCE_BINS.map((bin) => {
        const rows = data.filter((r) => r.distance_bin === bin);
        return {
            bin,
            n: rows.length,
            inPerson: avg(rows.map((r) => r.in_person_rate)),
            online: avg(rows.map((r) => r.online_rate)),
            absent: avg(rows.map((r) => r.absent_rate)),
        };
    }).filter((d) => d.n > 0);

    const bins = binData.map((d) => d.bin);

    const make = (name: string, values: number[], color: string): Plotly.Data => ({
        name,
        type: "bar",
        x: bins,
        y: values,
        marker: { color },
        customdata: binData.map((d) => [d.n, d.inPerson, d.online, d.absent]),
        hovertemplate:
            "<b>%{x}</b><br>" +
            "n = %{customdata[0]}<br>" +
            "In-person: %{customdata[1]:.1%}<br>" +
            "Online: %{customdata[2]:.1%}<br>" +
            "Absent: %{customdata[3]:.1%}" +
            "<extra></extra>",
    } as Plotly.Data);

    return (
        <ChartCard
            title="Average Modality Mix by Distance Bin"
            insight="As distance increases, in-person share falls and online share rises, but absence also increases, suggesting online substitution only partially offsets distance friction."
        >
            <Plot
                data={[
                    make("In-Person", binData.map((d) => d.inPerson), COLORS.inPerson),
                    make("Online", binData.map((d) => d.online), COLORS.online),
                    make("Absent", binData.map((d) => d.absent), COLORS.absent),
                ]}
                layout={{
                    ...baseLayout({ barmode: "stack", height: PLOT_H }),
                    xaxis: {
                        tickfont: { size: 11 },
                        gridcolor: "#F1F5F9",
                        categoryarray: [...DISTANCE_BINS],
                        categoryorder: "array",
                    },
                    yaxis: { tickformat: ".0%", range: [0, 1], gridcolor: "#F1F5F9" },
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: PLOT_H }}
                useResizeHandler
            />
        </ChartCard>
    );
}

// ─── Chart: Boxplot by distance bin ──────────────────────────────────────────

export function InPersonBoxplotChart({ data }: { data: Row[] }) {
    const traces = DISTANCE_BINS.map((bin) => {
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
        } as Plotly.Data;
    }).filter(Boolean) as Plotly.Data[];

    return (
        <ChartCard
            title="In-Person Rate Distribution by Distance Bin"
            insight="The distribution of in-person participation shifts downward with distance, showing that distant students are generally allocated less in-person delivery."
        >
            <Plot
                data={traces}
                layout={{
                    ...baseLayout({ height: PLOT_H }),
                    xaxis: {
                        tickfont: { size: 10 },
                        gridcolor: "#F1F5F9",
                        categoryarray: [...DISTANCE_BINS],
                        categoryorder: "array",
                    },
                    yaxis: { tickformat: ".0%", range: [0, 1], gridcolor: "#F1F5F9" },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: PLOT_H }}
                useResizeHandler
            />
        </ChartCard>
    );
}

// ─── Chart: Absence by distance threshold ────────────────────────────────────

export function AbsenceThresholdChart({ dataUnder50 }: { dataUnder50: Row[] }) {
    const groups = [
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

    return (
        <ChartCard
            title="Average Absence Rate by Distance Threshold (< 50 km)"
            insight="This helps identify the distance threshold where absence begins to materially increase and where intervention rules could be introduced."
        >
            <Plot
                data={[
                    {
                        type: "bar",
                        x: groups.map((d) => d.label),
                        y: groups.map((d) => d.avgAbsent),
                        marker: {
                            color: groups.map((d) =>
                                d.avgAbsent > 0.18 ? COLORS.danger : d.avgAbsent > 0.14 ? COLORS.absent : COLORS.inPerson
                            ),
                        },
                        customdata: groups.map((d) => [d.n, d.avgAbsent]),
                        hovertemplate:
                            "<b>%{x}</b><br>n = %{customdata[0]}<br>Avg absent: %{customdata[1]:.1%}<extra></extra>",
                    } as Plotly.Data,
                ]}
                layout={{
                    ...baseLayout({ height: PLOT_H }),
                    yaxis: { tickformat: ".0%", gridcolor: "#F1F5F9" },
                    xaxis: { gridcolor: "#F1F5F9" },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: PLOT_H }}
                useResizeHandler
            />
        </ChartCard>
    );
}

// ─── Chart: Travel burden histogram ──────────────────────────────────────────

export function TravelBurdenChart({ data }: { data: Row[] }) {
    return (
        <ChartCard
            title="Travel Burden Distribution (distance × in-person rate)"
            insight="A subset of students carry disproportionately high travel burden and should be reviewed for possible timetable, modality, or campus reassignment."
        >
            <Plot
                data={[
                    {
                        type: "histogram",
                        x: data.map((r) => r.travel_burden),
                        nbinsx: 40,
                        marker: { color: COLORS.inPerson, opacity: 0.85 },
                        hovertemplate: "Burden: %{x:.1f}<br>Count: %{y}<extra></extra>",
                    } as Plotly.Data,
                ]}
                layout={{
                    ...baseLayout({ height: PLOT_H }),
                    xaxis: { title: "Travel Burden", gridcolor: "#F1F5F9" },
                    yaxis: { title: "Records", gridcolor: "#F1F5F9" },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: PLOT_H }}
                useResizeHandler
            />
        </ChartCard>
    );
}

// ─── Compound 2×2 grid ────────────────────────────────────────────────────────

export function DistanceAnalysisGrid({ data, dataUnder50 }: { data: Row[]; dataUnder50: Row[] }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ModalityMixByBinChart data={data} />
            <InPersonBoxplotChart data={data} />
            <AbsenceThresholdChart dataUnder50={dataUnder50} />
            <TravelBurdenChart data={data} />
        </div>
    );
}