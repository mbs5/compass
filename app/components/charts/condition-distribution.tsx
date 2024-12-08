"use client";

import { useEffect, useState } from "react";
import { ResponsivePie } from "@nivo/pie";

interface ConditionData {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
}

// Vibrant color scheme
const COLORS = {
  "Healthy": "#00C49F",         // Bright teal
  "Mental Health": "#FF6B6B",   // Coral red
  "Chronic Disease": "#4ECDC4", // Turquoise
  "Cancer & Critical": "#FFB347",// Orange
  "Respiratory": "#45B7D1",     // Sky blue
  "Other": "#A78BFA"           // Purple
};

interface Props {
  filters: {
    gender?: string;
    race?: string;
    ethnicity?: string;
    state?: string;
    condition?: string;
  };
}

export function ConditionDistribution({ filters }: Props) {
  const [data, setData] = useState<ConditionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        const response = await fetch(`/api/condition-distribution?${params}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const rawData = await response.json();
        
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
          setData([]);
          return;
        }

        const total = rawData.reduce((sum, item) => sum + item.member_count, 0);
        const formattedData = rawData.map(item => ({
          id: item.PRIMARY_CHRONIC_CONDITION_ROLLUP_DESC,
          label: item.PRIMARY_CHRONIC_CONDITION_ROLLUP_DESC,
          value: item.member_count,
          formattedValue: `${((item.member_count / total) * 100).toFixed(1)}%`
        }));

        setData(formattedData);
      } catch (err) {
        console.error("Error fetching condition data:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-lg">Loading data...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-lg text-red-500">No data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-[500px]">
        <ResponsivePie
          data={data}
          margin={{ top: 40, right: 140, bottom: 40, left: 140 }}
          innerRadius={0.6}
          padAngle={0.5}
          cornerRadius={8}
          activeOuterRadiusOffset={8}
          colors={(d) => COLORS[d.id as keyof typeof COLORS] || "#999999"}
          borderWidth={1}
          borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
          enableArcLinkLabels={true}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor="#333333"
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: 'color' }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor="#ffffff"
          arcLabel={d => `${d.data.formattedValue}`}
          motionConfig="gentle"
          legends={[
            {
              anchor: 'right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 12,
              itemWidth: 140,
              itemHeight: 24,
              itemTextColor: '#333',
              itemDirection: 'left-to-right',
              itemOpacity: 1,
              symbolSize: 14,
              symbolShape: 'circle'
            }
          ]}
          tooltip={({ datum }) => (
            <div className="bg-white px-3 py-2 shadow rounded border">
              <strong>{datum.label}</strong>
              <div>Count: {datum.value.toLocaleString()}</div>
              <div>Percentage: {datum.data.formattedValue}</div>
            </div>
          )}
        />
      </div>

      {/* Data Transparency Section */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          View Raw Data
        </summary>
        <div className="mt-2 max-h-60 overflow-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Condition</th>
                <th className="px-4 py-2 text-right">Count</th>
                <th className="px-4 py-2 text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2 text-right">{row.value.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{row.formattedValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
} 