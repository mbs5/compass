"use client";

import { useEffect, useState } from "react";
import { EquityFilters } from "@/app/components/filters/equity-filters";
import { StatsCard } from "@/app/components/dashboard/stats-card";
import { HealthTrendsChart } from "@/app/components/charts/health-trends-chart";
import { DemographicDistribution } from "@/app/components/charts/demographic-distribution";
import { ConditionDistribution } from "@/app/components/charts/condition-distribution";

interface DashboardStats {
  totalPatients: {
    current: number;
    change: { value: number; period: string; trend: 'up' | 'down' };
    rawData?: any[];
  };
  activeCases: {
    current: number;
    change: { value: number; period: string; trend: 'up' | 'down' };
    rawData?: any[];
  };
  readmissionRate: {
    current: number;
    change: { value: number; period: string; trend: 'up' | 'down' };
    rawData?: any[];
  };
  patientSatisfaction: {
    current: number;
    change: { value: number; period: string; trend: 'up' | 'down' };
    rawData?: any[];
  };
}

interface Filters {
  gender?: string;
  race?: string;
  ethnicity?: string;
  state?: string;
  condition?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Refetch stats with new filters
    fetchStats(newFilters);
  };

  const fetchStats = async (currentFilters: Filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/dashboard-stats?${params}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  // Construct URL params for the filters
  const filterParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) filterParams.append(key, value);
  });
  const filterString = filterParams.toString();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <EquityFilters onFilterChange={handleFilterChange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={stats?.totalPatients.current || 0}
          change={stats?.totalPatients.change || { value: 0, period: "24h", trend: "up" }}
          description="Total number of unique patients in the system"
          rawData={stats?.totalPatients.rawData}
        />
        <StatsCard
          title="Active Cases"
          value={stats?.activeCases.current || 0}
          change={stats?.activeCases.change || { value: 0, period: "24h", trend: "up" }}
          description="Number of patients currently under active care"
          rawData={stats?.activeCases.rawData}
        />
        <StatsCard
          title="Readmission Rate"
          value={stats?.readmissionRate.current || 0}
          unit="%"
          change={stats?.readmissionRate.change || { value: 0, period: "24h", trend: "down" }}
          description="Percentage of patients readmitted within 30 days"
          rawData={stats?.readmissionRate.rawData}
        />
        <StatsCard
          title="Patient Satisfaction"
          value={stats?.patientSatisfaction.current || 0}
          unit="%"
          change={stats?.patientSatisfaction.change || { value: 0, period: "24h", trend: "up" }}
          description="Average patient satisfaction score"
          rawData={stats?.patientSatisfaction.rawData}
        />
      </div>
      <div className="grid gap-4">
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Population Health Trends</h3>
          <div className="h-[400px]">
            <HealthTrendsChart key={filterString} filters={filters} />
          </div>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Condition Distribution</h3>
          <div className="h-[500px]">
            <ConditionDistribution key={filterString} filters={filters} />
          </div>
        </div>
        <div className="p-6 bg-card rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Demographic Distribution</h3>
          <div className="h-[500px]">
            <DemographicDistribution key={filterString} dimension="race" filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
} 