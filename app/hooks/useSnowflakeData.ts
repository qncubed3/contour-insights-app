"use client";

import { useEffect, useState } from "react";

export type StudentSnowflakeRow = {
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

export type CampusSnowflakeRow = {
    name: string;
    subtitle: string;
    lon: number;
    lat: number;
    address: string;
};

export type SnowflakeDataBundle = {
    students: StudentSnowflakeRow[];
    campuses: CampusSnowflakeRow[];
};

async function fetchData<T>(endpoint: string): Promise<T[]> {
    const res = await fetch(endpoint);

    if (!res.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
    }

    const json = await res.json();

    return json.data as T[];
}

export function useSnowflakeData() {
    const [data, setData] = useState<SnowflakeDataBundle>({
        students: [],
        campuses: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);

                const [students, campuses] = await Promise.all([
                    fetchData<StudentSnowflakeRow>("/api/snowflake/students"),
                    fetchData<CampusSnowflakeRow>("/api/snowflake/campuses"),
                ]);

                setData({
                    students,
                    campuses,
                });
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Unknown error"
                );
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    return { data, loading, error };
}