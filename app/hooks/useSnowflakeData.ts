"use client";

import { useEffect, useState } from "react";

export type SnowflakeRow = {
    created_at: string;
    student_id: string | number;
    lat: number;
    lon: number;
    address: string;
    suburb: string;
    postcode: string;
    country: string;
    year_level: string;
    school_name: string;
    region: string;
    gender: string;
    grad_yr: string | number;
};

export function useSnowflakeData() {
    const [data, setData] = useState<SnowflakeRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                const res = await fetch("/api/snowflake");

                if (!res.ok) {
                    throw new Error("Failed to fetch data");
                }

                const json = await res.json();

                // convert lat/lon to numbers (important for deck.gl)
                const cleaned = (json.data ?? []).map((row: any) => ({
                    ...row,
                    lat: Number(row.lat),
                    lon: Number(row.lon),
                }));

                setData(cleaned);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unknown error"
                );
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { data, loading, error };
}