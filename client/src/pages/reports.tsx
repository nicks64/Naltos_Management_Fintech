import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ReportData {
  delinquencyAging: Array<{ bucket: string; count: number; amount: number }>;
  noiTrend: Array<{ month: string; noi: number }>;
  opexPerUnit: Array<{ property: string; opex: number }>;
  treasuryYield: Array<{ month: string; yield: number; tbillRate: number }>;
}

export default function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("delinquency");

  const { data: reports, isLoading } = useQuery<ReportData>({
    queryKey: ["/api/reports"],
  });

  const handleExportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your CSV report will download shortly.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your PDF report will download shortly.",
    });
  };

  return (
    <div className="space-y-8" data-testid="page-reports">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight mb-2">Reports</h1>
          <p className="text-muted-foreground">
            Financial analytics and export capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} data-testid="button-export-pdf">
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-64" data-testid="select-report-type">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="delinquency">Delinquency Aging</SelectItem>
            <SelectItem value="noi">NOI Trend</SelectItem>
            <SelectItem value="opex">Opex per Unit</SelectItem>
            <SelectItem value="treasury">Treasury Yield</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ) : (
        <>
          {reportType === "delinquency" && reports?.delinquencyAging && (
            <Card>
              <CardHeader>
                <CardTitle>Delinquency Aging Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reports.delinquencyAging}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" name="Number of Accounts" />
                    <Bar dataKey="amount" fill="hsl(var(--chart-2))" name="Total Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {reportType === "noi" && reports?.noiTrend && (
            <Card>
              <CardHeader>
                <CardTitle>Net Operating Income Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reports.noiTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="noi" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="NOI ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {reportType === "opex" && reports?.opexPerUnit && (
            <Card>
              <CardHeader>
                <CardTitle>Operating Expense per Unit by Property</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reports.opexPerUnit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="property" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="opex" fill="hsl(var(--chart-3))" name="Opex per Unit ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {reportType === "treasury" && reports?.treasuryYield && (
            <Card>
              <CardHeader>
                <CardTitle>Treasury Yield vs T-Bill Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reports.treasuryYield}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="yield" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Treasury Yield (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tbillRate" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="T-Bill Rate (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
