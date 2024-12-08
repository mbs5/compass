"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const filters = {
  demographics: [
    { id: "age", label: "Age Group", options: ["0-17", "18-34", "35-50", "51-69", "70+"] },
    { id: "ethnicity", label: "Ethnicity", options: ["Native Hawaiian", "Pacific Islander", "Asian", "Other"] },
    { id: "income", label: "Income Level", options: ["Low", "Medium", "High"] },
  ],
  social: [
    { id: "education", label: "Education", options: ["Less than HS", "HS Graduate", "College+"] },
    { id: "housing", label: "Housing Status", options: ["Stable", "Unstable", "Homeless"] },
    { id: "transport", label: "Transportation Access", options: ["Good", "Limited", "None"] },
  ],
};

export function EquityFilters() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Health Equity Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h4 className="mb-4 text-sm font-medium">Demographics</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filters.demographics.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
          <div>
            <h4 className="mb-4 text-sm font-medium">Social Determinants</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filters.social.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
        </div>
      </CardContent>
    </Card>
  );
} 