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
  Cell,
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
    "2": "Black",
    "3": "Hispanic",
    "4": "White"
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
  race: {
    "Asian": "#FF9F43",    // Warm orange
    "Black": "#4ECDC4",    // Turquoise
    "Hispanic": "#FF6B6B",  // Coral red
    "White": "#A78BFA"     // Purple
  }
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
        <div className="text-lg animate-pulse">Loading data...</div>
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
          barSize={60}
        >
          <defs>
            {Object.entries(COLORS[dimension as keyof typeof COLORS] || {}).map(([key, color]) => (
              <linearGradient key={key} id={`color-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#eee" 
            vertical={false}
          />
          <XAxis 
            dataKey="category"
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            axisLine={{ stroke: '#666' }}
          />
          <YAxis 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={{ stroke: '#666' }}
            axisLine={{ stroke: '#666' }}
            label={{ 
              value: 'Population Count', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#666', fontSize: 14 }
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number, name: string, props: any) => [
              <>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {name === 'count' ? value.toLocaleString() : `${value}%`}
                </span>
                <br />
                <span style={{ fontSize: '12px', color: '#666' }}>
                  {name === 'count' ? 'Total Population' : 'Percentage'}
                </span>
              </>,
              ''
            ]}
            labelStyle={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}
          />
          <Legend 
            verticalAlign="top" 
            height={36}
            formatter={(value) => (
              <span style={{ color: '#666', fontSize: '12px' }}>{value}</span>
            )}
          />
          <Bar 
            dataKey="count" 
            name="Population Count"
            radius={[8, 8, 0, 0]}
            fill="url(#color-White)"
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={`url(#color-${entry.category})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Data Transparency Section */}
      <details className="text-sm mt-4">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          View Raw Data
        </summary>
        <div className="mt-2 max-h-60 overflow-auto rounded-lg border">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-4 py-2 text-left font-medium">Category</th>
                <th className="px-4 py-2 text-right font-medium">Count</th>
                <th className="px-4 py-2 text-right font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.count.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right font-mono">{row.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
} 