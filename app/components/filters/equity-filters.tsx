"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FilterOptions {
  gender: Array<{ gender: string }>;
  race: Array<{ race: string }>;
  ethnicity: Array<{ ethnicity: string }>;
  state: Array<{ state: string }>;
  condition: Array<{ condition: string }>;
}

interface EquityFiltersProps {
  onFilterChange: (filters: {
    gender?: string;
    race?: string;
    ethnicity?: string;
    state?: string;
    condition?: string;
  }) => void;
}

export function EquityFilters({ onFilterChange }: EquityFiltersProps) {
  const [filters, setFilters] = useState({
    gender: "",
    race: "",
    ethnicity: "",
    state: "",
    condition: "",
  });

  const [options, setOptions] = useState<FilterOptions>({
    gender: [],
    race: [],
    ethnicity: [],
    state: [],
    condition: [],
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch("/api/demographic-insights");
        if (!response.ok) throw new Error("Failed to fetch demographic data");
        
        const data = await response.json();
        setOptions(data.filters);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const filterGroups = [
    {
      title: "Demographics",
      filters: [
        { id: "gender", label: "Gender", options: options.gender.map(g => g.gender) },
        { id: "race", label: "Race", options: options.race.map(r => r.race) },
        { id: "ethnicity", label: "Ethnicity", options: options.ethnicity.map(e => e.ethnicity) },
      ],
    },
    {
      title: "Location & Condition",
      filters: [
        { id: "state", label: "State", options: options.state.map(s => s.state) },
        { id: "condition", label: "Condition", options: options.condition.map(c => c.condition) },
      ],
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Health Equity Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {filterGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-sm font-medium">{group.title}</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.filters.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={filters[filter.id as keyof typeof filters]}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    >
                      <option value="">All</option>
                      {filter.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 