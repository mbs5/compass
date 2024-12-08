"use client";

import { Card } from "@/components/ui/card";
import { useRef } from "react";

interface StatsCardProps {
  title: string;
  value: number;
  unit?: string;
  change: {
    value: number;
    period: string;
    trend: 'up' | 'down';
  };
  description?: string;
  rawData?: any[];
}

export function StatsCard({ title, value, unit = "", change, description, rawData }: StatsCardProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Card 
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => dialogRef.current?.showModal()}
      >
        <div className="text-2xl font-bold">
          {value.toLocaleString()}{unit}
        </div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className={`text-sm ${change.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change.trend === 'up' ? '+' : ''}{change.value} from {change.period}
        </div>
      </Card>

      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-lg p-6 backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current.close();
          }
        }}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{title} Details</h2>
            <button 
              onClick={() => dialogRef.current?.close()}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Current Value</h4>
            <p className="text-2xl font-bold">{value.toLocaleString()}{unit}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Change</h4>
            <p className={`${change.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change.trend === 'up' ? '+' : ''}{change.value} from {change.period}
            </p>
          </div>
          {description && (
            <div>
              <h4 className="text-sm font-medium mb-2">How this is calculated</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}
          
          {/* Raw Data Section */}
          {rawData && rawData.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                View Raw Data
              </summary>
              <div className="mt-2 max-h-60 overflow-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(rawData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.map((row, i) => (
                      <tr key={i} className="border-b">
                        {Object.values(row).map((value: any, j) => (
                          <td key={j} className="px-4 py-2">
                            {typeof value === 'object' && value !== null
                              ? JSON.stringify(value)
                              : typeof value === 'number' 
                                ? value.toLocaleString() 
                                : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </dialog>
    </>
  );
} 