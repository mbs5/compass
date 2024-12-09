import { NextResponse } from "next/server";
const db = require("@/app/lib/db");

// Define interfaces for database records
interface DemographicRecord {
  race?: string;
  ethnicity?: string;
  gender?: string;
  state?: string;
  condition?: string;
  count: number;
}

interface ResultRecord {
  MEM_RACE?: string;
  MEM_ETHNICITY?: string;
  member_count: number;
}

// Define mappings for race and ethnicity codes based on actual database values
const RACE_LABELS: { [key: string]: string } = {
  "1": "Asian",
  "2": "Black",
  "3": "Hispanic",
  "4": "White"
};

const ETHNICITY_LABELS: { [key: string]: string } = {
  "1": "Hispanic",
  "2": "Non-Hispanic",
  "3": "Unknown"
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get("condition");
  const dimension = searchParams.get("dimension");

  try {
    // First check if table exists
    const tableExists = db.prepare(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='demographic_summary'
    `).get();

    if (!tableExists) {
      return NextResponse.json([]);
    }

    // Get unique values for filters with proper labels
    const uniqueValues = {
      gender: db.prepare('SELECT DISTINCT gender FROM demographic_summary').all(),
      race: db.prepare('SELECT DISTINCT race FROM demographic_summary')
        .all()
        .map((r: DemographicRecord) => ({ race: RACE_LABELS[r.race || ""] || r.race })),
      ethnicity: db.prepare('SELECT DISTINCT ethnicity FROM demographic_summary')
        .all()
        .map((e: DemographicRecord) => ({ ethnicity: ETHNICITY_LABELS[e.ethnicity || ""] || e.ethnicity })),
      state: db.prepare('SELECT DISTINCT state FROM demographic_summary').all(),
      condition: db.prepare('SELECT DISTINCT condition FROM demographic_summary').all()
    };

    // If dimension is specified, return demographic distribution data
    if (dimension) {
      let query = `
        SELECT 
          ${dimension} as MEM_${dimension.toUpperCase()},
          SUM(count) as member_count
        FROM demographic_summary
        WHERE 1=1
      `;
      const params: any[] = [];

      if (condition) {
        query += ` AND condition LIKE ?`;
        params.push(`%${condition}%`);
      }

      query += ` GROUP BY ${dimension} ORDER BY member_count DESC`;

      const stmt = db.prepare(query);
      const results = stmt.all(...params);

      // Apply labels for race and ethnicity
      if (dimension === 'race') {
        results.forEach((r: ResultRecord) => {
          r.MEM_RACE = RACE_LABELS[r.MEM_RACE || ""] || r.MEM_RACE;
        });
      } else if (dimension === 'ethnicity') {
        results.forEach((e: ResultRecord) => {
          e.MEM_ETHNICITY = ETHNICITY_LABELS[e.MEM_ETHNICITY || ""] || e.MEM_ETHNICITY;
        });
      }

      return NextResponse.json(results);
    }

    // Otherwise return filter data
    let query = `
      SELECT 
        gender,
        race,
        ethnicity,
        state,
        condition,
        count
      FROM demographic_summary
      WHERE 1=1
    `;
    const params: any[] = [];

    if (condition) {
      query += ` AND condition LIKE ?`;
      params.push(`%${condition}%`);
    }

    const stmt = db.prepare(query);
    const demographics = stmt.all(...params);

    return NextResponse.json({
      filters: uniqueValues,
      data: demographics
    });
  } catch (error) {
    console.error("Error fetching demographic insights:", error);
    return NextResponse.json({ filters: {}, data: [] }, { status: 500 });
  }
} 