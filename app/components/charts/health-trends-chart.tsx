"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { ApexOptions } from "apexcharts";

interface ChartData {
  date: string;
  [key: string]: number | string;
}

interface ChartProps {
  filters: {
    gender?: string;
    race?: string;
    ethnicity?: string;
    state?: string;
    condition?: string;
  };
}

const COLORS = {
  "Mental Health": "#FF6B6B",   // Coral red
  "Chronic Disease": "#4ECDC4", // Turquoise
  "Respiratory": "#45B7D1",     // Sky blue
  "Cancer & Critical": "#FFB347",// Orange
  "Healthy": "#00C49F",         // Bright teal
  "Other": "#A78BFA"           // Purple
};

export function HealthTrendsChart({ filters }: ChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(filters as Record<string, string>);
        const response = await fetch(`/api/health-trends?${params}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        
        const rawData = await response.json();
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
          setData([]);
          return;
        }

        setData(rawData);
      } catch (err) {
        console.error("Error fetching health trends:", err);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-lg">Loading health trends...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-lg text-red-500">No trend data available</div>
      </div>
    );
  }

  // Get all categories from the first data point
  const categories = Object.keys(data[0]).filter(key => key !== 'date');
  
  // Prepare series data for ApexCharts
  const series = categories.map(category => ({
    name: category,
    data: data.map(d => d[category] as number)
  }));

  const options: ApexOptions = {
    chart: {
      type: 'area',
      stacked: true,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    colors: categories.map(cat => COLORS[cat as keyof typeof COLORS] || "#999"),
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.1
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40
    },
    xaxis: {
      categories: data.map(d => d.date),
      labels: {
        rotate: 0,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Population Count'
      },
      labels: {
        formatter: (value) => value.toLocaleString()
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value) => value.toLocaleString()
      }
    },
    grid: {
      borderColor: '#f1f1f1'
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-[400px]">
        <Chart 
          options={options}
          series={series}
          type="area"
          height="100%"
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
                <th className="px-4 py-2 text-left">Date</th>
                {categories.map(category => (
                  <th key={category} className="px-4 py-2 text-right">{category}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">{row.date}</td>
                  {categories.map(category => (
                    <td key={category} className="px-4 py-2 text-right">
                      {(row[category] as number).toLocaleString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
} 