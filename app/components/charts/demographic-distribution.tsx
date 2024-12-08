"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DemographicData {
  category: string;
  count: number;
  percentage: number;
  rawValue: string;
}

interface Props {
  dimension: "gender" | "race" | "ethnicity" | "state";
  filters: {
    gender?: string;
    race?: string;
    ethnicity?: string;
    state?: string;
    condition?: string;
  };
}

interface DimensionLabels {
  [key: string]: { [key: string]: string }
}

const dimensionLabels: DimensionLabels = {
  gender: {
    "F": "Female",
    "M": "Male"
  },
  race: {
    "1": "Asian",
    "2": "Pacific Islander",
    "3": "Native Hawaiian",
    "4": "Other"
  },
  ethnicity: {
    "1": "Hispanic",
    "2": "Non-Hispanic",
    "3": "Unknown"
  },
  state: {
    "HI": "Hawaii",
    "CA": "California",
    "WA": "Washington",
    "MI": "Michigan"
  }
};

const COLORS = {
  gender: "#8884d8",
  race: "#82ca9d",
  ethnicity: "#ffc658",
  state: "#ff8042"
};

export function DemographicDistribution({ dimension, filters }: Props) {
  const [data, setData] = useState<DemographicData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(filters as Record<string, string>);
        params.append("dimension", dimension);

        const response = await fetch(`/api/demographic-insights?${params}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const rawData = await response.json();
        
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
          setData([]);
          return;
        }
        
        // Process the data to get counts by dimension
        const counts = new Map<string, number>();
        rawData.forEach((item: any) => {
          const key = item[`MEM_${dimension.toUpperCase()}`];
          counts.set(key, (counts.get(key) || 0) + item.member_count);
        });

        // Calculate total for percentages
        const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

        // Convert to chart format and sort by count
        const chartData = Array.from(counts.entries())
          .map(([category, count]) => ({
            category: dimensionLabels[dimension][category] || category,
            count,
            percentage: Number(((count / total) * 100).toFixed(1)),
            rawValue: category
          }))
          .sort((a, b) => b.count - a.count);

        setData(chartData);
      } catch (err) {
        console.error("Error fetching demographic data:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dimension, filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="text-lg text-red-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={40}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="category"
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fill: '#666' }}
            tickLine={{ stroke: '#666' }}
            label={{ 
              value: 'Population Count', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#666' }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
            formatter={(value: number, name: string) => [
              name === 'count' ? value.toLocaleString() : `${value}%`,
              name === 'count' ? 'Count' : 'Percentage'
            ]}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar 
            dataKey="count" 
            fill={COLORS[dimension]}
            name="Population Count"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Data Transparency Section */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View Raw Data
        </summary>
        <div className="mt-2 max-h-60 overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Raw Value</th>
                <th className="px-4 py-2 text-right">Count</th>
                <th className="px-4 py-2 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2">{row.rawValue}</td>
                  <td className="px-4 py-2 text-right">{row.count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
} 