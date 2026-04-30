import React from "react";
import dynamic from "next/dynamic";
import { Row, COLORS, baseLayout, plotConfig, buildTutorSeries } from "./lib";
import { ChartCard } from "./ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Props {
    data: Row[];
}

export function TutorAbsenceChart({ data }: Props) {
    const tutors = buildTutorSeries(data); // sorted low → high absence

    const barHeight = 380;

    return (
        <ChartCard
            title="All Tutors Ranked by Absence Rate (low → high)"
            insight="Tutors at the right end have higher cohort absence rates. Differences may reflect student cohort composition, subject mix, or timetabling rather than tutor performance alone."
        >
            <Plot
                data={[
                    {
                        type: "bar",
                        x: tutors.map((t) => t.tutor),
                        y: tutors.map((t) => t.absent),
                        marker: {
                            color: tutors.map((t) =>
                                t.absent > 0.22 ? COLORS.danger : t.absent > 0.15 ? COLORS.absent : COLORS.inPerson
                            ),
                        },
                        customdata: tutors.map((t) => [t.n, t.inPerson, t.online, t.absent]),
                        hovertemplate:
                            "<b>%{x}</b><br>n = %{customdata[0]}<br>" +
                            "In-person: %{customdata[1]:.1%}<br>" +
                            "Online: %{customdata[2]:.1%}<br>" +
                            "Absent: %{customdata[3]:.1%}<extra></extra>",
                    } as Plotly.Data,
                ]}
                layout={{
                    ...baseLayout({ height: barHeight }),
                    margin: { t: 10, b: 90, l: 56, r: 16 },
                    xaxis: {
                        tickangle: -40,
                        tickfont: { size: 10 },
                        gridcolor: "#F1F5F9",
                        automargin: true,
                    },
                    yaxis: { tickformat: ".0%", gridcolor: "#F1F5F9", title: "Absence Rate" },
                    showlegend: false,
                } as Partial<Plotly.Layout>}
                config={plotConfig}
                style={{ width: "100%", height: barHeight }}
                useResizeHandler
            />
        </ChartCard>
    );
}