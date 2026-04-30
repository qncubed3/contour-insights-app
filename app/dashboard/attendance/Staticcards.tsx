import React from "react";
import { COLORS } from "./lib";
import { Card, SectionTitle } from "./ui";

export function RecommendationsCard() {
    const actions = [
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
    ];

    return (
        <Card className="p-5">
            <SectionTitle>Recommended Actions</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((r) => (
                    <div
                        key={r.n}
                        className="rounded-xl p-4"
                        style={{ background: "#F8FAFC", borderLeft: `3px solid ${r.color}` }}
                    >
                        <span className="text-3xl font-black" style={{ color: `${r.color}33` }}>{r.n}</span>
                        <p className="text-sm font-semibold mt-1 mb-1" style={{ color: COLORS.text }}>{r.title}</p>
                        <p className="text-xs leading-relaxed" style={{ color: COLORS.subtext }}>{r.body}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function CaveatsCard() {
    const items = [
        "This analysis is correlational, not causal.",
        "Distance is straight-line distance, not actual travel time.",
        "Absence is inferred from absent_rate = 1 − in_person_rate − online_rate.",
        "Students over 50 km can be included via the filter toggle. When included, they appear in the 50+km distance bin.",
        "Absence may also be influenced by tutor, subject, class timing, student preference, school workload, and family circumstances.",
        "Next step would be to connect actual attendance records, enrolment status, and re-enrolment outcomes.",
    ];

    return (
        <Card className="p-5">
            <SectionTitle>Methodology and Caveats</SectionTitle>
            <ul className="space-y-2">
                {items.map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: COLORS.subtext }}>
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: COLORS.muted }} />
                        {text}
                    </li>
                ))}
            </ul>
        </Card>
    );
}