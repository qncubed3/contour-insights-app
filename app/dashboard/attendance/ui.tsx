import React from "react";
import { COLORS, FONT_FAMILY } from "./lib";

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-xl bg-white shadow-sm ${className}`}
        >
            {children}
        </div>
    );
}

// ─── SectionTitle ─────────────────────────────────────────────────────────────

export function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2
            className="text-base font-semibold tracking-tight mb-4"
            style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}
        >
            {children}
        </h2>
    );
}

// ─── InsightBadge ─────────────────────────────────────────────────────────────

export function InsightBadge({ text }: { text: string }) {
    return (
        <p
            className="mt-3 text-xs leading-relaxed px-3 py-2 rounded-lg"
            style={{ color: COLORS.subtext, background: "#F1F5F9", fontFamily: FONT_FAMILY }}
        >
            <span className="font-semibold" style={{ color: COLORS.accent }}>Insight: </span>
            {text}
        </p>
    );
}

// ─── ChartCard ────────────────────────────────────────────────────────────────

export function ChartCard({
    title,
    insight,
    children,
    controls,
}: {
    title: string;
    insight: string;
    children: React.ReactNode;
    controls?: React.ReactNode;
}) {
    return (
        <Card className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <h3 className="text-sm font-semibold" style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}>
                    {title}
                </h3>
                {controls}
            </div>
            <div className="flex-1">{children}</div>
            <InsightBadge text={insight} />
        </Card>
    );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────

export function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <Card className="p-5 flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-widest" style={{ color: COLORS.subtext }}>
                {label}
            </span>
            <span className="text-3xl font-bold" style={{ color: COLORS.text, fontFamily: FONT_FAMILY }}>
                {value}
            </span>
            {sub && <span className="text-xs" style={{ color: COLORS.muted }}>{sub}</span>}
        </Card>
    );
}

// ─── FilterSelect ─────────────────────────────────────────────────────────────

export function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: COLORS.subtext }}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg border outline-none"
                style={{
                    borderColor: COLORS.border,
                    fontFamily: FONT_FAMILY,
                    color: COLORS.text,
                    background: "#F8FAFC",
                    maxWidth: 140,
                }}
            >
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

// ─── MiniSelect ───────────────────────────────────────────────────────────────

export function MiniSelect({
    value,
    onChange,
    options,
}: {
    value: string | number;
    onChange: (v: string) => void;
    options: (string | number)[];
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-xs px-2 py-1 rounded border outline-none"
            style={{ borderColor: COLORS.border, background: "#F8FAFC", color: COLORS.text, fontFamily: FONT_FAMILY }}
        >
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
    );
}