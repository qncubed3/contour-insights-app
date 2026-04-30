import { NextResponse } from "next/server";
import { querySnowflake } from "@/lib/snowflake";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {

        const database = process.env.SNOWFLAKE_DATABASE;
        const schema = process.env.SNOWFLAKE_SCHEMA;
        const table = process.env.SNOWFLAKE_TABLE;

        if (!database || !schema || !table) {
            throw new Error("Missing Snowflake env variables");
        }
        const sql = `
            SELECT
                *
            FROM CONTOUR_DATABASE.MART."MM34_SCgeo_final"
            LIMIT 100000
        `;
        // const sql = `
        //     SELECT
        //         created_at,
        //         student_id,
        //         lat,
        //         lon,
        //         address,
        //         suburb,
        //         postcode,
        //         country,
        //         year_level,
        //         school_name,
        //         region,
        //         gender,
        //         grad_yr
        //     FROM ${database}.${schema}.${table}
        //     WHERE lat IS NOT NULL
        //     AND lon IS NOT NULL
        //     ORDER BY created_at DESC
        //     LIMIT 100000
        // `;
        const rows = await querySnowflake(sql);

        return NextResponse.json({
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        console.error("Snowflake fetch failed:", error);

        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 }
        );
    }
}