import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get("condition");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    // First check if table exists
    const tableExists = db.prepare(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='condition_prevalence'
    `).get();

    if (!tableExists) {
      return NextResponse.json([]);
    }

    let query = `
      SELECT 
        date as date,
        condition as condition,
        count as count,
        prevalence_percentage as prevalence_percentage
      FROM condition_prevalence
      WHERE 1=1
    `;
    const params: any[] = [];

    if (condition) {
      query += ` AND condition LIKE ?`;
      params.push(`%${condition}%`);
    }

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
    const trends = stmt.all(...params);

    return NextResponse.json(trends || []);
  } catch (error) {
    console.error("Error fetching condition trends:", error);
    return NextResponse.json([], { status: 500 });
  }
} 