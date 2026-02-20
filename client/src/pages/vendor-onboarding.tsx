import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  UserPlus, FileCheck, Clock, CheckCircle2, AlertCircle, Search,
  Building2, Shield, Brain, ArrowRight, Mail, Phone, Calendar,
  ChevronRight, Star, TrendingUp, Zap, Users, ClipboardList,
  Filter, Tag, MoreHorizontal, MessageSquare, Paperclip, X,
  ChevronDown, ArrowUpRight, MapPin, Briefcase, Target, Activity,
  Eye, Send, FileText, Upload, Hash, Globe, Truck, Wrench,
  BarChart3, DollarSign, AlertTriangle, Radio,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type VendorStage = "lead" | "documents" | "review" | "approved" | "active";

interface TimelineEvent {
  date: string;
  type: "email" | "call" | "document" | "note" | "stage_change" | "task";
  title: string;
  description: string;
  user: string;
}

interface OnboardingTask {
  label: string;
  completed: boolean;
  assignee: string;
  dueDate: string;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  stage: VendorStage;
  onboardDate: string;
  complianceScore: number;
  insurance: boolean;
  w9: boolean;
  coi: boolean;
  businessLicense: boolean;
  workersComp: boolean;
  properties: number;
  assignedProperties: string[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  website: string;
  address: string;
  neuralFitScore: number;
  relationshipScore: number;
  lastActivity: string;
  nextAction: string;
  totalSpend: number;
  avgResponseHrs: number;
  notes: string;
  tags: string[];
  assignedStaff: string;
  source: string;
  ein: string;
  contractValue: number;
  paymentTerms: string;
  timeline: TimelineEvent[];
  onboardingChecklist: OnboardingTask[];
}

const vendors: Vendor[] = [
  {
    id: "VND-001", name: "Apex Maintenance Co.", category: "Maintenance", stage: "active",
    onboardDate: "2024-08-15", complianceScore: 96, insurance: true, w9: true, coi: true,
    businessLicense: true, workersComp: true,
    properties: 4, assignedProperties: ["Sunset Heights", "Parkview Towers", "Cedar Ridge Villas", "The Metropolitan"],
    contactName: "Robert Hale", contactEmail: "rhale@apex.com", contactPhone: "(555) 234-5678",
    contactTitle: "Operations Director", website: "apexmaintenance.com", address: "1200 Industrial Blvd, Suite 300",
    neuralFitScore: 94, relationshipScore: 92, lastActivity: "Invoice paid — $12,400", nextAction: "Performance review due Mar 1",
    totalSpend: 148500, avgResponseHrs: 2.1, notes: "Top-performing vendor. SLA compliant 96%. Preferred vendor for HVAC and general maintenance.",
    tags: ["Preferred", "SLA-A", "Multi-Property"], assignedStaff: "Sarah Mitchell",
    source: "Industry Referral", ein: "XX-XXX4521", contractValue: 240000, paymentTerms: "Net30",
    timeline: [
      { date: "2025-02-18", type: "email", title: "Invoice #4521 Submitted", description: "Monthly maintenance invoice for $12,400 across 4 properties", user: "Robert Hale" },
      { date: "2025-02-15", type: "task", title: "Q4 Performance Review Completed", description: "Overall score: 94/100. Exceeded SLA targets by 8%.", user: "Sarah Mitchell" },
      { date: "2025-02-10", type: "call", title: "Contract Renewal Discussion", description: "Discussed 2025 rate adjustments. Vendor proposed 3% increase.", user: "Sarah Mitchell" },
      { date: "2025-02-01", type: "document", title: "Updated COI Received", description: "Certificate of Insurance renewed through Aug 2025", user: "Robert Hale" },
      { date: "2025-01-20", type: "note", title: "Internal Note", description: "Recommend extending to Willow Creek property. Strong track record.", user: "David Kim" },
      { date: "2025-01-15", type: "stage_change", title: "Annual Compliance Audit Passed", description: "All documents verified. Compliance score: 96%", user: "System" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-08-15" },
      { label: "W-9 Tax Form", completed: true, assignee: "Robert Hale", dueDate: "2024-08-18" },
      { label: "Insurance Certificate", completed: true, assignee: "Robert Hale", dueDate: "2024-08-20" },
      { label: "COI Verification", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-08-22" },
      { label: "Background Check", completed: true, assignee: "HR Team", dueDate: "2024-08-25" },
      { label: "Property Assignment", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-08-28" },
      { label: "Contract Execution", completed: true, assignee: "Legal", dueDate: "2024-09-01" },
      { label: "System Access Setup", completed: true, assignee: "IT Support", dueDate: "2024-09-02" },
    ],
  },
  {
    id: "VND-002", name: "CleanPro Services", category: "Cleaning", stage: "active",
    onboardDate: "2024-10-01", complianceScore: 92, insurance: true, w9: true, coi: true,
    businessLicense: true, workersComp: true,
    properties: 3, assignedProperties: ["Sunset Heights", "Cedar Ridge Villas", "Willow Creek"],
    contactName: "Maria Santos", contactEmail: "maria@cleanpro.com", contactPhone: "(555) 345-6789",
    contactTitle: "General Manager", website: "cleanproservices.com", address: "890 Service Way",
    neuralFitScore: 88, relationshipScore: 85, lastActivity: "Monthly service completed", nextAction: "Contract renewal in 45 days",
    totalSpend: 72300, avgResponseHrs: 4.2, notes: "Reliable service. Minor scheduling delays Q4. Good communication.",
    tags: ["Reliable", "Multi-Property"], assignedStaff: "James Rodriguez",
    source: "Online Application", ein: "XX-XXX7823", contractValue: 96000, paymentTerms: "Net30",
    timeline: [
      { date: "2025-02-19", type: "task", title: "Monthly Deep Clean Completed", description: "All 3 properties cleaned. Quality check passed.", user: "Maria Santos" },
      { date: "2025-02-14", type: "email", title: "Contract Renewal Notice Sent", description: "45-day renewal notice sent. Current contract expires Apr 1.", user: "James Rodriguez" },
      { date: "2025-02-05", type: "note", title: "Scheduling Improvement Plan", description: "Vendor addressed Q4 delays. New dispatcher assigned.", user: "James Rodriguez" },
      { date: "2025-01-28", type: "call", title: "Service Quality Discussion", description: "Reviewed tenant feedback. Overall satisfaction 4.3/5.", user: "James Rodriguez" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "James Rodriguez", dueDate: "2024-10-01" },
      { label: "W-9 Tax Form", completed: true, assignee: "Maria Santos", dueDate: "2024-10-03" },
      { label: "Insurance Certificate", completed: true, assignee: "Maria Santos", dueDate: "2024-10-05" },
      { label: "COI Verification", completed: true, assignee: "James Rodriguez", dueDate: "2024-10-07" },
      { label: "Background Check", completed: true, assignee: "HR Team", dueDate: "2024-10-10" },
      { label: "Property Assignment", completed: true, assignee: "James Rodriguez", dueDate: "2024-10-12" },
      { label: "Contract Execution", completed: true, assignee: "Legal", dueDate: "2024-10-15" },
      { label: "System Access Setup", completed: true, assignee: "IT Support", dueDate: "2024-10-16" },
    ],
  },
  {
    id: "VND-003", name: "SecureGuard Systems", category: "Security", stage: "active",
    onboardDate: "2024-11-20", complianceScore: 88, insurance: true, w9: true, coi: true,
    businessLicense: true, workersComp: false,
    properties: 2, assignedProperties: ["Sunset Heights", "Cedar Ridge Villas"],
    contactName: "Tony Reeves", contactEmail: "treeves@secureguard.com", contactPhone: "(555) 456-7890",
    contactTitle: "Account Manager", website: "secureguardsys.com", address: "450 Security Pkwy",
    neuralFitScore: 82, relationshipScore: 75, lastActivity: "Access system upgrade — Cedar Ridge", nextAction: "Quarterly review next week",
    totalSpend: 96000, avgResponseHrs: 6.8, notes: "Good quality but response time trending up. Workers comp missing.",
    tags: ["Security", "Needs-Attention"], assignedStaff: "Sarah Mitchell",
    source: "RFP Response", ein: "XX-XXX9102", contractValue: 120000, paymentTerms: "Net45",
    timeline: [
      { date: "2025-02-17", type: "task", title: "Access System Upgrade", description: "Keycard system upgraded at Cedar Ridge. 120 units affected.", user: "Tony Reeves" },
      { date: "2025-02-12", type: "email", title: "Workers Comp Request", description: "Requested updated workers compensation certificate.", user: "Sarah Mitchell" },
      { date: "2025-02-05", type: "note", title: "Response Time Concern", description: "Average response time increased to 6.8hrs from 4.2hrs baseline. Flagged.", user: "Sarah Mitchell" },
      { date: "2025-01-30", type: "call", title: "Quarterly Performance Call", description: "Discussed declining response times. Vendor cited staffing changes.", user: "Sarah Mitchell" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-11-20" },
      { label: "W-9 Tax Form", completed: true, assignee: "Tony Reeves", dueDate: "2024-11-22" },
      { label: "Insurance Certificate", completed: true, assignee: "Tony Reeves", dueDate: "2024-11-25" },
      { label: "COI Verification", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-11-27" },
      { label: "Security License Verification", completed: true, assignee: "Sarah Mitchell", dueDate: "2024-11-28" },
      { label: "Background Check", completed: true, assignee: "HR Team", dueDate: "2024-12-01" },
      { label: "Workers Comp Certificate", completed: false, assignee: "Tony Reeves", dueDate: "2025-02-28" },
      { label: "Contract Execution", completed: true, assignee: "Legal", dueDate: "2024-12-05" },
    ],
  },
  {
    id: "VND-004", name: "GreenScape Landscaping", category: "Landscaping", stage: "review",
    onboardDate: "2025-02-18", complianceScore: 0, insurance: true, w9: false, coi: true,
    businessLicense: true, workersComp: false,
    properties: 0, assignedProperties: [],
    contactName: "Linda Park", contactEmail: "linda@greenscape.com", contactPhone: "(555) 567-8901",
    contactTitle: "Owner", website: "greenscapellc.com", address: "2300 Garden Ave",
    neuralFitScore: 78, relationshipScore: 60, lastActivity: "Submitted application", nextAction: "W-9 form missing — follow up",
    totalSpend: 0, avgResponseHrs: 0, notes: "Strong references. Serves 12 properties in metro area. Competitive pricing.",
    tags: ["New", "Landscaping", "High-Potential"], assignedStaff: "David Kim",
    source: "Referral — Portfolio Owner", ein: "Pending", contractValue: 0, paymentTerms: "TBD",
    timeline: [
      { date: "2025-02-18", type: "stage_change", title: "Moved to Under Review", description: "Application complete except W-9. Moved to review pending.", user: "David Kim" },
      { date: "2025-02-16", type: "document", title: "COI Uploaded", description: "Certificate of Insurance — $2M coverage. Verified.", user: "Linda Park" },
      { date: "2025-02-15", type: "email", title: "W-9 Follow-up Sent", description: "Reminder sent for missing W-9 form.", user: "David Kim" },
      { date: "2025-02-14", type: "document", title: "Insurance Certificate Uploaded", description: "General liability — $2M aggregate.", user: "Linda Park" },
      { date: "2025-02-12", type: "email", title: "Application Received", description: "Online application submitted. Initial review started.", user: "System" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Linda Park", dueDate: "2025-02-12" },
      { label: "W-9 Tax Form", completed: false, assignee: "Linda Park", dueDate: "2025-02-20" },
      { label: "Insurance Certificate", completed: true, assignee: "Linda Park", dueDate: "2025-02-14" },
      { label: "COI Verification", completed: true, assignee: "David Kim", dueDate: "2025-02-18" },
      { label: "Reference Check", completed: true, assignee: "David Kim", dueDate: "2025-02-17" },
      { label: "Background Check", completed: false, assignee: "HR Team", dueDate: "2025-02-25" },
      { label: "Property Assignment", completed: false, assignee: "David Kim", dueDate: "2025-03-01" },
      { label: "Contract Execution", completed: false, assignee: "Legal", dueDate: "2025-03-05" },
    ],
  },
  {
    id: "VND-005", name: "QuickFix Plumbing", category: "Plumbing", stage: "documents",
    onboardDate: "2025-02-15", complianceScore: 0, insurance: false, w9: true, coi: false,
    businessLicense: true, workersComp: false,
    properties: 0, assignedProperties: [],
    contactName: "Jake Morrison", contactEmail: "jake@quickfix.com", contactPhone: "(555) 678-9012",
    contactTitle: "Owner/Operator", website: "quickfixplumbing.net", address: "780 Trade St",
    neuralFitScore: 71, relationshipScore: 45, lastActivity: "Application received", nextAction: "Insurance certificate + COI needed",
    totalSpend: 0, avgResponseHrs: 0, notes: "Recommended by Sunset Heights maintenance team. Licensed master plumber.",
    tags: ["New", "Plumbing", "Referred"], assignedStaff: "Sarah Mitchell",
    source: "Internal Referral", ein: "XX-XXX3345", contractValue: 0, paymentTerms: "TBD",
    timeline: [
      { date: "2025-02-15", type: "stage_change", title: "Moved to Documents", description: "Application accepted. Awaiting insurance documents.", user: "Sarah Mitchell" },
      { date: "2025-02-15", type: "document", title: "W-9 Uploaded", description: "W-9 form received and verified.", user: "Jake Morrison" },
      { date: "2025-02-14", type: "email", title: "Document Request Sent", description: "Sent insurance and COI requirements to vendor.", user: "Sarah Mitchell" },
      { date: "2025-02-13", type: "email", title: "Application Received", description: "Online application submitted by referral.", user: "System" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Jake Morrison", dueDate: "2025-02-13" },
      { label: "W-9 Tax Form", completed: true, assignee: "Jake Morrison", dueDate: "2025-02-15" },
      { label: "Insurance Certificate", completed: false, assignee: "Jake Morrison", dueDate: "2025-02-22" },
      { label: "COI Verification", completed: false, assignee: "Sarah Mitchell", dueDate: "2025-02-25" },
      { label: "Plumbing License Verification", completed: true, assignee: "Sarah Mitchell", dueDate: "2025-02-16" },
      { label: "Background Check", completed: false, assignee: "HR Team", dueDate: "2025-02-28" },
      { label: "Property Assignment", completed: false, assignee: "Sarah Mitchell", dueDate: "2025-03-05" },
      { label: "Contract Execution", completed: false, assignee: "Legal", dueDate: "2025-03-10" },
    ],
  },
  {
    id: "VND-006", name: "ElitePaint Pros", category: "Painting", stage: "review",
    onboardDate: "2025-02-10", complianceScore: 0, insurance: true, w9: true, coi: true,
    businessLicense: true, workersComp: true,
    properties: 0, assignedProperties: [],
    contactName: "Carla Diaz", contactEmail: "carla@elitepaint.com", contactPhone: "(555) 789-0123",
    contactTitle: "Business Development Manager", website: "elitepaintpros.com", address: "1500 Color Way",
    neuralFitScore: 85, relationshipScore: 68, lastActivity: "All documents submitted", nextAction: "Final compliance review",
    totalSpend: 0, avgResponseHrs: 0, notes: "Specialized in multi-unit turnover painting. 48hr turnaround capability.",
    tags: ["New", "Painting", "Fast-Turnaround"], assignedStaff: "David Kim",
    source: "Trade Show", ein: "XX-XXX6678", contractValue: 0, paymentTerms: "TBD",
    timeline: [
      { date: "2025-02-18", type: "task", title: "Final Compliance Review Scheduled", description: "All docs received. Final review scheduled for Feb 20.", user: "David Kim" },
      { date: "2025-02-16", type: "document", title: "Workers Comp Uploaded", description: "Workers compensation insurance verified.", user: "Carla Diaz" },
      { date: "2025-02-14", type: "document", title: "COI Uploaded", description: "Certificate of Insurance — $3M coverage.", user: "Carla Diaz" },
      { date: "2025-02-12", type: "call", title: "Introduction Call", description: "Discussed scope, pricing, and turnaround capabilities.", user: "David Kim" },
      { date: "2025-02-10", type: "email", title: "Application Submitted", description: "Met at industry trade show. Application submitted.", user: "Carla Diaz" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Carla Diaz", dueDate: "2025-02-10" },
      { label: "W-9 Tax Form", completed: true, assignee: "Carla Diaz", dueDate: "2025-02-11" },
      { label: "Insurance Certificate", completed: true, assignee: "Carla Diaz", dueDate: "2025-02-12" },
      { label: "COI Verification", completed: true, assignee: "David Kim", dueDate: "2025-02-14" },
      { label: "Workers Comp Certificate", completed: true, assignee: "Carla Diaz", dueDate: "2025-02-16" },
      { label: "Reference Check", completed: true, assignee: "David Kim", dueDate: "2025-02-17" },
      { label: "Final Compliance Review", completed: false, assignee: "David Kim", dueDate: "2025-02-20" },
      { label: "Contract Negotiation", completed: false, assignee: "Legal", dueDate: "2025-02-25" },
    ],
  },
  {
    id: "VND-007", name: "Summit Electric", category: "Electrical", stage: "approved",
    onboardDate: "2025-02-05", complianceScore: 91, insurance: true, w9: true, coi: true,
    businessLicense: true, workersComp: true,
    properties: 0, assignedProperties: [],
    contactName: "Derek Shaw", contactEmail: "dshaw@summit.com", contactPhone: "(555) 890-1234",
    contactTitle: "Senior Electrician", website: "summitelectric.com", address: "3400 Watt Dr",
    neuralFitScore: 91, relationshipScore: 72, lastActivity: "Compliance approved", nextAction: "Assign to properties",
    totalSpend: 0, avgResponseHrs: 0, notes: "Licensed master electrician. 15yr commercial experience. Bonded.",
    tags: ["Approved", "Electrical", "Licensed"], assignedStaff: "James Rodriguez",
    source: "Online Application", ein: "XX-XXX8890", contractValue: 84000, paymentTerms: "Net30",
    timeline: [
      { date: "2025-02-19", type: "stage_change", title: "Approved — Ready for Assignment", description: "All compliance checks passed. Ready for property assignment.", user: "James Rodriguez" },
      { date: "2025-02-17", type: "task", title: "Background Check Cleared", description: "Background check and license verification complete.", user: "HR Team" },
      { date: "2025-02-15", type: "document", title: "Contract Signed", description: "Master service agreement executed. $84K annual value.", user: "Legal" },
      { date: "2025-02-12", type: "call", title: "Rate Negotiation", description: "Agreed on hourly rate structure. Emergency rate set at 1.5x.", user: "James Rodriguez" },
      { date: "2025-02-05", type: "email", title: "Application Submitted", description: "Complete application with all documentation.", user: "Derek Shaw" },
    ],
    onboardingChecklist: [
      { label: "Application Form", completed: true, assignee: "Derek Shaw", dueDate: "2025-02-05" },
      { label: "W-9 Tax Form", completed: true, assignee: "Derek Shaw", dueDate: "2025-02-06" },
      { label: "Insurance Certificate", completed: true, assignee: "Derek Shaw", dueDate: "2025-02-07" },
      { label: "COI Verification", completed: true, assignee: "James Rodriguez", dueDate: "2025-02-08" },
      { label: "Electrical License Verification", completed: true, assignee: "James Rodriguez", dueDate: "2025-02-09" },
      { label: "Background Check", completed: true, assignee: "HR Team", dueDate: "2025-02-17" },
      { label: "Contract Execution", completed: true, assignee: "Legal", dueDate: "2025-02-15" },
      { label: "Property Assignment", completed: false, assignee: "James Rodriguez", dueDate: "2025-02-25" },
    ],
  },
  {
    id: "VND-008", name: "FreshAir HVAC", category: "HVAC", stage: "lead",
    onboardDate: "2025-02-20", complianceScore: 0, insurance: false, w9: false, coi: false,
    businessLicense: false, workersComp: false,
    properties: 0, assignedProperties: [],
    contactName: "Omar Hassan", contactEmail: "omar@freshairhvac.com", contactPhone: "(555) 901-2345",
    contactTitle: "CEO", website: "freshairhvac.com", address: "600 Climate Ct",
    neuralFitScore: 65, relationshipScore: 30, lastActivity: "Initial inquiry received", nextAction: "Send onboarding package",
    totalSpend: 0, avgResponseHrs: 0, notes: "Referred by portfolio owner. 200+ unit experience. Needs full onboarding.",
    tags: ["Lead", "HVAC", "Referred", "High-Volume"], assignedStaff: "David Kim",
    source: "Portfolio Owner Referral", ein: "Pending", contractValue: 0, paymentTerms: "TBD",
    timeline: [
      { date: "2025-02-20", type: "email", title: "Initial Inquiry Received", description: "Inbound inquiry through referral from portfolio owner.", user: "System" },
      { date: "2025-02-20", type: "note", title: "Lead Qualification", description: "HVAC specialist with 200+ unit experience. High priority for portfolio.", user: "David Kim" },
    ],
    onboardingChecklist: [
      { label: "Send Onboarding Package", completed: false, assignee: "David Kim", dueDate: "2025-02-22" },
      { label: "Application Form", completed: false, assignee: "Omar Hassan", dueDate: "2025-02-28" },
      { label: "W-9 Tax Form", completed: false, assignee: "Omar Hassan", dueDate: "2025-03-01" },
      { label: "Insurance Certificate", completed: false, assignee: "Omar Hassan", dueDate: "2025-03-01" },
      { label: "HVAC License Verification", completed: false, assignee: "David Kim", dueDate: "2025-03-05" },
      { label: "COI Verification", completed: false, assignee: "David Kim", dueDate: "2025-03-05" },
      { label: "Background Check", completed: false, assignee: "HR Team", dueDate: "2025-03-10" },
      { label: "Contract Negotiation", completed: false, assignee: "Legal", dueDate: "2025-03-15" },
    ],
  },
];

const stages: { key: VendorStage; label: string; color: string; bgColor: string; icon: typeof UserPlus }[] = [
  { key: "lead", label: "Lead", color: "text-muted-foreground", bgColor: "bg-muted-foreground/20", icon: Target },
  { key: "documents", label: "Documents", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/20", icon: FileText },
  { key: "review", label: "Under Review", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/20", icon: Eye },
  { key: "approved", label: "Approved", color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-500/20", icon: CheckCircle2 },
  { key: "active", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/20", icon: Zap },
];

function getStageBadge(stage: VendorStage) {
  const config = stages.find(s => s.key === stage)!;
  return <Badge variant="outline" className={`text-xs ${config.color}`}>{config.label}</Badge>;
}

function NeuralFitBadge({ score }: { score: number }) {
  const color = score >= 85 ? "text-emerald-600 dark:text-emerald-400" : score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`neural-fit-score-${score}`}>
      <Brain className="w-3 h-3 text-primary" />
      <span className={`font-mono font-medium ${color}`}>{score}</span>
    </div>
  );
}

function RelationshipBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground";
  const label = score >= 80 ? "Strong" : score >= 60 ? "Growing" : "New";
  return (
    <div className="flex items-center gap-1 text-xs flex-wrap" data-testid={`relationship-score-${score}`}>
      <Star className="w-3 h-3 text-amber-500" />
      <span className={`font-medium ${color}`}>{label}</span>
      <span className="text-muted-foreground">({score})</span>
    </div>
  );
}

const timelineIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  document: FileText,
  note: ClipboardList,
  stage_change: ArrowUpRight,
  task: CheckCircle2,
};

const timelineColors: Record<string, string> = {
  email: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  call: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  document: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  note: "text-muted-foreground bg-muted",
  stage_change: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
  task: "text-primary bg-primary/10",
};

export default function VendorOnboarding() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [detailTab, setDetailTab] = useState("timeline");

  const categories = Array.from(new Set(vendors.map(v => v.category)));

  const filtered = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = filterCategory === "all" || v.category === filterCategory;
    const matchesStage = filterStage === "all" || v.stage === filterStage;
    return matchesSearch && matchesCategory && matchesStage;
  });

  const stageGroups = stages.map(stage => ({
    ...stage,
    vendors: filtered.filter(v => v.stage === stage.key),
  }));

  const totalSpend = vendors.filter(v => v.stage === "active").reduce((s, v) => s + v.totalSpend, 0);
  const avgNeuralFit = Math.round(vendors.reduce((s, v) => s + v.neuralFitScore, 0) / vendors.length);
  const conversionRate = Math.round((vendors.filter(v => v.stage === "active").length / vendors.length) * 100);
  const avgOnboardDays = 18;

  const toggleVendorSelection = (id: string) => {
    setSelectedVendors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6" data-testid="page-vendor-onboarding">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Brain className="w-5 h-5 text-primary" />
            <Badge variant="secondary" className="text-xs">
              <Radio className="w-3 h-3 mr-1 text-green-500 animate-pulse" />
              AI-Scored CRM
            </Badge>
            <Badge variant="outline" className="text-xs">{vendors.length} Vendors</Badge>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Vendor CRM & Onboarding</h1>
          <p className="text-muted-foreground">Full lifecycle vendor relationship management with AI scoring, compliance tracking, and pipeline automation</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" data-testid="button-export-vendors">
            <ClipboardList className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button data-testid="button-invite-vendor">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Vendor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {stages.map((stage) => {
          const count = vendors.filter(v => v.stage === stage.key).length;
          const StageIcon = stage.icon;
          return (
            <Card key={stage.key} className="hover-elevate cursor-pointer" onClick={() => setFilterStage(filterStage === stage.key ? "all" : stage.key)} data-testid={`stage-card-${stage.key}`}>
              <CardContent className="p-3 text-center">
                <StageIcon className={`w-4 h-4 mx-auto mb-1 ${stage.color}`} />
                <p className={`text-xs font-medium ${stage.color}`}>{stage.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
        <Card data-testid="kpi-total-spend">
          <CardContent className="p-3 text-center">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="text-lg font-bold font-mono mt-1">${(totalSpend / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
        <Card data-testid="kpi-neural-avg">
          <CardContent className="p-3 text-center">
            <Brain className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Avg Neural</p>
            <p className="text-2xl font-bold mt-1 text-primary">{avgNeuralFit}</p>
          </CardContent>
        </Card>
        <Card data-testid="kpi-conversion">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-500" />
            <p className="text-xs text-muted-foreground">Conversion</p>
            <p className="text-2xl font-bold mt-1">{conversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors, contacts, tags..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-vendors"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-category">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStage} onValueChange={setFilterStage}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-stage">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {stages.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-view-selector">
          <TabsList>
            <TabsTrigger value="pipeline" data-testid="tab-pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="list" data-testid="tab-list">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {selectedVendors.size > 0 && (
        <Card className="border-primary/30" data-testid="bulk-actions-bar">
          <CardContent className="p-3 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium">{selectedVendors.size} vendor(s) selected</span>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" data-testid="button-bulk-email"><Mail className="w-4 h-4 mr-1" /> Email</Button>
              <Button variant="outline" size="sm" data-testid="button-bulk-tag"><Tag className="w-4 h-4 mr-1" /> Tag</Button>
              <Button variant="outline" size="sm" data-testid="button-bulk-assign"><Users className="w-4 h-4 mr-1" /> Assign</Button>
              <Button variant="outline" size="sm" data-testid="button-bulk-stage"><ArrowRight className="w-4 h-4 mr-1" /> Move Stage</Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVendors(new Set())} data-testid="button-clear-selection"><X className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className={`flex gap-6 ${selectedVendor ? "" : ""}`}>
        <div className={`${selectedVendor ? "flex-1 min-w-0" : "w-full"}`}>
          {activeTab === "pipeline" ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4" data-testid="pipeline-view">
              {stageGroups.map((stage) => {
                const StageIcon = stage.icon;
                return (
                  <div key={stage.key} className="space-y-3">
                    <div className={`p-2 rounded-lg ${stage.bgColor} flex items-center justify-between flex-wrap gap-2`} data-testid={`stage-header-${stage.key}`}>
                      <span className={`text-xs font-semibold ${stage.color} flex items-center gap-1`}>
                        <StageIcon className="w-3 h-3" />
                        {stage.label}
                      </span>
                      <Badge variant="outline" className="text-xs" data-testid={`stage-badge-${stage.key}`}>{stage.vendors.length}</Badge>
                    </div>
                    {stage.vendors.map((vendor, i) => (
                      <Card
                        key={vendor.id}
                        className={`hover-elevate cursor-pointer ${selectedVendor?.id === vendor.id ? "ring-2 ring-primary" : ""}`}
                        onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                        data-testid={`pipeline-card-${stage.key}-${i}`}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" data-testid={`vendor-name-${vendor.id}`}>{vendor.name}</p>
                              <p className="text-xs text-muted-foreground">{vendor.category}</p>
                            </div>
                            <NeuralFitBadge score={vendor.neuralFitScore} />
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p className="truncate flex items-center gap-1 flex-wrap"><Users className="w-3 h-3 shrink-0" /> {vendor.contactName}</p>
                            <p className="truncate flex items-center gap-1 flex-wrap"><Briefcase className="w-3 h-3 shrink-0" /> {vendor.assignedStaff}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {vendor.insurance && <Badge variant="secondary" className="text-xs px-1.5">INS</Badge>}
                            {vendor.w9 && <Badge variant="secondary" className="text-xs px-1.5">W-9</Badge>}
                            {vendor.coi && <Badge variant="secondary" className="text-xs px-1.5">COI</Badge>}
                            {!vendor.insurance && <Badge variant="destructive" className="text-xs px-1.5">INS</Badge>}
                            {!vendor.w9 && <Badge variant="destructive" className="text-xs px-1.5">W-9</Badge>}
                            {!vendor.coi && <Badge variant="destructive" className="text-xs px-1.5">COI</Badge>}
                          </div>
                          {vendor.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {vendor.tags.slice(0, 2).map((tag, ti) => (
                                <Badge key={ti} variant="outline" className="text-xs px-1.5" data-testid={`tag-${vendor.id}-${ti}`}>{tag}</Badge>
                              ))}
                              {vendor.tags.length > 2 && <span className="text-xs text-muted-foreground">+{vendor.tags.length - 2}</span>}
                            </div>
                          )}
                          <div className="pt-1.5 border-t">
                            <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                              <Brain className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{vendor.nextAction}</span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {stage.vendors.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                        No vendors
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2" data-testid="list-view">
              {filtered.map((vendor, i) => (
                <Card
                  key={vendor.id}
                  className={`hover-elevate cursor-pointer ${selectedVendor?.id === vendor.id ? "ring-2 ring-primary" : ""}`}
                  data-testid={`vendor-row-${i}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedVendors.has(vendor.id)}
                        onChange={() => toggleVendorSelection(vendor.id)}
                        className="mt-1.5 shrink-0"
                        data-testid={`checkbox-vendor-${vendor.id}`}
                      />
                      <div className="flex-1 min-w-0" onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium" data-testid={`vendor-name-list-${i}`}>{vendor.name}</span>
                              <Badge variant="secondary" className="text-xs">{vendor.category}</Badge>
                              {getStageBadge(vendor.stage)}
                              <NeuralFitBadge score={vendor.neuralFitScore} />
                              <RelationshipBadge score={vendor.relationshipScore} />
                              <span className="text-xs text-muted-foreground font-mono">{vendor.id}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Contact</p>
                                <p className="font-medium text-sm">{vendor.contactName}</p>
                                <p className="text-xs text-muted-foreground">{vendor.contactTitle}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Mail className="w-3 h-3" /> {vendor.contactEmail}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap"><Phone className="w-3 h-3" /> {vendor.contactPhone}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Compliance</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {[
                                    { label: "INS", ok: vendor.insurance },
                                    { label: "W-9", ok: vendor.w9 },
                                    { label: "COI", ok: vendor.coi },
                                    { label: "LIC", ok: vendor.businessLicense },
                                    { label: "WC", ok: vendor.workersComp },
                                  ].map((doc, di) => (
                                    <span key={di} className="flex items-center gap-0.5 text-xs" data-testid={`compliance-${doc.label.toLowerCase()}-${i}`}>
                                      {doc.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-red-500" />}
                                      {doc.label}
                                    </span>
                                  ))}
                                </div>
                                {vendor.complianceScore > 0 && (
                                  <p className="text-xs text-muted-foreground">Score: {vendor.complianceScore}%</p>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Details</p>
                                <p className="text-xs"><span className="text-muted-foreground">Staff:</span> {vendor.assignedStaff}</p>
                                <p className="text-xs"><span className="text-muted-foreground">Source:</span> {vendor.source}</p>
                                {vendor.totalSpend > 0 && <p className="text-xs"><span className="text-muted-foreground">Spend:</span> <span className="font-mono">${vendor.totalSpend.toLocaleString()}</span></p>}
                                {vendor.properties > 0 && <p className="text-xs"><span className="text-muted-foreground">Properties:</span> {vendor.properties}</p>}
                                <p className="text-xs"><span className="text-muted-foreground">Terms:</span> {vendor.paymentTerms}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Tags</p>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {vendor.tags.map((tag, ti) => (
                                    <Badge key={ti} variant="outline" className="text-xs px-1.5">{tag}</Badge>
                                  ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{vendor.lastActivity}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 pt-1 border-t text-xs flex-wrap">
                              <Brain className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-muted-foreground">AI Next Action: {vendor.nextAction}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button variant="outline" size="sm" data-testid={`button-review-vendor-${i}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-contact-vendor-${i}`}>
                              <Mail className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedVendor && (
          <div className="w-[420px] shrink-0 hidden lg:block" data-testid="vendor-detail-panel">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{selectedVendor.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs">{selectedVendor.id}</span>
                      {getStageBadge(selectedVendor.stage)}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedVendor(null)} data-testid="button-close-detail">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Neural Fit</p>
                    <p className={`text-xl font-bold font-mono ${selectedVendor.neuralFitScore >= 85 ? "text-emerald-600 dark:text-emerald-400" : selectedVendor.neuralFitScore >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`} data-testid="detail-neural-score">{selectedVendor.neuralFitScore}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Relationship</p>
                    <p className="text-xl font-bold font-mono" data-testid="detail-relationship-score">{selectedVendor.relationshipScore}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</p>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">{selectedVendor.contactName}</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.contactTitle}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap"><Mail className="w-3 h-3" /> {selectedVendor.contactEmail}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap"><Phone className="w-3 h-3" /> {selectedVendor.contactPhone}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap"><Globe className="w-3 h-3" /> {selectedVendor.website}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap"><MapPin className="w-3 h-3" /> {selectedVendor.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" data-testid="button-detail-email"><Mail className="w-4 h-4 mr-1" /> Email</Button>
                  <Button variant="outline" size="sm" data-testid="button-detail-call"><Phone className="w-4 h-4 mr-1" /> Call</Button>
                  <Button variant="outline" size="sm" data-testid="button-detail-note"><ClipboardList className="w-4 h-4 mr-1" /> Note</Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{selectedVendor.category}</span></div>
                    <div><span className="text-muted-foreground">Source:</span> <span className="font-medium">{selectedVendor.source}</span></div>
                    <div><span className="text-muted-foreground">Staff:</span> <span className="font-medium">{selectedVendor.assignedStaff}</span></div>
                    <div><span className="text-muted-foreground">Terms:</span> <span className="font-medium">{selectedVendor.paymentTerms}</span></div>
                    {selectedVendor.totalSpend > 0 && <div><span className="text-muted-foreground">Spend:</span> <span className="font-mono font-medium">${selectedVendor.totalSpend.toLocaleString()}</span></div>}
                    {selectedVendor.contractValue > 0 && <div><span className="text-muted-foreground">Contract:</span> <span className="font-mono font-medium">${selectedVendor.contractValue.toLocaleString()}</span></div>}
                    {selectedVendor.avgResponseHrs > 0 && <div><span className="text-muted-foreground">Avg Response:</span> <span className="font-medium">{selectedVendor.avgResponseHrs}hrs</span></div>}
                    <div><span className="text-muted-foreground">Properties:</span> <span className="font-medium">{selectedVendor.properties}</span></div>
                  </div>
                  {selectedVendor.assignedProperties.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {selectedVendor.assignedProperties.map((p, pi) => (
                        <Badge key={pi} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance Documents</p>
                  <div className="space-y-1">
                    {[
                      { label: "Insurance", ok: selectedVendor.insurance },
                      { label: "W-9 Form", ok: selectedVendor.w9 },
                      { label: "Certificate of Insurance", ok: selectedVendor.coi },
                      { label: "Business License", ok: selectedVendor.businessLicense },
                      { label: "Workers Comp", ok: selectedVendor.workersComp },
                    ].map((doc, di) => (
                      <div key={di} className="flex items-center justify-between text-xs p-1.5 rounded-md bg-muted/30" data-testid={`detail-doc-${di}`}>
                        <span className="flex items-center gap-1.5 flex-wrap">
                          {doc.ok ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <AlertCircle className="w-3 h-3 text-red-500" />}
                          {doc.label}
                        </span>
                        <span className={doc.ok ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>{doc.ok ? "Verified" : "Missing"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedVendor.tags.map((tag, ti) => (
                      <Badge key={ti} variant="outline" className="text-xs">{tag}</Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" data-testid="button-add-tag">
                      <Tag className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                <div className="p-2.5 bg-primary/5 border border-primary/10 rounded-lg">
                  <p className="text-xs flex items-start gap-1.5" data-testid="detail-ai-action">
                    <Brain className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span><span className="font-medium">AI Next Action:</span> <span className="text-muted-foreground">{selectedVendor.nextAction}</span></span>
                  </p>
                </div>

                <Tabs value={detailTab} onValueChange={setDetailTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="timeline" className="flex-1" data-testid="tab-detail-timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="checklist" className="flex-1" data-testid="tab-detail-checklist">Checklist</TabsTrigger>
                  </TabsList>
                </Tabs>

                {detailTab === "timeline" && (
                  <div className="space-y-3" data-testid="timeline-panel">
                    {selectedVendor.timeline.map((event, ei) => {
                      const EventIcon = timelineIcons[event.type] || Activity;
                      const colorClass = timelineColors[event.type] || "text-muted-foreground bg-muted";
                      return (
                        <div key={ei} className="flex gap-3" data-testid={`timeline-event-${ei}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                            <EventIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="text-sm font-medium truncate">{event.title}</p>
                              <span className="text-xs text-muted-foreground shrink-0">{event.date}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">by {event.user}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {detailTab === "checklist" && (
                  <div className="space-y-1.5" data-testid="checklist-panel">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 flex-wrap gap-2">
                      <span>{selectedVendor.onboardingChecklist.filter(t => t.completed).length} / {selectedVendor.onboardingChecklist.length} completed</span>
                      <Progress value={(selectedVendor.onboardingChecklist.filter(t => t.completed).length / selectedVendor.onboardingChecklist.length) * 100} className="w-24 h-1.5" />
                    </div>
                    {selectedVendor.onboardingChecklist.map((task, ti) => (
                      <div key={ti} className={`flex items-center justify-between p-2 rounded-md text-xs ${task.completed ? "bg-muted/30" : "bg-amber-500/5 border border-amber-500/20"}`} data-testid={`checklist-item-${ti}`}>
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className={task.completed ? "line-through text-muted-foreground" : "font-medium"}>{task.label}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-muted-foreground flex-wrap">
                          <span>{task.assignee}</span>
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedVendor.notes && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</p>
                    <p className="text-xs text-muted-foreground">{selectedVendor.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
