import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    let query = `
      SELECT date, total_cost, avg_cost_per_service, unique_members
      FROM monthly_cost_trends
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY date ASC`;

    const stmt = db.prepare(query);
    const costTrends = stmt.all(...params);

    return NextResponse.json(costTrends);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost trends" },
      { status: 500 }
    );
  }
} 