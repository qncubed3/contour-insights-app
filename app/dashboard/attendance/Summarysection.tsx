import React from "react";
import { Row, COLORS, avg, pct, median } from "./lib";
import { Card, KpiCard } from "./ui";

interface SummaryProps {
    data: Row[];
    dataUnder50: Row[];
}

export function ExecutiveSummary({ data, dataUnder50 }: SummaryProps) {
    const le10Ip = avg(dataUnder50.filter((r) => r.distance_km <= 10).map((r) => r.in_person_rate));
    const gt20Ip = avg(dataUnder50.filter((r) => r.distance_km > 20).map((r) => r.in_person_rate));
    const avgAbsLe10 = avg(dataUnder50.filter((r) => r.distance_km <= 10).map((r) => r.absent_rate));
    const avgAbsGt20 = avg(dataUnder50.filter((r) => r.distance_km > 20).map((r) => r.absent_rate));
    const uplift = avgAbsLe10 > 0 ? avgAbsGt20 / avgAbsLe10 : 0;

    const bullets = [
        { label: "Absence uplift >20 km vs ≤10 km", value: `${uplift.toFixed(2)}×` },
        { label: "In-person rate ≤10 km", value: pct(le10Ip) },
        { label: "In-person rate >20 km", value: pct(gt20Ip) },
    ];

    return (
        <Card className="p-6">
            <h2 className="text-base font-semibold mb-2" style={{ color: COLORS.text }}>
                Distance appears to create measurable attendance friction
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.subtext }}>
                Students further from campus are less likely to attend in person and more likely to be absent.
                Contour appears to adapt by shifting distant students more online, but absence still rises,
                suggesting the current adjustment may not fully offset commute friction.
            </p>
            <div className="flex flex-wrap gap-4">
                {bullets.map((m) => (
                    <div
                        key={m.label}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg"
                        style={{ background: "#F1F5F9" }}
                    >
                        <span className="text-xl font-bold" style={{ color: COLORS.inPerson }}>{m.value}</span>
                        <span className="text-xs" style={{ color: COLORS.subtext }}>{m.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

interface KpiProps {
    data: Row[];
    dataUnder50: Row[];
}

export function KpiRow({ data, dataUnder50 }: KpiProps) {
    const totalStudents = new Set(data.map((r) => r.student_id)).size;
    const medianDist = median(data.map((r) => r.distance_km));
    const gt10 = data.filter((r) => r.distance_km > 10).length;
    const gt20 = data.filter((r) => r.distance_km > 20).length;
    const pct10 = data.length ? gt10 / data.length : 0;
    const pct20 = data.length ? gt20 / data.length : 0;
    const avgAbsLe10 = avg(dataUnder50.filter((r) => r.distance_km <= 10).map((r) => r.absent_rate));
    const avgAbsGt20 = avg(dataUnder50.filter((r) => r.distance_km > 20).map((r) => r.absent_rate));
    const absUplift = avgAbsLe10 > 0 ? avgAbsGt20 / avgAbsLe10 : 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <KpiCard label="Students analysed" value={totalStudents.toLocaleString()} sub="unique student IDs" />
            <KpiCard label="Median distance" value={`${medianDist.toFixed(1)} km`} sub="to campus" />
            <KpiCard
                label="Students > 10 km"
                value={pct(pct10)}
                sub={`${gt10.toLocaleString()} records`}
            />
            <KpiCard
                label="Students > 20 km"
                value={pct(pct20)}
                sub={`${gt20.toLocaleString()} records`}
            />
            <KpiCard label="Absence uplift" value={`${absUplift.toFixed(2)}×`} sub=">20 km vs ≤10 km" />
        </div>
    );
}