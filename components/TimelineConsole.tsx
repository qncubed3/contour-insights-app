"use client";

import { useRef, useState, useEffect } from "react";
import Handle from "./Handle";

type Props = {
    minDate: Date | null;
    maxDate: Date | null;
    startDate: Date | null;
    endDate: Date | null;
    currentDate: Date | null;
    isPlaying: boolean | null;

    onStartDateChange: (d: Date | null) => void;
    onEndDateChange: (d: Date | null) => void;
    onCurrentDateChange: (d: Date | null) => void;
    onTogglePlay: () => void;
};

function formatDate(date: Date | null) {
    if (!date) return "—";

    return date.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function TimelineConsole(props: Props) {
    const {
        minDate,
        maxDate,
        startDate,
        endDate,
        currentDate,
        isPlaying,
        onStartDateChange,
        onEndDateChange,
        onCurrentDateChange,
        onTogglePlay,
    } = props;

    const trackRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<
        "start" | "end" | "current" | null
    >(null);

    // -----------------------------
    // ❗ HOOKS MUST ALWAYS RUN FIRST
    // -----------------------------
    useEffect(() => {
        function onMove(e: PointerEvent) {
            if (!dragging) return;
            update(positionToValue(e.clientX));
        }

        function onUp() {
            setDragging(null);
        }

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);

        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [dragging]);

    // -----------------------------
    // NULL GUARD (AFTER HOOKS ONLY)
    // -----------------------------
    if (!minDate || !maxDate || !startDate || !endDate || !currentDate) {
        return (
            <div className="absolute bottom-4 left-1/2 z-20 w-[700px] -translate-x-1/2 rounded-2xl bg-white/90 p-4 text-center text-sm text-zinc-500 shadow-xl backdrop-blur">
                Timeline unavailable
            </div>
        );
    }

    // -----------------------------
    // SAFE NUMERIC STATE
    // -----------------------------
    const min = minDate.getTime();
    const max = maxDate.getTime();
    const range = Math.max(1, max - min);

    const start = Math.max(min, Math.min(startDate.getTime(), max));
    const end = Math.max(start, Math.min(endDate.getTime(), max));
    const current = Math.max(start, Math.min(currentDate.getTime(), end));

    function percent(value: number) {
        return ((value - min) / range) * 100;
    }

    function positionToValue(clientX: number) {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect) return min;

        const ratio = (clientX - rect.left) / rect.width;
        const clamped = Math.max(0, Math.min(1, ratio));

        return min + clamped * range;
    }

    function update(value: number) {
        if (dragging === "start") {
            const next = Math.min(value, end);
            onStartDateChange(new Date(next));

            if (current < next) {
                onCurrentDateChange(new Date(next));
            }
        }

        if (dragging === "end") {
            const next = Math.max(value, start);
            onEndDateChange(new Date(next));

            if (current > next) {
                onCurrentDateChange(new Date(next));
            }
        }

        if (dragging === "current") {
            const next = Math.max(start, Math.min(value, end));
            onCurrentDateChange(new Date(next));
        }
    }

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="absolute bottom-4 left-1/2 z-20 w-[700px] -translate-x-1/2 rounded-2xl bg-white/90 p-4 shadow-xl backdrop-blur">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={onTogglePlay}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white hover:bg-zinc-700"
                >
                    {isPlaying ? "❚❚" : "▶"}
                </button>

                <div className="text-sm font-medium">
                    {formatDate(currentDate)}
                </div>

                <div className="text-xs text-zinc-500">
                    {formatDate(startDate)} — {formatDate(endDate)}
                </div>
            </div>

            {/* Timeline */}
            <div
                ref={trackRef}
                className="relative h-6 w-full cursor-pointer"
                onPointerDown={(e) => {
                    const value = positionToValue(e.clientX);
                    setDragging("current");
                    update(value);
                }}
            >
                {/* base */}
                <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded bg-zinc-200" />

                {/* selected range */}
                <div
                    className="absolute top-1/2 h-2 -translate-y-1/2 rounded bg-zinc-900/30"
                    style={{
                        left: `${percent(start)}%`,
                        width: `${percent(end) - percent(start)}%`,
                    }}
                />

                {/* handles */}
                <Handle
                    value={start}
                    percent={percent}
                    onMouseDown={() => setDragging("start")}
                    color="bg-zinc-800"
                />

                <Handle
                    value={end}
                    percent={percent}
                    onMouseDown={() => setDragging("end")}
                    color="bg-zinc-800"
                />

                <Handle
                    value={current}
                    percent={percent}
                    onMouseDown={() => setDragging("current")}
                    color="bg-blue-600"
                />
            </div>
        </div>
    );
}