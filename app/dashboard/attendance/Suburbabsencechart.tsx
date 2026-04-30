import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Row, COLORS, baseLayout, plotConfig, buildSuburbRanking } from "./lib";
import { ChartCard, MiniSelect } from "./ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: Row[];
}

export function SuburbAbsenceChart({ data }: Props) {
    const [topN, setTopN] = useState(15);

    const suburbs = buildSuburbRanking(data, topN);

    const barH = Math.max(340, topN * 22 + 80);

    return (
        <ChartCard
            title="Suburbs with Highest Absence Rate"
            insight="These suburbs have the highest average absence rates. The avg distance label on each bar shows whether higher absence correlates with longer commute."
            controls={
                <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.subtext }}>
                    <span>Top</span>
                    <MiniSelect
                        value={topN}
                        onChange={(v) => setTopN(Number(v))}
                        options={[10, 15, 20, 30]}
                    />
                </div>
            }
        >
            <Plot
                data={[
                    {
                        type: "bar",
                        x: suburbs.map((s) => s.suburb),
                        y: suburbs.map((s) => s.absent),
                        text: suburbs.map((s) => `${s.avgDist.toFixed(1)} km`),
                        textposition: "outside" as const,
                        textfont: { size: 10, color: COLORS.subtext },
                        marker: {
                            color: suburbs.map((s) =>
                                s.absent > 0.22 ? COLORS.danger : s.absent > 0.15 ? COLORS.absent : COLORS.inPerson
                            ),
                        },
                        customdata: suburbs.map((s) => [s.n, s.avgDist.toFixed(1), s.inPerson, s.online, s.absent, s.campus]),
                        hovertemplate:
                            "<b>%{x}</b><br>n = %{customdata[0]}<br>Avg dist: %{customdata[1]} km<br>" +
                            "In-person: %{customdata[2]:.1%}<br>Online: %{customdata[3]:.1%}<br>" +
                            "Absent: %{customdata[4]:.1%}<br>Campus: %{customdata[5]}<extra></extra>",
                    } as Plotly.Data,
                ]}
                layout={{
                    ...baseLayout({ height: barH }),
                    margin: { t: 30, b: 100, l: 56, r: 16 },
                    xaxis: {
                        tickangle: -40,
                        tickfont: { size: 10 },
                        automargin: true,
                        gridcolor: "#F1F5F9",
                    },
                    yaxis: { tickformat: ".0%", gridcolor: "#F1F5F9", title: "Absence Rate" },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: barH }}
                useResizeHandler
            />
        </ChartCard>
    );
}