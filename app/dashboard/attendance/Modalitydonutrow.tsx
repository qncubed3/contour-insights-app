import React from "react";
import dynamic from "next/dynamic";
import { Row, COLORS, avg, FONT_FAMILY, baseLayout, plotConfig, PLOT_H } from "./lib";
import { ChartCard } from "./ui";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const DONUT_LAYOUT = {
    ...baseLayout({}),
    margin: { t: 20, b: 20, l: 20, r: 20 },
    showlegend: true,
    legend: { orientation: "h" as const, y: -0.12, x: 0.5, xanchor: "center" as const },
};

interface Props {
    data: Row[];
}

export function ModalityDonutRow({ data }: Props) {
    // ── Overall mix ───────────────────────────────────────────────────────────
    const overallMix = {
        inPerson: avg(data.map((r) => r.in_person_rate)),
        online: avg(data.map((r) => r.online_rate)),
        absent: avg(data.map((r) => r.absent_rate)),
    };

    // ── Purely online at student level ────────────────────────────────────────
    const studentMap = new Map<number, number>();
    data.forEach((r) => {
        const prev = studentMap.get(r.student_id) ?? r.in_person_rate;
        studentMap.set(r.student_id, Math.max(prev, r.in_person_rate));
    });
    const totalStudents = studentMap.size;
    const purelyOnlineStudents = Array.from(studentMap.values()).filter((ip) => ip === 0).length;
    const otherStudents = totalStudents - purelyOnlineStudents;
    const purelyOnlinePct = totalStudents > 0 ? ((purelyOnlineStudents / totalStudents) * 100).toFixed(1) : "0.0";
    const otherPct = totalStudents > 0 ? ((otherStudents / totalStudents) * 100).toFixed(1) : "0.0";

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Overall Modality Split */}
            <ChartCard
                title="Overall Modality Split"
                insight="The aggregate average modality mix across all filtered records."
            >
                <Plot
                    data={[
                        {
                            type: "pie",
                            labels: ["In-Person", "Online", "Absent"],
                            values: [overallMix.inPerson, overallMix.online, overallMix.absent],
                            marker: { colors: [COLORS.inPerson, COLORS.online, COLORS.absent] },
                            hole: 0.5,
                            textinfo: "label+percent",
                            hovertemplate: "<b>%{label}</b><br>Avg rate: %{percent}<extra></extra>",
                            textfont: { family: FONT_FAMILY, size: 12 },
                        } as Plotly.Data,
                    ]}
                    layout={{ ...DONUT_LAYOUT, height: PLOT_H } as Partial<Plotly.Layout>}
                    config={plotConfig}
                    style={{ width: "100%", height: PLOT_H }}
                    useResizeHandler
                />
            </ChartCard>

            {/* Purely Online Students */}
            <ChartCard
                title="Purely Online Students"
                insight="Calculated at the student level (unique student_id). A student is 'purely online' if their maximum in-person rate across all records is 0%."
            >
                <Plot
                    data={[
                        {
                            type: "pie",
                            labels: [
                                `Purely Online (${purelyOnlinePct}%)`,
                                `Other Students (${otherPct}%)`,
                            ],
                            values: [purelyOnlineStudents, otherStudents],
                            marker: { colors: [COLORS.online, COLORS.inPerson] },
                            hole: 0.5,
                            textinfo: "label+value",
                            customdata: [
                                [purelyOnlineStudents, purelyOnlinePct, totalStudents],
                                [otherStudents, otherPct, totalStudents],
                            ],
                            hovertemplate:
                                "<b>%{label}</b><br>Students: %{customdata[0].toLocaleString()}<br>Share: %{customdata[1]}%<br>Total: %{customdata[2].toLocaleString()}<extra></extra>",
                            textfont: { family: FONT_FAMILY, size: 11 },
                        } as Plotly.Data,
                    ]}
                    layout={{ ...DONUT_LAYOUT, height: PLOT_H } as Partial<Plotly.Layout>}
                    config={plotConfig}
                    style={{ width: "100%", height: PLOT_H }}
                    useResizeHandler
                />
            </ChartCard>
        </div>
    );
}