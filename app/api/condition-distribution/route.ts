import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

// Define condition categories
const conditionCategories = {
  "Mental Health": ["DEPRESSION", "PSYCHOSIS", "DEMENTIA", "MENTAL"],
  "Chronic Disease": ["DIABETES", "CAD", "HYPERTENSION", "HEART"],
  "Respiratory": ["COPD", "ASTHMA"],
  "Cancer & Critical": ["CANCER", "RENAL", "LIVER", "HIV"],
  "Healthy": ["HEALTHY"],
  "Other": []  // Catch-all for uncategorized conditions
};

function categorizeCondition(condition: string): string {
  const upperCondition = condition.toUpperCase();
  for (const [category, keywords] of Object.entries(conditionCategories)) {
    if (keywords.some(keyword => upperCondition.includes(keyword))) {
      return category;
    }
  }
  return "Other";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get("gender");
    const race = searchParams.get("race");
    const ethnicity = searchParams.get("ethnicity");
    const state = searchParams.get("state");

    // First check if table exists
    const tableExists = db.prepare(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='demographic_summary'
    `).get();

    if (!tableExists) {
      return NextResponse.json([]);
    }

    let query = `
      SELECT 
        condition,
        SUM(count) as member_count
      FROM demographic_summary
      WHERE 1=1
    `;
    const params: any[] = [];

    // Add filter conditions
    if (gender) {
      query += ` AND gender = ?`;
      params.push(gender);
    }
    if (race) {
      query += ` AND race = ?`;
      params.push(race);
    }
    if (ethnicity) {
      query += ` AND ethnicity = ?`;
      params.push(ethnicity);
    }
    if (state) {
      query += ` AND state = ?`;
      params.push(state);
    }

    query += ` GROUP BY condition`;

    const stmt = db.prepare(query);
    const rawConditions = stmt.all(...params);

    // Group conditions by category
    const categoryTotals = new Map<string, number>();
    rawConditions.forEach((row: { condition: string; member_count: number }) => {
      const category = categorizeCondition(row.condition);
      categoryTotals.set(
        category, 
        (categoryTotals.get(category) || 0) + row.member_count
      );
    });

    // Calculate total for percentages
    const total = Array.from(categoryTotals.values()).reduce((sum, count) => sum + count, 0);

    // Format the response with exact category names matching the color mapping
    const conditions = Array.from(categoryTotals.entries())
      .map(([category, count]) => ({
        PRIMARY_CHRONIC_CONDITION_ROLLUP_DESC: category,
        member_count: count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
      .sort((a, b) => b.member_count - a.member_count);

    return NextResponse.json(conditions || []);
  } catch (error) {
    console.error("Error fetching condition distribution:", error);
    return NextResponse.json([], { status: 500 });
  }
} 