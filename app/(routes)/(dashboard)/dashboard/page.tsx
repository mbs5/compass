import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HealthTrendsChart } from "@/components/charts/health-trends-chart";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium">Total Patients</h3>
              <div className="mt-2 text-2xl font-bold">2,350</div>
              <p className="text-xs text-muted-foreground">+180 from last month</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Active Cases</h3>
              <div className="mt-2 text-2xl font-bold">1,203</div>
              <p className="text-xs text-muted-foreground">+20 from last week</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Readmission Rate</h3>
              <div className="mt-2 text-2xl font-bold">12.3%</div>
              <p className="text-xs text-muted-foreground">-2.1% from last month</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium">Patient Satisfaction</h3>
              <div className="mt-2 text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+1.2% from last month</p>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 p-6">
              <h3 className="text-lg font-medium mb-4">Population Health Trends</h3>
              <div className="h-[300px]">
                <HealthTrendsChart />
              </div>
            </Card>
            <Card className="col-span-3 p-6">
              <h3 className="text-lg font-medium">Health Disparities Map</h3>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Map Component Coming Soon
              </div>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Detailed Analytics</h3>
              <p className="text-muted-foreground">Coming Soon</p>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Generated Reports</h3>
              <p className="text-muted-foreground">Coming Soon</p>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">System Notifications</h3>
              <p className="text-muted-foreground">Coming Soon</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 