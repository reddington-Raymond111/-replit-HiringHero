import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Briefcase,
  Filter
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("last30days");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard-stats'],
  });

  // Date ranges
  const getDateRange = () => {
    switch (timeRange) {
      case "last7days":
        return "Last 7 days";
      case "last30days":
        return "Last 30 days";
      case "last90days":
        return "Last 90 days";
      case "lastYear":
        return "Last 12 months";
      default:
        return "Last 30 days";
    }
  };

  // Mock data for charts (in a real app, this would come from the backend)
  // Applications over time
  const applicationsTimeData = [
    { name: format(subMonths(new Date(), 5), 'MMM'), applications: 32 },
    { name: format(subMonths(new Date(), 4), 'MMM'), applications: 48 },
    { name: format(subMonths(new Date(), 3), 'MMM'), applications: 40 },
    { name: format(subMonths(new Date(), 2), 'MMM'), applications: 65 },
    { name: format(subMonths(new Date(), 1), 'MMM'), applications: 76 },
    { name: format(new Date(), 'MMM'), applications: 53 }
  ];

  // Applications by department
  const applicationsByDepartment = [
    { name: "Engineering", value: 35 },
    { name: "Marketing", value: 15 },
    { name: "Sales", value: 20 },
    { name: "Design", value: 18 },
    { name: "Product", value: 12 }
  ];

  // Time to hire by department
  const timeToHireData = [
    { name: "Engineering", value: 25 },
    { name: "Marketing", value: 18 },
    { name: "Sales", value: 15 },
    { name: "Design", value: 22 },
    { name: "Product", value: 20 }
  ];

  // Source of applications
  const applicationSourceData = [
    { name: "Company Website", value: 40 },
    { name: "LinkedIn", value: 30 },
    { name: "Indeed", value: 15 },
    { name: "Referrals", value: 10 },
    { name: "Other", value: 5 }
  ];

  // Colors for pie chart
  const COLORS = ['#3f51b5', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00acc1'];

  return (
    <main className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Recruitment Analytics</h2>
            <p className="mt-1 text-sm text-neutral-500">Track and analyze your recruitment metrics</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last90days">Last 90 days</SelectItem>
                <SelectItem value="lastYear">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Department
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {["Engineering", "Marketing", "Sales", "Design", "Product"].map((dept) => (
                  <DropdownMenuCheckboxItem
                    key={dept}
                    checked={departmentFilter.includes(dept)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDepartmentFilter([...departmentFilter, dept]);
                      } else {
                        setDepartmentFilter(departmentFilter.filter(d => d !== dept));
                      }
                    }}
                  >
                    {dept}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCandidates || 0}</div>
                <p className="text-xs text-neutral-500 mt-1">
                  {getDateRange()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Average Time to Hire</CardTitle>
                <Calendar className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.avgTimeToHire || 0} days</div>
                <p className="text-xs text-neutral-500 mt-1">
                  {getDateRange()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
                <p className="text-xs text-neutral-500 mt-1">
                  Currently active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((stats?.totalCandidates ? 12 / stats.totalCandidates * 100 : 0) * 10) / 10}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Applications to hire
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="efficiency">Hiring Efficiency</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
                <CardDescription>Monthly application volume</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={applicationsTimeData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="applications" fill="#3f51b5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Applications by Department</CardTitle>
                <CardDescription>Distribution across teams</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={applicationsByDepartment}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationsByDepartment.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Applications Pipeline</CardTitle>
              <CardDescription>Current candidates by recruitment stage</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={Object.entries(stats?.candidatesByStage || {}).map(([name, value]) => ({ name, value }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3f51b5" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="efficiency">
          <Card>
            <CardHeader>
              <CardTitle>Time to Hire by Department</CardTitle>
              <CardDescription>Average days from application to offer</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={timeToHireData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4caf50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Sources</CardTitle>
                <CardDescription>Where candidates are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <RePieChart>
                      <Pie
                        data={applicationSourceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {applicationSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>Application volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={applicationsTimeData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="applications" stroke="#3f51b5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
