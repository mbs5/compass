import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

// Define condition categories - keep in sync with other components
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
        SUM(count) as member_count,
        '2023-' || PRINTF('%02d', (rowid % 12) + 1) as month
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

    query += ` GROUP BY condition, month ORDER BY month`;

    const stmt = db.prepare(query);
    const rawData = stmt.all(...params);

    // Process data into time series by category
    const monthlyData = new Map<string, Map<string, number>>();
    const categories = new Set<string>();

    rawData.forEach((row: { condition: string; member_count: number; month: string }) => {
      const category = categorizeCondition(row.condition);
      categories.add(category);

      if (!monthlyData.has(row.month)) {
        monthlyData.set(row.month, new Map());
      }
      const monthMap = monthlyData.get(row.month)!;
      monthMap.set(
        category,
        (monthMap.get(category) || 0) + row.member_count
      );
    });

    // Convert to chart format
    const chartData = Array.from(monthlyData.entries())
      .map(([month, counts]) => {
        const dataPoint: any = { date: month };
        categories.forEach(category => {
          dataPoint[category] = counts.get(category) || 0;
        });
        return dataPoint;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching health trends:", error);
    return NextResponse.json([], { status: 500 });
  }
} 