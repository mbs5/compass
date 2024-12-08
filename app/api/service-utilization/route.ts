import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const settingType = searchParams.get("settingType");

  try {
    let query = `
      SELECT setting_type, total_count, avg_cost, unique_members
      FROM service_setting_summary
      WHERE 1=1
    `;
    const params: any[] = [];

    if (settingType) {
      query += ` AND setting_type = ?`;
      params.push(settingType);
    }

    const stmt = db.prepare(query);
    const utilization = stmt.all(...params);

    return NextResponse.json(utilization);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch service utilization data" },
      { status: 500 }
    );
  }
} 