"use client";

type HandleProps = {
    value: number;
    percent: (v: number) => number;
    onMouseDown: () => void;
    color: string;
};

export default function Handle({
    value,
    percent,
    onMouseDown,
    color,
}: HandleProps) {
    return (
        <div
            onMouseDown={onMouseDown}
            className={`absolute top-1/2 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full ${color} shadow`}
            style={{ left: `${percent(value)}%` }}
        />
    );
}