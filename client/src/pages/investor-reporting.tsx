import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PieChart, Download, Calendar, TrendingUp, Building2, DollarSign, Users, FileText } from "lucide-react";

const reports = [
  { id: "RPT-Q4-2024", name: "Q4 2024 Portfolio Summary", type: "Quarterly", date: "2025-01-15", status: "published" as const, properties: 7, totalNOI: 284500 },
  { id: "RPT-M01-2025", name: "January 2025 Monthly Report", type: "Monthly", date: "2025-02-05", status: "published" as const, properties: 7, totalNOI: 98200 },
  { id: "RPT-M02-2025", name: "February 2025 Monthly Report", type: "Monthly", date: "2025-02-20", status: "draft" as const, properties: 7, totalNOI: 102400 },
  { id: "RPT-REFI-001", name: "Sunset Heights Refi Package", type: "Refi Readiness", date: "2025-02-18", status: "in_review" as const, properties: 1, totalNOI: 45200 },
];

const portfolioMetrics = [
  { label: "Total Portfolio Value", value: "$42.8M", change: "+2.1%" },
  { label: "Weighted Avg Cap Rate", value: "5.8%", change: "+0.3%" },
  { label: "Debt Service Coverage", value: "1.42x", change: "+0.08x" },
  { label: "Loan-to-Value", value: "62%", change: "-1.2%" },
];

export default function InvestorReporting() {
  return (
    <div className="space-y-6" data-testid="page-investor-reporting">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Investor Reporting</h1>
          <p className="text-muted-foreground">Automated investor communications with real-time portfolio analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-schedule-report">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button data-testid="button-generate-report">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {portfolioMetrics.map((metric, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {i === 0 ? <Building2 className="w-4 h-4 text-muted-foreground" /> :
               i === 1 ? <PieChart className="w-4 h-4 text-muted-foreground" /> :
               i === 2 ? <TrendingUp className="w-4 h-4 text-muted-foreground" /> :
               <DollarSign className="w-4 h-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`text-metric-${i}`}>{metric.value}</div>
              <p className={`text-xs flex items-center gap-1 ${metric.change.startsWith("+") || metric.change.startsWith("-1") ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                <TrendingUp className="w-3 h-3" /> {metric.change} vs prior period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-lg">Report History</CardTitle>
          <Badge variant="secondary">{reports.length} reports</Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between gap-4 p-3 rounded-md border flex-wrap" data-testid={`report-${report.id}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{report.name}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{report.type}</span>
                      <span>{report.date}</span>
                      <span>{report.properties} {report.properties === 1 ? "property" : "properties"}</span>
                      <span className="font-mono">NOI: ${report.totalNOI.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={report.status === "published" ? "secondary" : report.status === "draft" ? "outline" : "default"}>
                    {report.status === "in_review" ? "In Review" : report.status}
                  </Badge>
                  <Button variant="outline" size="sm" data-testid={`button-download-${report.id}`}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Investor Distribution List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>LP Group A (5 investors)</span>
                <Badge variant="secondary">Monthly</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>LP Group B (3 investors)</span>
                <Badge variant="secondary">Quarterly</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>Strategic Partners (2)</span>
                <Badge variant="secondary">Monthly</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>Feb Monthly Report Due</span>
                <Badge variant="outline">Mar 5</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>Q1 Portfolio Review</span>
                <Badge variant="outline">Apr 15</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>Annual K-1 Distribution</span>
                <Badge variant="outline">Mar 15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
