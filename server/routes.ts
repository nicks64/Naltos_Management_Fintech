import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { seedDatabase } from "./seed";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import { requireAuth, requireRole, extractOrganizationId, requireVendor, requireMerchant, personaToLegacyRole } from "./middleware";
import { db } from "./db";
import { organizations } from "@shared/schema";
import { eq } from "drizzle-orm";

// Reference: blueprint:javascript_openai_ai_integrations
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

interface LeaseClause {
  id: string;
  title: string;
  content: string;
  category: "financial" | "maintenance" | "rules" | "termination" | "general";
  isCustom?: boolean;
}

interface LeaseActivityEvent {
  id: string;
  action: string;
  timestamp: string;
  detail?: string;
}

interface LeaseAgreement {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  tenantName: string;
  tenantEmail: string;
  tenantId?: string;
  monthlyRent: number;
  leaseTerm: number;
  startDate: string;
  endDate: string;
  securityDeposit: number;
  securityDepositMultiplier: number;
  lateFeePercent: number;
  lateFeeGraceDays: number;
  petPolicy: boolean;
  petDeposit: number;
  parkingIncluded: boolean;
  parkingFee: number;
  utilitiesIncluded: string[];
  specialProvisions: string;
  status: "draft" | "pending_tenant" | "signed" | "expired" | "cancelled";
  clauses: LeaseClause[];
  createdAt: string;
  sentAt?: string;
  signedAt?: string;
  cancelledAt?: string;
  aiSummary: string;
  organizationId?: string;
  activity: LeaseActivityEvent[];
}

const leaseAgreements: LeaseAgreement[] = [
  {
    id: "lease-seed-001",
    propertyId: "sunset-gardens",
    propertyName: "Sunset Gardens",
    unitId: "sg-001",
    unitLabel: "SG-001",
    tenantName: "John Smith",
    tenantEmail: "tenant1@example.com",
    tenantId: "t-001",
    monthlyRent: 2450,
    leaseTerm: 12,
    startDate: "2025-06-01",
    endDate: "2026-06-01",
    securityDeposit: 2450,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: true,
    petDeposit: 300,
    parkingIncluded: true,
    parkingFee: 0,
    utilitiesIncluded: ["Water", "Trash"],
    specialProvisions: "",
    status: "signed",
    clauses: [
      { id: "c-s1-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $2,450.00 on or before the 1st day of each calendar month. Payment shall be made via ACH transfer, certified check, or through the Naltos payment portal. Rent is due without demand and no partial payments shall be accepted without prior written consent from the Landlord.", category: "financial" },
      { id: "c-s1-2", title: "Security Deposit", content: "Tenant has deposited $2,450.00 as a security deposit. This deposit shall be held in accordance with applicable state law and returned within 30 days of lease termination, less any deductions for unpaid rent, damages beyond normal wear and tear, or cleaning fees.", category: "financial" },
      { id: "c-s1-3", title: "Late Fee Policy", content: "If rent is not received by 11:59 PM on the 5th day of the month, a late fee of 5% of the monthly rent ($122.50) shall be assessed. This fee is in addition to any other remedies available to the Landlord under this agreement or applicable law.", category: "financial" },
      { id: "c-s1-4", title: "Maintenance Responsibilities", content: "Tenant is responsible for routine maintenance including replacing light bulbs, air filters, and maintaining cleanliness. Landlord shall maintain structural elements, plumbing, electrical systems, and HVAC equipment. Tenant must report any maintenance issues within 48 hours of discovery.", category: "maintenance" },
      { id: "c-s1-5", title: "Pet Policy", content: "Pets are permitted subject to a non-refundable pet deposit of $300.00. Maximum of two pets allowed. Tenant is responsible for all pet-related damages and must comply with all local animal ordinances. Dangerous breeds as defined by property insurance are prohibited.", category: "rules" },
      { id: "c-s1-6", title: "Quiet Enjoyment", content: "Tenant shall be entitled to quiet enjoyment of the premises. Quiet hours are observed from 10:00 PM to 8:00 AM daily. Excessive noise complaints (3 or more documented incidents) may constitute grounds for lease termination after written notice.", category: "rules" },
      { id: "c-s1-7", title: "Early Termination", content: "Either party may terminate this lease early with 60 days written notice. If Tenant terminates early, a fee equal to two months rent ($4,900.00) shall apply unless Tenant provides a qualified replacement tenant approved by Landlord.", category: "termination" },
      { id: "c-s1-8", title: "Governing Law", content: "This lease shall be governed by and construed in accordance with the laws of the State of California. Any disputes arising under this agreement shall be resolved in the county where the property is located.", category: "general" },
    ],
    createdAt: "2025-05-15T10:30:00Z",
    sentAt: "2025-05-16T09:00:00Z",
    signedAt: "2025-05-18T14:22:00Z",
    aiSummary: "12-month residential lease for Unit SG-001 at Sunset Gardens. Monthly rent of $2,450 with water and trash included. Pets allowed with $300 deposit. Free parking included.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s1-1", action: "created", timestamp: "2025-05-15T10:30:00Z", detail: "AI-generated lease agreement created via wizard" },
      { id: "evt-s1-2", action: "clause_edited", timestamp: "2025-05-15T11:00:00Z", detail: "Late Fee Policy clause updated by manager" },
      { id: "evt-s1-3", action: "sent", timestamp: "2025-05-16T09:00:00Z", detail: "Sent to tenant1@example.com for review" },
      { id: "evt-s1-4", action: "signed", timestamp: "2025-05-18T14:22:00Z", detail: "Signed by John Smith" },
    ],
  },
  {
    id: "lease-seed-002",
    propertyId: "harbor-view",
    propertyName: "Harbor View",
    unitId: "hv-009",
    unitLabel: "HV-009",
    tenantName: "Emma Johnson",
    tenantEmail: "tenant2@example.com",
    tenantId: "t-002",
    monthlyRent: 3200,
    leaseTerm: 12,
    startDate: "2025-09-01",
    endDate: "2026-09-01",
    securityDeposit: 6400,
    securityDepositMultiplier: 2,
    lateFeePercent: 5,
    lateFeeGraceDays: 3,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: true,
    parkingFee: 150,
    utilitiesIncluded: ["Water", "Trash", "Internet"],
    specialProvisions: "Tenant has first right of refusal on lease renewal at market rate.",
    status: "pending_tenant",
    clauses: [
      { id: "c-s2-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $3,200.00 on or before the 1st day of each calendar month via the Naltos payment platform. ACH and credit card payments are accepted. A convenience fee of 2.5% applies to credit card transactions.", category: "financial" },
      { id: "c-s2-2", title: "Security Deposit", content: "Tenant has deposited $6,400.00 (2x monthly rent) as a security deposit. The increased deposit reflects the premium nature of this waterfront unit. Deposit shall be returned within 21 days of lease termination per California law.", category: "financial" },
      { id: "c-s2-3", title: "Parking Assignment", content: "Tenant is assigned one covered parking space in the Harbor View garage at $150/month. Additional guest parking is available at $10/day. Parking assignments are non-transferable.", category: "rules" },
      { id: "c-s2-4", title: "Property Modifications", content: "Tenant shall not make any alterations, additions, or improvements to the premises without prior written consent from Landlord. Any approved modifications become property of the Landlord upon lease termination unless otherwise agreed in writing.", category: "rules" },
      { id: "c-s2-5", title: "Maintenance and Repairs", content: "Landlord will maintain all common areas, exterior elements, and major building systems. Tenant is responsible for interior cleanliness and minor repairs up to $200. Emergency maintenance requests are handled 24/7 through the Naltos portal.", category: "maintenance" },
      { id: "c-s2-6", title: "Lease Renewal", content: "Tenant has first right of refusal for lease renewal at prevailing market rate. Written notice of intent to renew must be provided at least 90 days before lease expiration. Landlord will provide renewal terms no later than 120 days before expiration.", category: "termination" },
      { id: "c-s2-7", title: "Insurance Requirements", content: "Tenant shall maintain renter's insurance with minimum coverage of $100,000 in personal liability and $50,000 in personal property. Proof of insurance must be provided before move-in and annually thereafter.", category: "general" },
    ],
    createdAt: "2026-02-01T08:15:00Z",
    sentAt: "2026-02-02T10:00:00Z",
    aiSummary: "12-month premium lease for Unit HV-009 at Harbor View. Monthly rent $3,200 with 2x security deposit. Covered parking at $150/mo. Water, trash, and internet included. First right of refusal on renewal.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s2-1", action: "created", timestamp: "2026-02-01T08:15:00Z", detail: "AI-generated lease agreement created" },
      { id: "evt-s2-2", action: "sent", timestamp: "2026-02-02T10:00:00Z", detail: "Sent to tenant2@example.com for review" },
    ],
  },
  {
    id: "lease-seed-003",
    propertyId: "parkside",
    propertyName: "Parkside Residences",
    unitId: "pr-007",
    unitLabel: "PR-007",
    tenantName: "Michael Brown",
    tenantEmail: "tenant3@example.com",
    tenantId: "t-003",
    monthlyRent: 1850,
    leaseTerm: 6,
    startDate: "2025-11-01",
    endDate: "2026-05-01",
    securityDeposit: 1850,
    securityDepositMultiplier: 1,
    lateFeePercent: 10,
    lateFeeGraceDays: 5,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: false,
    parkingFee: 0,
    utilitiesIncluded: [],
    specialProvisions: "Short-term lease with option to extend to 12 months at same rate.",
    status: "signed",
    clauses: [
      { id: "c-s3-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $1,850.00 on or before the 1st day of each month. All payments processed through Naltos automated payment system. Tenant may set up autopay for on-time payment incentive eligibility.", category: "financial" },
      { id: "c-s3-2", title: "Security Deposit", content: "A security deposit of $1,850.00 (equal to one month's rent) is required. The deposit will be held in a separate escrow account and returned within 30 days of move-out, less any lawful deductions.", category: "financial" },
      { id: "c-s3-3", title: "Late Payment Penalty", content: "A late fee of 10% ($185.00) will be assessed if rent is not received by the 5th of the month. After 15 days, a Notice to Pay or Quit will be issued. Three or more late payments may trigger lease non-renewal.", category: "financial" },
      { id: "c-s3-4", title: "Tenant Maintenance Duties", content: "Tenant shall maintain the unit in clean and habitable condition. Tenant is responsible for minor repairs under $150, changing HVAC filters monthly, and reporting plumbing or electrical issues immediately.", category: "maintenance" },
      { id: "c-s3-5", title: "No Pet Policy", content: "No pets of any kind are permitted on the premises. This includes temporary or visiting animals. Service animals with proper documentation are exempt from this policy in accordance with federal law.", category: "rules" },
      { id: "c-s3-6", title: "Short-Term Extension Option", content: "Tenant may extend this 6-month lease to a full 12-month term at the same monthly rate by providing written notice at least 60 days before the initial expiration date. This option is contingent on timely rent payments throughout the initial term.", category: "termination" },
      { id: "c-s3-7", title: "Liability and Indemnification", content: "Tenant agrees to indemnify and hold Landlord harmless from any claims arising from Tenant's use of the premises. Landlord is not liable for loss or damage to Tenant's personal property except where caused by Landlord's negligence.", category: "general" },
    ],
    createdAt: "2025-10-20T14:00:00Z",
    sentAt: "2025-10-21T09:30:00Z",
    signedAt: "2025-10-23T11:45:00Z",
    aiSummary: "6-month short-term lease for Unit PR-007 at Parkside Residences. Monthly rent $1,850 with option to extend to 12 months. No pets, no parking. Tenant responsible for all utilities.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s3-1", action: "created", timestamp: "2025-10-20T14:00:00Z", detail: "AI-generated lease for short-term occupancy" },
      { id: "evt-s3-2", action: "sent", timestamp: "2025-10-21T09:30:00Z", detail: "Sent to tenant3@example.com" },
      { id: "evt-s3-3", action: "signed", timestamp: "2025-10-23T11:45:00Z", detail: "Signed by Michael Brown" },
    ],
  },
  {
    id: "lease-seed-004",
    propertyId: "sunset-gardens",
    propertyName: "Sunset Gardens",
    unitId: "sg-020",
    unitLabel: "SG-020",
    tenantName: "Sarah Davis",
    tenantEmail: "tenant4@example.com",
    tenantId: "t-004",
    monthlyRent: 2200,
    leaseTerm: 12,
    startDate: "2025-01-15",
    endDate: "2026-01-15",
    securityDeposit: 2200,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: true,
    petDeposit: 250,
    parkingIncluded: false,
    parkingFee: 0,
    utilitiesIncluded: ["Water"],
    specialProvisions: "",
    status: "expired",
    clauses: [
      { id: "c-s4-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $2,200.00 by the 1st of each month. Payments accepted via ACH or the Naltos platform. On-time payments qualify for behavioral cashback incentives.", category: "financial" },
      { id: "c-s4-2", title: "Security Deposit", content: "Security deposit of $2,200.00 held per state regulations. Itemized deduction list will be provided within 21 days of move-out if any deductions apply.", category: "financial" },
      { id: "c-s4-3", title: "Pet Policy", content: "One pet allowed with non-refundable pet deposit of $250. Pet must be under 50 lbs. Tenant is liable for all pet-related damages to the unit and common areas.", category: "rules" },
      { id: "c-s4-4", title: "Move-Out Procedures", content: "Tenant shall provide 30 days written notice before vacating. Unit must be returned in broom-clean condition. A pre-move-out inspection will be conducted 14 days before the move-out date.", category: "termination" },
      { id: "c-s4-5", title: "General Provisions", content: "This agreement constitutes the entire understanding between the parties. Any modifications must be in writing and signed by both parties. Waiver of any provision shall not constitute waiver of future enforcement.", category: "general" },
    ],
    createdAt: "2024-12-20T16:00:00Z",
    sentAt: "2024-12-21T08:00:00Z",
    signedAt: "2024-12-23T10:15:00Z",
    aiSummary: "12-month lease for Unit SG-020 at Sunset Gardens. Monthly rent $2,200 with water included. One pet allowed with $250 deposit. Lease expired January 2026.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s4-1", action: "created", timestamp: "2024-12-20T16:00:00Z", detail: "Lease agreement generated" },
      { id: "evt-s4-2", action: "sent", timestamp: "2024-12-21T08:00:00Z", detail: "Sent to tenant4@example.com" },
      { id: "evt-s4-3", action: "signed", timestamp: "2024-12-23T10:15:00Z", detail: "Signed by Sarah Davis" },
      { id: "evt-s4-4", action: "expired", timestamp: "2026-01-15T00:00:00Z", detail: "Lease term ended" },
    ],
  },
  {
    id: "lease-seed-005",
    propertyId: "harbor-view",
    propertyName: "Harbor View",
    unitId: "hv-019",
    unitLabel: "HV-019",
    tenantName: "James Wilson",
    tenantEmail: "tenant5@example.com",
    tenantId: "t-005",
    monthlyRent: 2800,
    leaseTerm: 24,
    startDate: "2026-03-01",
    endDate: "2028-03-01",
    securityDeposit: 5600,
    securityDepositMultiplier: 2,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: true,
    petDeposit: 500,
    parkingIncluded: true,
    parkingFee: 100,
    utilitiesIncluded: ["Water", "Trash", "Gas"],
    specialProvisions: "Tenant approved for 24-month term with locked rate. Annual rent review waived for full term.",
    status: "draft",
    clauses: [
      { id: "c-s5-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $2,800.00 on or before the 1st of each month. This rate is locked for the full 24-month term with no annual increases. Payments processed through the Naltos automated payment platform.", category: "financial" },
      { id: "c-s5-2", title: "Security Deposit", content: "A security deposit of $5,600.00 (2x monthly rent) is required prior to move-in. Extended lease terms require enhanced deposit per company policy. Deposit subject to standard return procedures.", category: "financial" },
      { id: "c-s5-3", title: "Pet Policy", content: "Up to two pets allowed with a combined non-refundable pet deposit of $500. Annual pet re-registration required. All pets must be current on vaccinations with documentation on file.", category: "rules" },
      { id: "c-s5-4", title: "Parking and Storage", content: "One reserved parking space included at $100/month. Storage unit 19-B assigned at no additional cost for the lease term. Both are non-transferable to other tenants.", category: "rules" },
      { id: "c-s5-5", title: "Maintenance", content: "Landlord provides 24/7 emergency maintenance and scheduled preventive maintenance quarterly. Tenant responsible for keeping unit clean, reporting issues promptly, and providing access for scheduled inspections with 48-hour notice.", category: "maintenance" },
      { id: "c-s5-6", title: "Extended Term Provisions", content: "This 24-month lease provides rate stability for the tenant. Early termination requires 90 days notice and a fee of three months rent. No early termination fee applies after month 18 of the lease term.", category: "termination" },
      { id: "c-s5-7", title: "Insurance and Liability", content: "Tenant must carry renter's insurance with at least $100,000 liability coverage. Landlord's insurance does not cover tenant's personal belongings. Proof of coverage must be provided at lease signing and renewed annually.", category: "general" },
    ],
    createdAt: "2026-02-10T11:00:00Z",
    aiSummary: "24-month premium lease for Unit HV-019 at Harbor View. Rate-locked at $2,800/mo with 2x deposit. Pets allowed with $500 deposit. Parking $100/mo. Water, trash, and gas included.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s5-1", action: "created", timestamp: "2026-02-10T11:00:00Z", detail: "AI-generated draft lease for long-term tenancy" },
      { id: "evt-s5-2", action: "clause_edited", timestamp: "2026-02-10T11:30:00Z", detail: "Extended Term Provisions updated to reduce early termination fee after month 18" },
    ],
  },
  {
    id: "lease-seed-006",
    propertyId: "parkside",
    propertyName: "Parkside Residences",
    unitId: "pr-016",
    unitLabel: "PR-016",
    tenantName: "Emily Martinez",
    tenantEmail: "tenant6@example.com",
    tenantId: "t-006",
    monthlyRent: 1650,
    leaseTerm: 12,
    startDate: "2025-08-01",
    endDate: "2026-08-01",
    securityDeposit: 1650,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 7,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: true,
    parkingFee: 0,
    utilitiesIncluded: ["Water", "Trash", "Sewer"],
    specialProvisions: "",
    status: "signed",
    clauses: [
      { id: "c-s6-1", title: "Rent Payment Terms", content: "Monthly rent of $1,650.00 is due on the 1st of each month. Payments may be made through Naltos automated payment system, which offers ACH, debit, and credit card options. On-time payment streaks earn cashback through the Naltos incentive program.", category: "financial" },
      { id: "c-s6-2", title: "Security Deposit", content: "A security deposit of $1,650.00 equal to one month's rent is required. Deposit will be held in a compliant escrow account and returned within statutory timeframes upon lease termination, net of any authorized deductions.", category: "financial" },
      { id: "c-s6-3", title: "Community Rules", content: "Tenant shall comply with all community rules and regulations posted in common areas and available on the resident portal. Violations may result in fines or lease termination after documented warnings.", category: "rules" },
      { id: "c-s6-4", title: "Maintenance", content: "Tenant is responsible for keeping the unit clean, replacing batteries and light bulbs, and minor upkeep. Major repairs and appliance maintenance are the Landlord's responsibility. Submit all requests through the Naltos maintenance portal.", category: "maintenance" },
      { id: "c-s6-5", title: "Lease Termination", content: "Either party may terminate with 60 days written notice. Early termination by Tenant incurs a fee equal to two months rent. Landlord may terminate for material breach after 14-day cure period.", category: "termination" },
      { id: "c-s6-6", title: "Notices", content: "All notices under this agreement shall be in writing and delivered via the Naltos platform, certified mail, or hand delivery. Electronic notices through the platform are considered valid legal notice.", category: "general" },
    ],
    createdAt: "2025-07-15T09:00:00Z",
    sentAt: "2025-07-16T08:30:00Z",
    signedAt: "2025-07-19T16:00:00Z",
    aiSummary: "12-month lease for Unit PR-016 at Parkside Residences. Monthly rent $1,650 with water, trash, and sewer included. Free parking. No pets. 7-day grace period on late fees.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s6-1", action: "created", timestamp: "2025-07-15T09:00:00Z", detail: "Lease agreement generated by AI" },
      { id: "evt-s6-2", action: "sent", timestamp: "2025-07-16T08:30:00Z", detail: "Sent to tenant6@example.com" },
      { id: "evt-s6-3", action: "signed", timestamp: "2025-07-19T16:00:00Z", detail: "Signed by Emily Martinez" },
    ],
  },
  {
    id: "lease-seed-007",
    propertyId: "sunset-gardens",
    propertyName: "Sunset Gardens",
    unitId: "sg-030",
    unitLabel: "SG-030",
    tenantName: "Robert Anderson",
    tenantEmail: "tenant7@example.com",
    tenantId: "t-007",
    monthlyRent: 2100,
    leaseTerm: 12,
    startDate: "2025-04-01",
    endDate: "2026-04-01",
    securityDeposit: 2100,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: false,
    parkingFee: 0,
    utilitiesIncluded: [],
    specialProvisions: "",
    status: "cancelled",
    clauses: [
      { id: "c-s7-1", title: "Rent Payment Terms", content: "Monthly rent of $2,100.00 due on the 1st of each month via the Naltos payment platform.", category: "financial" },
      { id: "c-s7-2", title: "Security Deposit", content: "Security deposit of $2,100.00 held per state law. Return subject to standard deduction process.", category: "financial" },
      { id: "c-s7-3", title: "Occupancy", content: "Unit is for residential use only by the named tenant. Subletting is prohibited without written Landlord consent.", category: "rules" },
      { id: "c-s7-4", title: "Termination", content: "60 days notice required for termination by either party. Early termination fee of two months rent applies to Tenant-initiated termination.", category: "termination" },
    ],
    createdAt: "2025-03-10T13:00:00Z",
    sentAt: "2025-03-11T09:00:00Z",
    cancelledAt: "2025-03-15T10:30:00Z",
    aiSummary: "12-month lease for Unit SG-030 at Sunset Gardens. Cancelled before tenant signature due to tenant relocation.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s7-1", action: "created", timestamp: "2025-03-10T13:00:00Z", detail: "Lease agreement created" },
      { id: "evt-s7-2", action: "sent", timestamp: "2025-03-11T09:00:00Z", detail: "Sent to tenant7@example.com" },
      { id: "evt-s7-3", action: "cancelled", timestamp: "2025-03-15T10:30:00Z", detail: "Cancelled: Tenant relocated out of state before signing" },
    ],
  },
  {
    id: "lease-seed-008",
    propertyId: "harbor-view",
    propertyName: "Harbor View",
    unitId: "hv-029",
    unitLabel: "HV-029",
    tenantName: "Jessica Taylor",
    tenantEmail: "tenant8@example.com",
    tenantId: "t-008",
    monthlyRent: 3500,
    leaseTerm: 12,
    startDate: "2026-04-01",
    endDate: "2027-04-01",
    securityDeposit: 7000,
    securityDepositMultiplier: 2,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: true,
    petDeposit: 400,
    parkingIncluded: true,
    parkingFee: 200,
    utilitiesIncluded: ["Water", "Trash", "Internet", "Electric"],
    specialProvisions: "Premium corner unit with ocean view. Tenant receives complimentary quarterly deep cleaning service.",
    status: "draft",
    clauses: [
      { id: "c-s8-1", title: "Rent Payment Terms", content: "Tenant shall pay monthly rent of $3,500.00 on or before the 1st of each calendar month. This premium corner unit includes enhanced amenities reflected in the monthly rate. Payment accepted via all Naltos-supported methods.", category: "financial" },
      { id: "c-s8-2", title: "Security Deposit", content: "Security deposit of $7,000.00 (2x monthly rent) required for premium units. Deposit held in interest-bearing escrow where required by law.", category: "financial" },
      { id: "c-s8-3", title: "Premium Amenities", content: "Unit includes complimentary quarterly deep cleaning service, priority maintenance scheduling, and access to the rooftop lounge. These amenities are included in the monthly rent and non-transferable.", category: "rules" },
      { id: "c-s8-4", title: "Pet Policy", content: "Pets allowed with a $400 non-refundable pet deposit. Maximum two pets, each under 40 lbs. Pet DNA registration required for common area cleanup compliance.", category: "rules" },
      { id: "c-s8-5", title: "Maintenance", content: "Premium units receive priority maintenance response within 4 hours for urgent issues. Landlord maintains all appliances, systems, and fixtures. Tenant responsible for general cleanliness and reporting issues promptly.", category: "maintenance" },
      { id: "c-s8-6", title: "Lease Renewal", content: "Landlord will offer renewal terms 120 days before expiration. Tenant has 30 days to accept or negotiate. If no renewal is agreed, Tenant must vacate by the end date with unit in move-out ready condition.", category: "termination" },
      { id: "c-s8-7", title: "Insurance", content: "Renter's insurance with $150,000 liability minimum required. Flood and earthquake coverage recommended but not required. Proof of insurance due at signing.", category: "general" },
    ],
    createdAt: "2026-02-11T15:30:00Z",
    aiSummary: "12-month premium lease for corner Unit HV-029 at Harbor View with ocean view. Monthly rent $3,500 with all utilities included. Pets allowed. Premium parking at $200/mo. Includes quarterly deep cleaning.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s8-1", action: "created", timestamp: "2026-02-11T15:30:00Z", detail: "AI-generated premium unit lease draft" },
    ],
  },
  {
    id: "lease-seed-009",
    propertyId: "prop-metro-001",
    propertyName: "The Metropolitan",
    unitId: "mt-u3",
    unitLabel: "MT-003",
    tenantId: "tenant-metro-1",
    tenantName: "Rachel Kim",
    tenantEmail: "rachel.kim@email.com",
    status: "signed",
    monthlyRent: 3800,
    leaseTerm: 12,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    securityDeposit: 7600,
    securityDepositMultiplier: 2,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: true,
    parkingFee: 250,
    utilitiesIncluded: ["Water", "Trash", "Internet", "Gas"],
    specialProvisions: "Tenant has access to rooftop terrace and co-working lounge. Building concierge available 8AM-10PM.",
    clauses: [
      { id: "c-s9-1", title: "Rent Payment", content: "Tenant agrees to pay $3,800.00 per month, due on the 1st of each month. Payments accepted via ACH, check, or certified funds. A processing fee of $15 applies to credit card payments.", category: "financial" },
      { id: "c-s9-2", title: "Security Deposit", content: "Tenant has deposited $7,600.00 (2x monthly rent). Deposit held in an interest-bearing account. Refund within 21 days of lease termination, less deductions for damages beyond normal wear.", category: "financial" },
      { id: "c-s9-3", title: "Amenity Access", content: "Tenant receives complimentary access to rooftop terrace, co-working lounge, fitness center, and package room. Guest access to amenities limited to 2 guests per visit. Rooftop terrace hours: 7AM-10PM daily.", category: "rules" },
      { id: "c-s9-4", title: "Parking Assignment", content: "Tenant is assigned one reserved parking space (P-12) in the underground garage at $250/month. Electric vehicle charging available at market rates. Motorcycle/bicycle parking available at no additional cost.", category: "rules" },
      { id: "c-s9-5", title: "Maintenance & Repairs", content: "Building management provides 24/7 emergency maintenance. Non-emergency requests addressed within 48 hours. Tenant responsible for maintaining unit cleanliness and reporting issues via the resident portal.", category: "maintenance" },
      { id: "c-s9-6", title: "Noise & Conduct", content: "Quiet hours: 10PM-8AM. Musical instruments permitted with sound dampening. No commercial activity from unit. All gatherings of 10+ people require 48-hour advance notice to management.", category: "rules" },
      { id: "c-s9-7", title: "Subletting & Assignment", content: "Short-term subletting prohibited. Long-term sublet (6+ months) requires written approval and background check on sublessee. Management reserves right to reject sublet applications.", category: "general" },
      { id: "c-s9-8", title: "Lease Renewal", content: "Management will present renewal terms 90 days before expiration. Early renewal (before 90-day window) may qualify for rate lock guarantee. Month-to-month holdover at 110% of current rent.", category: "termination" },
    ],
    createdAt: "2025-12-20T10:00:00Z",
    sentAt: "2025-12-21T09:00:00Z",
    signedAt: "2025-12-23T14:30:00Z",
    aiSummary: "12-month urban luxury lease for Unit MT-003 at The Metropolitan in downtown SF. Monthly rent $3,800 with 2x security deposit. Reserved underground parking at $250/mo. Full utilities plus internet included. Rooftop and co-working access. No pets.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s9-1", action: "created", timestamp: "2025-12-20T10:00:00Z", detail: "AI-generated lease for premium downtown unit" },
      { id: "evt-s9-2", action: "sent", timestamp: "2025-12-21T09:00:00Z", detail: "Sent to rachel.kim@email.com" },
      { id: "evt-s9-3", action: "signed", timestamp: "2025-12-23T14:30:00Z", detail: "Digitally signed by Rachel Kim" },
    ],
  },
  {
    id: "lease-seed-010",
    propertyId: "prop-willow-001",
    propertyName: "Willow Creek Apartments",
    unitId: "wc-u12",
    unitLabel: "WC-012",
    tenantId: "tenant-willow-1",
    tenantName: "Marcus & Jennifer Thompson",
    tenantEmail: "thompson.family@email.com",
    status: "signed",
    monthlyRent: 2100,
    leaseTerm: 24,
    startDate: "2025-09-01",
    endDate: "2027-08-31",
    securityDeposit: 2100,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 7,
    petPolicy: true,
    petDeposit: 400,
    parkingIncluded: true,
    parkingFee: 0,
    utilitiesIncluded: ["Water", "Trash", "Sewer"],
    specialProvisions: "Family-friendly community. Playground and BBQ area access. Two designated parking spaces included.",
    clauses: [
      { id: "c-s10-1", title: "Rent Payment", content: "Tenants agree to pay $2,100.00 per month, due on the 1st. Joint and several liability applies to all named tenants. Online payment portal available at no extra charge.", category: "financial" },
      { id: "c-s10-2", title: "Security Deposit", content: "Tenants have deposited $2,100.00 (1x monthly rent). Interest accrues per California Civil Code. Itemized deduction statement provided within 21 days of move-out.", category: "financial" },
      { id: "c-s10-3", title: "Pet Policy", content: "One dog (under 50 lbs) and one cat permitted. Pet deposit of $400 is non-refundable and covers pet-related wear. Breed restrictions apply per community guidelines. Pets must be leashed in common areas.", category: "rules" },
      { id: "c-s10-4", title: "Community Rules", content: "Tenants and guests must follow community guidelines. Playground hours: dawn to dusk. BBQ area available by reservation. Quiet hours 9PM-7AM. Speed limit 15 mph on property.", category: "rules" },
      { id: "c-s10-5", title: "Parking", content: "Two assigned parking spaces (Spots 24A and 24B) included at no additional cost. Vehicles must be registered with management. No recreational vehicles, boats, or trailers.", category: "rules" },
      { id: "c-s10-6", title: "Maintenance", content: "Management handles all exterior maintenance, landscaping, and common area upkeep. Tenant responsible for interior maintenance and lawn care for ground-floor patios. HVAC filter replacement provided quarterly.", category: "maintenance" },
      { id: "c-s10-7", title: "Extended Term Benefits", content: "24-month lease includes rate lock guarantee for full term. Annual carpet cleaning provided by management. Priority waitlist for unit upgrades within the community.", category: "financial" },
      { id: "c-s10-8", title: "Early Termination", content: "Early termination requires 90 days written notice and payment of 2 months rent as early termination fee. Military clause applies per SCRA. Job relocation clause: 60 days notice with employer documentation.", category: "termination" },
    ],
    createdAt: "2025-08-15T11:00:00Z",
    sentAt: "2025-08-16T08:00:00Z",
    signedAt: "2025-08-20T16:00:00Z",
    aiSummary: "24-month family lease for Unit WC-012 at Willow Creek Apartments. Monthly rent $2,100 rate-locked for full term. Two parking spaces included free. Pet-friendly (1 dog + 1 cat, $400 deposit). Water/trash/sewer included. Family amenities access.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s10-1", action: "created", timestamp: "2025-08-15T11:00:00Z", detail: "AI-generated family-optimized lease" },
      { id: "evt-s10-2", action: "sent", timestamp: "2025-08-16T08:00:00Z", detail: "Sent to thompson.family@email.com" },
      { id: "evt-s10-3", action: "signed", timestamp: "2025-08-20T16:00:00Z", detail: "Signed by both Marcus and Jennifer Thompson" },
    ],
  },
  {
    id: "lease-seed-011",
    propertyId: "prop-ocean-001",
    propertyName: "Oceanfront Towers",
    unitId: "of-u5",
    unitLabel: "OF-005",
    tenantId: "tenant-ocean-1",
    tenantName: "David Chen",
    tenantEmail: "d.chen@techcorp.com",
    status: "pending_tenant",
    monthlyRent: 4200,
    leaseTerm: 12,
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    securityDeposit: 8400,
    securityDepositMultiplier: 2,
    lateFeePercent: 5,
    lateFeeGraceDays: 3,
    petPolicy: true,
    petDeposit: 600,
    parkingIncluded: true,
    parkingFee: 300,
    utilitiesIncluded: ["Water", "Trash", "Electric", "Gas", "Internet"],
    specialProvisions: "Ocean-view premium unit. Floor-to-ceiling windows. Private balcony. Smart home features included.",
    clauses: [
      { id: "c-s11-1", title: "Rent Payment", content: "Tenant agrees to pay $4,200.00 per month, due on the 1st. Premium unit rate includes ocean view guarantee. Rent increases capped at 3% annually upon renewal.", category: "financial" },
      { id: "c-s11-2", title: "Security Deposit", content: "Tenant to deposit $8,400.00 (2x monthly rent) prior to move-in. Deposit held in FDIC-insured account. Premium finishes require additional care standards detailed in move-in checklist.", category: "financial" },
      { id: "c-s11-3", title: "Smart Home Features", content: "Unit includes Nest thermostat, smart locks, motorized blinds, and integrated speaker system. Tenant may not modify or replace smart home devices. Technical support available through building management.", category: "rules" },
      { id: "c-s11-4", title: "Balcony Usage", content: "Private balcony for personal use only. No grilling, smoking, or storage of combustibles. Furniture must be weather-rated and secured. No items may be hung from balcony railing. Balcony cleaning included monthly.", category: "rules" },
      { id: "c-s11-5", title: "Pet Policy", content: "One pet permitted (dog under 40 lbs or cat). Pet deposit $600 required. Pet DNA registration required for community areas. Pets prohibited from pool deck and rooftop areas.", category: "rules" },
      { id: "c-s11-6", title: "Premium Maintenance", content: "Priority maintenance with 2-hour response for emergencies, 24-hour for standard requests. Quarterly professional cleaning of HVAC and windows included. Appliance replacement within 48 hours if unrepairable.", category: "maintenance" },
      { id: "c-s11-7", title: "Parking & Storage", content: "One premium covered parking space with EV charger access at $300/month. One climate-controlled storage unit (5x8) included. Valet parking available for guests at $20/visit.", category: "rules" },
      { id: "c-s11-8", title: "Building Amenities", content: "Access to infinity pool, spa, fitness center, business center, and private theater. Pool and spa hours 6AM-10PM. Guest amenity passes: 5 per month included, additional at $15/day.", category: "general" },
      { id: "c-s11-9", title: "Termination & Renewal", content: "Renewal offer presented 120 days before expiration with rate-lock option. Early termination: 60 days notice plus 3 months rent penalty. Diplomatic clause available for international relocations.", category: "termination" },
    ],
    createdAt: "2026-02-14T09:00:00Z",
    sentAt: "2026-02-14T11:00:00Z",
    aiSummary: "12-month premium oceanfront lease for Unit OF-005 at Oceanfront Towers. Monthly rent $4,200 with 2x deposit. All utilities and internet included. Smart home features, private balcony, premium parking with EV charging at $300/mo. Pet-friendly. Full amenity access.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s11-1", action: "created", timestamp: "2026-02-14T09:00:00Z", detail: "AI-generated premium oceanfront lease with smart home provisions" },
      { id: "evt-s11-2", action: "sent", timestamp: "2026-02-14T11:00:00Z", detail: "Sent to d.chen@techcorp.com for review" },
    ],
  },
  {
    id: "lease-seed-012",
    propertyId: "prop-cedar-001",
    propertyName: "Cedar Ridge Villas",
    unitId: "cr-u7",
    unitLabel: "CR-007",
    tenantId: "tenant-cedar-1",
    tenantName: "Amanda & Robert Foster",
    tenantEmail: "fosters@email.com",
    status: "draft",
    monthlyRent: 2850,
    leaseTerm: 18,
    startDate: "2026-04-01",
    endDate: "2027-09-30",
    securityDeposit: 4275,
    securityDepositMultiplier: 1.5,
    lateFeePercent: 4,
    lateFeeGraceDays: 7,
    petPolicy: true,
    petDeposit: 500,
    parkingIncluded: true,
    parkingFee: 0,
    utilitiesIncluded: ["Water", "Trash", "Sewer"],
    specialProvisions: "Detached villa with private yard. Two-car garage included. Access to community pool and tennis courts.",
    clauses: [
      { id: "c-s12-1", title: "Rent Payment", content: "Tenants agree to pay $2,850.00 per month, due on the 1st. Joint and several liability. Online auto-pay discount of $25/month available. Rent includes yard maintenance service.", category: "financial" },
      { id: "c-s12-2", title: "Security Deposit", content: "Tenants to deposit $4,275.00 (1.5x monthly rent). Villa-specific inspection checklist applies. Deposit covers interior, garage, and yard restoration to move-in condition.", category: "financial" },
      { id: "c-s12-3", title: "Private Yard", content: "Tenant has exclusive use of enclosed private yard (approx. 800 sq ft). Professional landscaping provided bi-weekly by management. Tenant may add container plants and temporary outdoor furniture. No permanent structures.", category: "maintenance" },
      { id: "c-s12-4", title: "Garage & Parking", content: "Two-car attached garage included at no additional cost. Garage must remain available for vehicle parking (no conversion to living space). Driveway parking for 2 additional vehicles.", category: "rules" },
      { id: "c-s12-5", title: "Pet Policy", content: "Up to two pets permitted (dogs or cats). Combined pet deposit $500. Breed restrictions per HOA guidelines. Pets must be contained within yard or leashed in common areas. Pet waste stations located throughout community.", category: "rules" },
      { id: "c-s12-6", title: "Villa Maintenance", content: "Management handles exterior maintenance, roof, and structural repairs. Tenant responsible for interior upkeep, lightbulb replacement, and air filter changes. Pest control service provided quarterly.", category: "maintenance" },
      { id: "c-s12-7", title: "Community Amenities", content: "Access to community pool (Memorial Day-Labor Day), tennis courts, and walking trails. Guest access limited to 4 guests for pool, 2 for tennis courts. Annual community events included.", category: "general" },
      { id: "c-s12-8", title: "Termination", content: "Early termination requires 90 days notice and payment of 2 months rent. 18-month lease includes one-time option to convert to month-to-month at 105% of current rent after month 12.", category: "termination" },
    ],
    createdAt: "2026-02-18T14:00:00Z",
    aiSummary: "18-month villa lease for Unit CR-007 at Cedar Ridge Villas. Monthly rent $2,850 with 1.5x deposit. Detached villa with private yard and two-car garage. Up to 2 pets allowed ($500 deposit). Water/trash/sewer included. Pool and tennis access. Auto-pay discount available.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s12-1", action: "created", timestamp: "2026-02-18T14:00:00Z", detail: "AI-generated villa lease with yard and garage provisions" },
    ],
  },
  {
    id: "lease-seed-013",
    propertyId: "prop-willow-001",
    propertyName: "Willow Creek Apartments",
    unitId: "wc-u28",
    unitLabel: "WC-028",
    tenantId: "tenant-willow-2",
    tenantName: "Priya Patel",
    tenantEmail: "priya.patel@email.com",
    status: "pending_tenant",
    monthlyRent: 1950,
    leaseTerm: 12,
    startDate: "2026-03-15",
    endDate: "2027-03-14",
    securityDeposit: 1950,
    securityDepositMultiplier: 1,
    lateFeePercent: 5,
    lateFeeGraceDays: 5,
    petPolicy: false,
    petDeposit: 0,
    parkingIncluded: true,
    parkingFee: 75,
    utilitiesIncluded: ["Water", "Trash"],
    specialProvisions: "Ground-floor unit with patio. Near community garden and dog park.",
    clauses: [
      { id: "c-s13-1", title: "Rent Payment", content: "Tenant agrees to pay $1,950.00 per month, due on the 15th (aligned with lease start). Electronic payment required. Paper check incurs $10 processing fee.", category: "financial" },
      { id: "c-s13-2", title: "Security Deposit", content: "Tenant has deposited $1,950.00 (1x monthly rent). Deposit returned within 21 days minus documented deductions. Pre-move-in inspection completed and signed by both parties.", category: "financial" },
      { id: "c-s13-3", title: "Patio Use", content: "Tenant has exclusive use of enclosed ground-floor patio. Patio furniture and container gardens permitted. No permanent modifications. Patio must be kept clean and free of debris.", category: "rules" },
      { id: "c-s13-4", title: "Parking", content: "One assigned covered parking space at $75/month. Additional uncovered guest parking available. Electric vehicle charging stations in community lot at market rates.", category: "rules" },
      { id: "c-s13-5", title: "Community Garden", content: "Tenant eligible for one garden plot (4x8 ft) on first-come basis. Garden plots maintained according to community guidelines. No pesticides or herbicides permitted.", category: "general" },
      { id: "c-s13-6", title: "Maintenance", content: "Standard maintenance requests via online portal. Emergency maintenance available 24/7 at (555) 123-4567. Ground-floor specific: tenant responsible for patio drain maintenance.", category: "maintenance" },
      { id: "c-s13-7", title: "Lease Renewal", content: "Renewal terms offered 60 days before expiration. On-time payment history may qualify for rent reduction at renewal. Month-to-month at 108% of current rent if no renewal signed.", category: "termination" },
    ],
    createdAt: "2026-02-16T10:30:00Z",
    sentAt: "2026-02-16T14:00:00Z",
    aiSummary: "12-month ground-floor lease for Unit WC-028 at Willow Creek Apartments. Monthly rent $1,950 with 1x deposit. Covered parking at $75/mo. Private patio and community garden access. Water and trash included. No pets. On-time payment incentive at renewal.",
    organizationId: "demo-org",
    activity: [
      { id: "evt-s13-1", action: "created", timestamp: "2026-02-16T10:30:00Z", detail: "AI-generated lease with ground-floor patio provisions" },
      { id: "evt-s13-2", action: "sent", timestamp: "2026-02-16T14:00:00Z", detail: "Sent to priya.patel@email.com" },
    ],
  },
];
let leaseIdCounter = 14;
let clauseIdCounter = 100;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize seeded lease agreements with actual demo org ID
  try {
    const [demoOrg] = await db.select().from(organizations).where(eq(organizations.name, "Naltos Demo Properties"));
    if (demoOrg) {
      leaseAgreements.forEach(la => {
        if (la.organizationId === "demo-org") {
          la.organizationId = demoOrg.id;
        }
      });
    }
  } catch (e) {
    // Non-critical: leases will still work when created via API
  }

  // Apply organization ID extraction middleware globally
  app.use("/api", extractOrganizationId);

  // ============ Identity Auth Routes (Multi-Persona) ============

  app.post("/api/identity/login", async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ error: "Invalid magic code" });
      }
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ error: "Magic code expired" });
      }

      const demoEmails = ["demo@naltos.com", "tenant@demo.com", "vendor@demo.com", "merchant@demo.com", "partner@demo.com", "multi@demo.com"];
      if (!demoEmails.includes(email)) {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      const identity = await storage.getIdentityByEmail(email);
      if (!identity) {
        return res.status(404).json({ error: "No identity found for this email. Use standard login." });
      }

      const personas = await storage.getPersonasByIdentityId(identity.id);
      if (personas.length === 0) {
        return res.status(404).json({ error: "No active personas found." });
      }

      await storage.updateIdentityLastLogin(identity.id);

      if (personas.length === 1) {
        const persona = personas[0];
        const legacyRole = personaToLegacyRole(persona.personaType, persona.roleDetail);

        const user = await storage.getUserByEmail(email);

        await new Promise<void>((resolve, reject) => {
          req.session.regenerate((err) => { if (err) reject(err); else resolve(); });
        });

        req.session.identityId = identity.id;
        req.session.personaId = persona.id;
        req.session.personaType = persona.personaType;
        req.session.roleDetail = persona.roleDetail;
        req.session.organizationId = persona.orgId || "";
        req.session.userId = user?.id || identity.id;
        req.session.userRole = legacyRole;

        const organization = persona.orgId ? await storage.getOrganization(persona.orgId) : null;

        return res.json({
          identity: { id: identity.id, email: identity.email, displayName: identity.displayName },
          persona,
          user: user || { id: identity.id, email: identity.email, role: legacyRole, organizationId: persona.orgId },
          organization,
          requiresSelection: false,
        });
      }

      res.json({
        identity: { id: identity.id, email: identity.email, displayName: identity.displayName },
        personas: personas.map(p => ({
          ...p,
          legacyRole: personaToLegacyRole(p.personaType, p.roleDetail),
        })),
        requiresSelection: true,
      });
    } catch (error: any) {
      console.error("Identity login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/select-persona", async (req, res) => {
    try {
      const { identityId, personaId } = req.body;
      if (!identityId || !personaId) {
        return res.status(400).json({ error: "identityId and personaId are required" });
      }

      const identity = await storage.getIdentityById(identityId);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found" });
      }

      const persona = await storage.getPersonaById(personaId);
      if (!persona || persona.identityId !== identityId) {
        return res.status(403).json({ error: "Invalid persona selection" });
      }
      if (persona.status !== "active") {
        return res.status(403).json({ error: "Persona is not active" });
      }

      const legacyRole = personaToLegacyRole(persona.personaType, persona.roleDetail);
      const user = await storage.getUserByEmail(identity.email);

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => { if (err) reject(err); else resolve(); });
      });

      req.session.identityId = identity.id;
      req.session.personaId = persona.id;
      req.session.personaType = persona.personaType;
      req.session.roleDetail = persona.roleDetail;
      req.session.organizationId = persona.orgId || "";
      req.session.userId = user?.id || identity.id;
      req.session.userRole = legacyRole;

      if (persona.personaType === "tenant" && user?.tenantId) {
        req.session.tenantId = user.tenantId;
      }

      const organization = persona.orgId ? await storage.getOrganization(persona.orgId) : null;

      res.json({
        identity: { id: identity.id, email: identity.email, displayName: identity.displayName },
        persona,
        user: user || { id: identity.id, email: identity.email, role: legacyRole, organizationId: persona.orgId },
        organization,
      });
    } catch (error: any) {
      console.error("Persona selection error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/identity/switch-persona", requireAuth, async (req, res) => {
    try {
      const identityId = req.session.identityId;
      if (!identityId) {
        return res.status(400).json({ error: "No identity session. Use standard login." });
      }

      const { personaId } = req.body;
      if (!personaId) {
        return res.status(400).json({ error: "personaId is required" });
      }

      const persona = await storage.getPersonaById(personaId);
      if (!persona || persona.identityId !== identityId) {
        return res.status(403).json({ error: "Invalid persona" });
      }
      if (persona.status !== "active") {
        return res.status(403).json({ error: "Persona is not active" });
      }

      const identity = await storage.getIdentityById(identityId);
      if (!identity) {
        return res.status(404).json({ error: "Identity not found" });
      }

      const legacyRole = personaToLegacyRole(persona.personaType, persona.roleDetail);
      const user = await storage.getUserByEmail(identity.email);

      req.session.personaId = persona.id;
      req.session.personaType = persona.personaType;
      req.session.roleDetail = persona.roleDetail;
      req.session.organizationId = persona.orgId || "";
      req.session.userRole = legacyRole;

      if (persona.personaType === "tenant" && user?.tenantId) {
        req.session.tenantId = user.tenantId;
      }

      const organization = persona.orgId ? await storage.getOrganization(persona.orgId) : null;

      res.json({
        identity: { id: identity.id, email: identity.email, displayName: identity.displayName },
        persona,
        user: user || { id: identity.id, email: identity.email, role: legacyRole, organizationId: persona.orgId },
        organization,
      });
    } catch (error: any) {
      console.error("Persona switch error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/identity/personas", requireAuth, async (req, res) => {
    try {
      const identityId = req.session.identityId;
      if (!identityId) {
        return res.json({ personas: [] });
      }

      const personas = await storage.getPersonasByIdentityId(identityId);
      res.json({
        currentPersonaId: req.session.personaId,
        personas: personas.map(p => ({
          ...p,
          legacyRole: personaToLegacyRole(p.personaType, p.roleDetail),
        })),
      });
    } catch (error: any) {
      console.error("Get personas error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Seed Route (Demo Only - Admin Access Required) ============
  app.post("/api/seed", requireAuth, requireRole("Admin"), async (req, res) => {
    try {
      // Only allow seeding for demo organization
      const orgId = req.organizationId!;
      const org = await storage.getOrganization(orgId);
      
      if (!org || org.name !== "Naltos Demo Properties") {
        return res.status(403).json({ error: "Seeding is only available for demo organization" });
      }
      
      await seedDatabase();
      res.json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
      console.error("Seed error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Auth Routes ============
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, organizationName } = req.body;

      // Check if user exists
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Create organization
      const organization = await storage.createOrganization({
        name: organizationName,
      });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        organizationId: organization.id,
        role: "Admin",
      });

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.organizationId = user.organizationId!; // Safe because signup always creates an organization

      res.json({ user, organization });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "000000" for demo
      const code = "000000";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ error: "Invalid magic code" });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ error: "Magic code expired" });
      }

      // Mark as used (except for demo accounts to allow reuse)
      const demoEmails = ["demo@naltos.com", "tenant@demo.com"];
      if (!demoEmails.includes(email)) {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get or create user
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // For demo, create user if doesn't exist
        const hashedPassword = await bcrypt.hash("demo123", 10);
        const existingOrgs = await storage.getOrganization("demo-org-id"); // Won't exist for new users
        let organization;
        if (!existingOrgs) {
          organization = await storage.createOrganization({
            name: "Demo Organization",
          });
        } else {
          organization = existingOrgs;
        }

        user = await storage.createUser({
          email,
          password: hashedPassword,
          organizationId: organization.id,
          role: "Admin",
        });
      }

      // Vendor users should use /api/vendor-auth/login instead
      if (user.role === "Vendor") {
        return res.status(400).json({ 
          error: "Invalid login endpoint",
          message: "Vendor users should login at /api/vendor-auth/login"
        });
      }

      // Merchant users should use /api/merchant-auth/login instead
      if (user.role === "Merchant") {
        return res.status(400).json({ 
          error: "Invalid login endpoint",
          message: "Merchant users should login at /api/merchant-auth/login"
        });
      }

      // Get organization (safe because we verified user is not a vendor)
      const organization = await storage.getOrganization(user.organizationId!);

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.organizationId = user.organizationId!; // Safe because non-vendor users always have organizationId

      res.json({ user, organization });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // ============ Vendor Auth Routes ============
  // Vendor-specific authentication (no organization signup, vendors are invited by property managers)
  
  app.post("/api/vendor-auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Verify vendor user exists (vendors must be invited, they can't self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Vendor") {
        return res.status(404).json({ 
          error: "Vendor not found",
          message: "No vendor account found with this email. Please contact your property manager to get invited."
        });
      }

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "111111" for demo
      const code = "111111";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Vendor send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vendor-auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ 
          error: "Invalid magic code",
          message: "Invalid magic code"
        });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ 
          error: "Magic code expired",
          message: "Magic code expired"
        });
      }

      // Mark as used (except for demo accounts to allow reuse)
      if (email !== "vendor@demo.com") {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get vendor user (must exist, vendors are invited not self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Vendor") {
        return res.status(401).json({ 
          error: "Invalid vendor account",
          message: "This account is not registered as a vendor."
        });
      }

      // Get vendor user links to ensure they have access to at least one vendor
      const linkedVendorIds = await storage.getVendorUserLinks(user.id);
      if (linkedVendorIds.length === 0) {
        return res.status(409).json({ 
          error: "No vendor access",
          message: "Your account has not been linked to any vendors yet. Please contact your property manager."
        });
      }

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      // NOTE: organizationId is null for vendor users (they span multiple orgs)
      req.session.userId = user.id;
      req.session.userRole = "Vendor";
      req.session.organizationId = null as any; // Vendor users have no single organization (use null, not undefined)

      // Return user with vendor metadata (linked vendor count)
      res.json({ 
        user: {
          ...user,
          vendorCount: linkedVendorIds.length, // Number of property managers this vendor works with
        },
        organization: null, // Vendors don't have a single organization
      });
    } catch (error: any) {
      console.error("Vendor login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Authentication Routes ============
  // Merchant-specific authentication (similar to vendor auth pattern)
  
  app.post("/api/merchant-auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      // Verify merchant user exists (merchants must be invited, they can't self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Merchant") {
        return res.status(404).json({ 
          error: "Merchant not found",
          message: "No merchant account found with this email. Please contact your property manager to get invited."
        });
      }

      // Delete old magic codes for this email to prevent confusion
      await storage.deleteOldMagicCodes(email);

      // Create magic code - always "222222" for demo
      const code = "222222";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      // In production, would send email here
      res.json({ success: true });
    } catch (error: any) {
      console.error("Merchant send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/merchant-auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      // Find magic code
      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ 
          error: "Invalid magic code",
          message: "Invalid magic code"
        });
      }

      // Check expiration
      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ 
          error: "Magic code expired",
          message: "Magic code expired"
        });
      }

      // Mark as used (except for demo accounts to allow reuse)
      if (email !== "merchant@demo.com") {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      // Get merchant user (must exist, merchants are invited not self-signup)
      const user = await storage.getUserByEmail(email);
      if (!user || user.role !== "Merchant") {
        return res.status(401).json({ 
          error: "Invalid merchant account",
          message: "This account is not registered as a merchant."
        });
      }

      // Get merchant user links to ensure they have access to at least one merchant
      const linkedMerchantIds = await storage.getMerchantUserLinks(user.id);
      if (linkedMerchantIds.length === 0) {
        return res.status(409).json({ 
          error: "No merchant access",
          message: "Your account has not been linked to any merchants yet. Please contact your property manager."
        });
      }

      // Regenerate session to prevent fixation attacks
      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user info in session for secure authentication
      // NOTE: organizationId is null for merchant users (they span multiple orgs)
      req.session.userId = user.id;
      req.session.userRole = "Merchant";
      req.session.organizationId = null as any; // Merchant users have no single organization (use null, not undefined)

      // Return user with merchant metadata (linked merchant count)
      res.json({ 
        user: {
          ...user,
          merchantCount: linkedMerchantIds.length, // Number of property managers this merchant works with
        },
        organization: null, // Merchants don't have a single organization
      });
    } catch (error: any) {
      console.error("Merchant login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Partner Auth Routes ============
  app.post("/api/partner-auth/send-code", async (req, res) => {
    try {
      const { email } = req.body;

      await storage.deleteOldMagicCodes(email);

      const code = "333333";
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await storage.createMagicCode({
        email,
        code,
        expiresAt,
        used: false,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Partner send code error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/partner-auth/login", async (req, res) => {
    try {
      const { email, code } = req.body;

      const magicCode = await storage.getMagicCode(email, code);
      if (!magicCode) {
        return res.status(401).json({ 
          error: "Invalid magic code",
          message: "Invalid magic code"
        });
      }

      if (new Date() > magicCode.expiresAt) {
        return res.status(401).json({ 
          error: "Magic code expired",
          message: "Magic code expired"
        });
      }

      if (email !== "partner@demo.com") {
        await storage.markMagicCodeUsed(magicCode.id);
      }

      await new Promise<void>((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      req.session.userId = 0;
      req.session.userRole = "Partner" as any;
      req.session.organizationId = null as any;

      res.json({ 
        user: {
          id: 0,
          email,
          role: "Partner",
          firstName: "Acme",
          lastName: "Insurance",
        },
        organization: null,
      });
    } catch (error: any) {
      console.error("Partner login error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Vendor Portal Routes ============
  app.get("/api/vendor/balances", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get vendor overview with balances and organization info
      const overview = await storage.getVendorOverview(vendorIds);
      
      // Use the same helper as createRedemption to ensure consistency
      // This deducts pending/processing redemptions from available balance
      const balanceState = await storage.computeVendorBalanceState(vendorIds);
      
      const balances = overview.map(({ vendor, balance, organization }) => {
        const key = `${vendor.id}-${organization.id}`;
        const state = balanceState.get(key);
        
        // If no balance state found, use zeros
        if (!state) {
          return {
            vendorId: vendor.id,
            organizationName: organization.name,
            totalBalance: 0,
            availableBalance: 0,
            pendingBalance: 0,
          };
        }
        
        return {
          vendorId: vendor.id,
          organizationName: organization.name,
          totalBalance: state.totalBalance,
          availableBalance: state.availableBalance, // Correctly deducts pending redemptions
          pendingBalance: state.pendingBalance,     // Sum of pending/processing redemptions
        };
      });
      
      res.json({ balances });
    } catch (error: any) {
      console.error("Vendor balances error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/invoices", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get invoices filtered by vendor IDs with organization names
      const invoicesData = await storage.getInvoicesForVendorIds(vendorIds);
      
      const invoices = invoicesData.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: parseFloat(inv.amount),
        status: inv.status,
        dueDate: inv.dueDate.toISOString(),
        organizationName: inv.organizationName,
      }));
      
      res.json({ invoices });
    } catch (error: any) {
      console.error("Vendor invoices error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/redemptions", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      
      // Get real redemption data from database
      const redemptions = await storage.getRedemptionsByVendorIds(vendorIds);
      
      res.json({ redemptions });
    } catch (error: any) {
      console.error("Vendor redemptions error:", error);
      res.status(500).json({ error: error.message, message: error.message });
    }
  });

  app.post("/api/vendor/redemptions", requireVendor(storage), async (req, res) => {
    try {
      // SECURITY: vendorIds from req.vendorIds (set by requireVendor middleware)
      // This is derived from vendor_user_links table, NOT from client request
      const vendorIds = req.vendorIds!;
      const { rail, nusdAmount, payoutMethodId } = req.body;
      
      // Validate input
      if (!rail || !nusdAmount) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          message: "Rail type and amount are required" 
        });
      }
      
      // Validate rail type
      const validRails = ["ACH", "PushToCard", "OnChainStablecoin"];
      if (!validRails.includes(rail)) {
        return res.status(400).json({ 
          error: "Invalid rail type", 
          message: `Rail must be one of: ${validRails.join(", ")}` 
        });
      }
      
      // Validate amount
      const amount = parseFloat(nusdAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: "Invalid amount", 
          message: "Amount must be a positive number" 
        });
      }
      
      // Create redemption(s) - proportionally deducted across vendor balances
      const redemptions = await storage.createRedemption({
        vendorIds,
        rail,
        nusdAmount: amount.toFixed(2),
        payoutMethodId,
      });
      
      res.json({ 
        success: true,
        message: "Redemption request created successfully",
        redemptions 
      });
    } catch (error: any) {
      console.error("Vendor redemption creation error:", error);
      
      // Return appropriate status code based on error message
      const statusCode = error.message.includes("Insufficient balance") ? 400 : 500;
      
      res.status(statusCode).json({ 
        error: error.message, 
        message: error.message 
      });
    }
  });

  app.get("/api/vendor/stablecoin-allocations/:vendorId", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      const { vendorId } = req.params;
      const userId = req.userId!;
      
      // Verify vendor access
      if (!vendorIds.includes(vendorId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this vendor"
        });
      }
      
      const allocations = await storage.getVendorStablecoinAllocations(userId, vendorId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Vendor stablecoin allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/vendor/treasury-allocations/:vendorId", requireVendor(storage), async (req, res) => {
    try {
      const vendorIds = req.vendorIds!;
      const { vendorId } = req.params;
      const userId = req.userId!;
      
      // Verify vendor access
      if (!vendorIds.includes(vendorId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this vendor"
        });
      }
      
      const allocations = await storage.getVendorTreasuryAllocations(userId, vendorId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Vendor treasury allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Portal Routes ============
  app.get("/api/merchant/balances", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      
      // Get merchant overview with balances and organization info
      const overview = await storage.getMerchantOverview(merchantIds);
      
      const balances = overview.map(({ merchant, balance, organization }) => {
        return {
          merchantId: merchant.id,
          organizationName: organization.name,
          nusdBalance: balance?.nusdBalance || 0,
          pendingSettlement: balance?.pendingSettlement || 0,
          totalReceived: balance?.totalReceived || 0,
          totalSettled: balance?.totalSettled || 0,
          totalYieldGenerated: balance?.totalYieldGenerated || 0,
        };
      });
      
      res.json({ balances });
    } catch (error: any) {
      console.error("Merchant balances error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/transactions/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const { status } = req.query;
      const userId = req.userId!;
      
      // Verify merchantId is in the user's accessible merchants
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      // Get transactions for the specific merchant
      const transactions = await storage.getMerchantTransactionsByMerchantId(
        userId,
        merchantId,
        status ? { status: status as string } : undefined
      );
      
      res.json({ transactions });
    } catch (error: any) {
      console.error("Merchant transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/stablecoin-allocations/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const userId = req.userId!;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      const allocations = await storage.getMerchantStablecoinAllocations(userId, merchantId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Merchant stablecoin allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/merchant/treasury-allocations/:merchantId", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { merchantId } = req.params;
      const userId = req.userId!;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      const allocations = await storage.getMerchantTreasuryAllocations(userId, merchantId);
      
      res.json({ allocations });
    } catch (error: any) {
      console.error("Merchant treasury allocations error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Merchant instant settlement (demo - simulates immediate settlement to bank)
  app.post("/api/merchant/settlements", requireMerchant(storage), async (req, res) => {
    try {
      const merchantIds = req.merchantIds!;
      const { amount, merchantId, paymentMethod } = req.body;
      
      // Verify merchant access
      if (!merchantIds.includes(merchantId)) {
        return res.status(403).json({ 
          error: "Access denied",
          message: "You don't have access to this merchant"
        });
      }
      
      // For demo purposes, just return success with simulated data
      // In production, this would create actual settlement records
      const settlement = {
        id: Math.random().toString(36).substring(7),
        merchantId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'ach',
        status: 'processing',
        requestedAt: new Date().toISOString(),
        estimatedCompletion: paymentMethod === 'wire' 
          ? new Date().toISOString() 
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Next day for ACH
      };
      
      res.json({ 
        settlement,
        message: `Settlement of $${amount} initiated via ${paymentMethod.toUpperCase()}. Funds will arrive in your bank account ${paymentMethod === 'wire' ? 'today' : '1-2 business days'}.`
      });
    } catch (error: any) {
      console.error("Merchant settlement error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ KPI Routes ============
  // All roles can access KPIs
  app.get("/api/kpis", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      // Get org ID from session (set by requireRole middleware)
      const orgId = req.organizationId!;

      const kpis = await storage.getKPIs(orgId);
      res.json(kpis);
    } catch (error: any) {
      console.error("KPI error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Collections Routes ============
  // Admin, PropertyManager, CFO can access collections
  app.get("/api/collections", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const collections = await storage.getCollections(orgId);
      res.json(collections);
    } catch (error: any) {
      console.error("Collections error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/collections/:id/paylink", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would send SMS/email
      res.json({ success: true });
    } catch (error: any) {
      console.error("Paylink error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/collections/:id/nudge", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would schedule reminder
      res.json({ success: true });
    } catch (error: any) {
      console.error("Nudge error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Reconciliation Routes ============
  // Admin, PropertyManager, CFO can access reconciliation
  app.get("/api/recon", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const recon = await storage.getReconciliation(orgId);
      res.json(recon);
    } catch (error: any) {
      console.error("Recon error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/recon/auto-match", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      // Mock: In production, would run AI matching algorithm
      res.json({ success: true });
    } catch (error: any) {
      console.error("Auto-match error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/recon/approve", requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      const { bankEntryId, paymentId } = req.body;
      await storage.approveMatch(bankEntryId, paymentId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Approve match error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Treasury Routes ============
  // Only Admin and CFO can access treasury
  app.get("/api/treasury/products", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const products = await storage.getTreasuryProducts();
      const subscriptions = await storage.getTreasurySubscriptions(orgId);

      // Merge products with subscriptions
      const productsWithSubs = products.map(product => {
        const subscription = subscriptions.find(sub => sub.productId === product.id);
        return {
          ...product,
          subscription: subscription || undefined,
        };
      });

      res.json(productsWithSubs);
    } catch (error: any) {
      console.error("Treasury products error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/subscribe", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { productId, amount } = req.body;
      const orgId = req.organizationId!;

      const subscription = await storage.createOrUpdateSubscription({
        organizationId: orgId,
        productId,
        balance: amount.toFixed(2),
        autoRoll: false,
      });

      res.json(subscription);
    } catch (error: any) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/redeem", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { subscriptionId, amount } = req.body;
      const orgId = req.organizationId!;

      // Get current subscription
      const subs = await storage.getTreasurySubscriptions(orgId);
      const subscription = subs.find(s => s.id === subscriptionId);
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }

      const currentBalance = parseFloat(subscription.balance);
      const newBalance = Math.max(0, currentBalance - amount).toFixed(2);

      await storage.updateSubscriptionBalance(subscriptionId, newBalance);

      res.json({ success: true, newBalance });
    } catch (error: any) {
      console.error("Redeem error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/treasury/autoroll", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const { subscriptionId, autoRoll } = req.body;

      await storage.toggleAutoRoll(subscriptionId, autoRoll);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Auto-roll error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rent Float Treasury Routes ============
  app.get("/api/rent-float", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const data = await storage.getRentFloatData(orgId);

      res.json(data);
    } catch (error: any) {
      console.error("Rent float error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rent-float/enhanced", requireRole("Admin", "CFO"), async (req, res) => {
    try {
      let baseData: any;
      try {
        baseData = await storage.getRentFloatData(req.organizationId!);
      } catch {
        baseData = {
          config: { rentFloatEnabled: true, rentFloatYieldRate: "5.25", rentFloatOwnerShare: "3.00", rentFloatTenantShare: "1.25", rentFloatNaltosShare: "0.75", rentFloatDefaultDuration: 10 },
          totalFloat: "245000.00", averageDuration: 10, monthlyYield: "340.00",
          ownerShare: "204.00", tenantShare: "85.00", naltosShare: "51.00", recentPayments: [],
        };
      }
      const totalFloat = parseFloat(baseData.totalFloat) || 0;
      const monthlyYield = parseFloat(baseData.monthlyYield) || 0;
      const yieldRate = parseFloat(baseData.config.rentFloatYieldRate || "5.25");

      const now = new Date();
      const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const month = d.toLocaleString("default", { month: "short" });
        const seasonFactor = 1 + 0.08 * Math.sin((d.getMonth() - 3) * Math.PI / 6);
        const growthFactor = 0.85 + (i / 11) * 0.15;
        const baseFloat = totalFloat > 0 ? totalFloat : 245000;
        const floatBal = Math.round(baseFloat * seasonFactor * growthFactor);
        const yieldGen = Math.round(floatBal * (yieldRate / 100) * (10 / 365));
        const utilization = Math.min(98, 82 + i * 1.2 + Math.random() * 3);
        return { month, floatBalance: floatBal, yieldGenerated: yieldGen, utilization: Math.round(utilization) };
      });

      const deploymentAllocation = [
        { product: "Treasury Bills", allocation: 45, apy: 5.25, balance: Math.round((totalFloat || 245000) * 0.45) },
        { product: "Money Market", allocation: 30, apy: 4.80, balance: Math.round((totalFloat || 245000) * 0.30) },
        { product: "Enhanced Credit", allocation: 15, apy: 6.10, balance: Math.round((totalFloat || 245000) * 0.15) },
        { product: "Liquidity Reserve", allocation: 10, apy: 3.50, balance: Math.round((totalFloat || 245000) * 0.10) },
      ];

      const currentFloat = totalFloat || 245000;
      const avgCycleTime = baseData.averageDuration || 10;
      const floatVelocity = {
        currentBalance: currentFloat,
        deployedBalance: Math.round(currentFloat * 0.92),
        utilization: 92,
        avgCycleTime,
        turnoverRate: +(30 / avgCycleTime).toFixed(1),
        dailyYield: +((monthlyYield || 340) / 30).toFixed(2),
        projectedAnnualYield: Math.round((monthlyYield || 340) * 12),
        weightedAPY: +(deploymentAllocation.reduce((s, d) => s + d.apy * d.allocation / 100, 0)).toFixed(2),
      };

      const floatIntelligence = {
        optimalDeploymentMix: "Current allocation is 3.2% below neural-optimized target. Shifting 5% from Liquidity Reserve to Enhanced Credit would add ~$420/yr.",
        paymentTimingInsight: "67% of rent payments cluster between the 1st-5th. Pre-positioning treasury deployments 48hrs before peak inflow increases yield capture by 0.8%.",
        seasonalForecast: "Q2 historically shows 12% higher float balances due to lease renewals. Recommend increasing Enhanced Credit allocation to 20% during Apr-Jun.",
        riskAssessment: "Float concentration risk: low. 94% of float is in investment-grade instruments with same-day liquidity. Max drawdown scenario: 2.1% over 30 days.",
        confidenceScore: 87,
      };

      res.json({
        ...baseData,
        monthlyTrend,
        deploymentAllocation,
        floatVelocity,
        floatIntelligence,
      });
    } catch (error: any) {
      console.error("Rent float enhanced error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Agent Routes ============
  // All roles can access agent
  app.post("/api/agent", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const { prompt } = req.body;

      // Set headers for streaming
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      // Create streaming completion
      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are Naltos Agent, an AI assistant for property management and treasury operations. Provide helpful, professional insights based on the user's question. Keep responses concise and actionable. For demo purposes, reference realistic but fictional data."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
        max_completion_tokens: 500,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Reports Routes ============
  // All roles can access reports
  app.get("/api/reports", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const reports = await storage.getReports(orgId);
      res.json(reports);
    } catch (error: any) {
      console.error("Reports error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Settings Routes ============
  // Only Admin can access settings
  app.get("/api/settings", requireRole("Admin"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const settings = await storage.getSettings(orgId);
      res.json(settings);
    } catch (error: any) {
      console.error("Settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/organization", requireRole("Admin"), async (req, res) => {
    try {
      const { name } = req.body;
      const orgId = req.organizationId!;

      await storage.updateOrganization(orgId, name);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update org error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/settings/update", requireRole("Admin"), async (req, res) => {
    try {
      const updates = req.body;
      const orgId = req.organizationId!;

      await storage.updateSettings(orgId, updates);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/settings/users", requireRole("Admin"), async (req, res) => {
    try {
      const orgId = req.organizationId!;

      const users = await storage.getOrgUsers(orgId);
      res.json(users);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Routes ============

  app.get("/api/tenant/properties", requireRole("Tenant"), async (req, res) => {
    try {
      const properties = [
        {
          id: "prop-1",
          name: "Sunset Towers",
          address: "1250 Sunset Blvd, Los Angeles, CA 90028",
          units: [
            { id: "u-101", label: "Unit 101", floor: 1, bedrooms: 1, rent: 1800, available: true },
            { id: "u-102", label: "Unit 102", floor: 1, bedrooms: 2, rent: 2200, available: false },
            { id: "u-201", label: "Unit 201", floor: 2, bedrooms: 1, rent: 1850, available: true },
            { id: "u-202", label: "Unit 202", floor: 2, bedrooms: 2, rent: 2300, available: true },
            { id: "u-301", label: "Unit 301", floor: 3, bedrooms: 3, rent: 3200, available: true },
            { id: "u-412", label: "Unit 412", floor: 4, bedrooms: 2, rent: 2500, available: false },
          ],
        },
        {
          id: "prop-2",
          name: "Riverdale Apartments",
          address: "890 River St, Austin, TX 73301",
          units: [
            { id: "u-r101", label: "Unit 101", floor: 1, bedrooms: 1, rent: 1400, available: true },
            { id: "u-r102", label: "Unit 102", floor: 1, bedrooms: 2, rent: 1800, available: true },
            { id: "u-r201", label: "Unit 201", floor: 2, bedrooms: 1, rent: 1450, available: true },
            { id: "u-r202", label: "Unit 202", floor: 2, bedrooms: 2, rent: 1850, available: false },
          ],
        },
        {
          id: "prop-3",
          name: "Oak Ridge",
          address: "456 Oak Dr, Denver, CO 80202",
          units: [
            { id: "u-o101", label: "Unit 101", floor: 1, bedrooms: 1, rent: 1600, available: true },
            { id: "u-o108", label: "Unit 108", floor: 1, bedrooms: 2, rent: 2100, available: true },
            { id: "u-o205", label: "Unit 205", floor: 2, bedrooms: 3, rent: 2800, available: true },
          ],
        },
      ];
      res.json(properties);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/current-unit", requireRole("Tenant"), async (req, res) => {
    try {
      const sessionUnit = (req.session as any).selectedUnit;
      if (sessionUnit === null) {
        return res.json(null);
      }
      const currentUnit = sessionUnit || {
        propertyId: "prop-1",
        propertyName: "Sunset Towers",
        unitId: "u-412",
        unitLabel: "Unit 412",
        rent: 2500,
      };
      res.json(currentUnit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/select-unit", requireRole("Tenant"), async (req, res) => {
    try {
      const { propertyId, propertyName, unitId, unitLabel, rent } = req.body;
      if (!propertyId || !unitId || !unitLabel) {
        return res.status(400).json({ error: "Property and unit are required" });
      }
      (req.session as any).selectedUnit = { propertyId, propertyName, unitId, unitLabel, rent };
      res.json({ success: true, unit: { propertyId, propertyName, unitId, unitLabel, rent } });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/move-out", requireRole("Tenant"), async (req, res) => {
    try {
      (req.session as any).selectedUnit = null;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/rent-summary", requireRole("Tenant"), async (req, res) => {
    try {
      // Mock data for tenant rent summary
      const summary = {
        upcomingRent: {
          amount: 2500,
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          unit: "Unit 402",
        },
        pastDueRent: null,
        recentPayments: [
          {
            id: "pmt-1",
            amount: 2500,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Paid",
          },
          {
            id: "pmt-2",
            amount: 2500,
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Paid",
          },
        ],
      };
      res.json(summary);
    } catch (error: any) {
      console.error("Rent summary error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/pay-rent", requireRole("Tenant"), async (req, res) => {
    try {
      // Mock rent payment
      res.json({ success: true, confirmationNumber: `PAY-${Date.now()}` });
    } catch (error: any) {
      console.error("Pay rent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/wallet", requireRole("Tenant"), async (req, res) => {
    try {
      const walletData = {
        balance: 5000,
        yieldOptIn: true,
        yieldBalance: 5000,
        currentYield: 5.1,
      };
      res.json(walletData);
    } catch (error: any) {
      console.error("Wallet error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/deposit", requireRole("Tenant"), async (req, res) => {
    try {
      const { amount } = req.body;
      res.json({ success: true, amount });
    } catch (error: any) {
      console.error("Deposit error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/withdraw", requireRole("Tenant"), async (req, res) => {
    try {
      const { amount } = req.body;
      res.json({ success: true, amount });
    } catch (error: any) {
      console.error("Withdraw error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/wallet/yield-opt-in", requireRole("Tenant"), async (req, res) => {
    try {
      const { optIn } = req.body;
      res.json({ success: true, optIn });
    } catch (error: any) {
      console.error("Yield opt-in error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/reports", requireRole("Tenant"), async (req, res) => {
    try {
      const reports = {
        receipts: [
          {
            id: "rec-1",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 2500,
            unit: "Unit 402",
            paymentMethod: "ACH",
            confirmationNumber: "CONF-12345",
          },
          {
            id: "rec-2",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 2500,
            unit: "Unit 402",
            paymentMethod: "Debit Card",
            confirmationNumber: "CONF-12346",
          },
        ],
        yearToDateTotal: 30000,
        yearToDatePayments: 12,
      };
      res.json(reports);
    } catch (error: any) {
      console.error("Reports error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/settings", requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      const settings = {
        email: user?.email || "",
        phone: "",
        unit: "Unit 402",
        leaseEndDate: "December 31, 2025",
        paymentMethods: [
          {
            id: "pm-1",
            method: "Bank Account",
            lastFourDigits: "4242",
            isDefault: true,
          },
        ],
      };
      res.json(settings);
    } catch (error: any) {
      console.error("Settings error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/settings/profile", requireRole("Tenant"), async (req, res) => {
    try {
      const { email, phone } = req.body;
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/settings/payment-method", requireRole("Tenant"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      console.error("Add payment method error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/agent", requireRole("Tenant"), async (req, res) => {
    try {
      const { prompt } = req.body;

      const stream = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant for a property management tenant portal. Help users with questions about rent payments, account settings, and general inquiries. Be concise and friendly."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(content);
        }
      }

      res.end();
    } catch (error: any) {
      console.error("Tenant agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Crypto Wallet Routes (Business) ============
  app.get("/api/crypto/wallets", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      
      // Get wallets from database
      const wallets = await storage.getCryptoWallets(orgId);
      
      // Format for frontend
      const formattedWallets = wallets.map(w => ({
        coin: w.coin,
        balance: parseFloat(w.balance),
        usdValue: parseFloat(w.balance), // 1:1 for stablecoins
        depositAddress: w.depositAddress || "",
        price: 1.00,
      }));
      
      const totalUsdValue = formattedWallets.reduce((sum, w) => sum + w.usdValue, 0);
      
      res.json({ wallets: formattedWallets, totalUsdValue });
    } catch (error: any) {
      console.error("Crypto wallets error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crypto/convert", requireAuth, async (req, res) => {
    try {
      const { fromCoin, toCoin, amount } = req.body;
      const orgId = req.organizationId!;
      
      // Perform real conversion using storage
      const result = await storage.convertCrypto({
        organizationId: orgId,
        fromCoin,
        toCoin,
        amount: amount.toString(),
        exchangeRate: "1.0", // 1:1 for stablecoins
      });
      
      // Return the gross converted amount (before fees) to match frontend contract
      const convertedAmount = amount * 1.0; // 1:1 exchange rate for stablecoins
      const fee = amount * 0.001; // 0.1% fee
      
      res.json({
        success: true,
        fromCoin,
        toCoin,
        fromAmount: amount,
        toAmount: convertedAmount, // Gross amount before fees
        exchangeRate: 1.0,
        fee,
        txHash: result.transaction.txHash,
      });
    } catch (error: any) {
      console.error("Crypto convert error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crypto/to-usd", requireAuth, async (req, res) => {
    try {
      const { coin, amount } = req.body;
      const orgId = req.organizationId!;
      
      const fee = amount * 0.002; // 0.2% fee
      
      // Perform real USD conversion using storage
      const result = await storage.convertToUsd({
        organizationId: orgId,
        coin,
        amount: amount.toString(),
        exchangeRate: "1.0",
        fee: fee.toString(),
      });
      
      res.json({
        success: true,
        coin,
        cryptoAmount: amount,
        usdAmount: amount - fee,
        exchangeRate: 1.0,
        fee,
      });
    } catch (error: any) {
      console.error("Crypto to USD error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto/transactions", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      
      // Get real transaction history from database
      const transactions = await storage.getCryptoTransactions(orgId);
      
      // Format for frontend
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        coin: tx.fromCoin,
        fromCoin: tx.fromCoin,
        toCoin: tx.toCoin,
        amount: parseFloat(tx.amount),
        usdValue: parseFloat(tx.usdValue || "0"),
        status: tx.status,
        txHash: tx.txHash || "",
        createdAt: tx.createdAt.toISOString(),
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Crypto transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Crypto Treasury Routes - Automated stablecoin orchestration
  app.get("/api/crypto-treasury/positions", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const positions = await storage.getCryptoTreasuryPositions(orgId);
      res.json({ positions });
    } catch (error: any) {
      console.error("Get crypto treasury positions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto-treasury/deployments", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const status = req.query.status as string | undefined;
      const coin = req.query.coin as string | undefined;
      
      const deployments = await storage.getCryptoTreasuryDeployments(orgId, { status, coin });
      res.json({ deployments });
    } catch (error: any) {
      console.error("Get crypto treasury deployments error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/crypto-treasury/flows", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const flowType = req.query.flowType as string | undefined;
      const coin = req.query.coin as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const flows = await storage.getCryptoTreasuryFlows(orgId, { flowType, coin, limit });
      res.json({ flows });
    } catch (error: any) {
      console.error("Get crypto treasury flows error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Crypto Wallet Routes (Tenant) ============
  app.get("/api/tenant/crypto/wallets", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Get tenant wallets from database
      const wallets = await storage.getCryptoWallets(orgId, tenantId);
      
      // Format for frontend
      const formattedWallets = wallets.map(w => ({
        coin: w.coin,
        balance: parseFloat(w.balance),
        usdValue: parseFloat(w.balance), // 1:1 for stablecoins
        depositAddress: w.depositAddress || "",
        price: 1.00,
      }));
      
      const totalUsdValue = formattedWallets.reduce((sum, w) => sum + w.usdValue, 0);
      
      res.json({ wallets: formattedWallets, totalUsdValue });
    } catch (error: any) {
      console.error("Tenant crypto wallets error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/crypto/convert", requireRole("Tenant"), async (req, res) => {
    try {
      const { fromCoin, toCoin, amount } = req.body;
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Perform real conversion using storage
      const result = await storage.convertCrypto({
        organizationId: orgId,
        tenantId,
        fromCoin,
        toCoin,
        amount: amount.toString(),
        exchangeRate: "1.0",
      });
      
      // Return the gross converted amount (before fees) to match frontend contract
      const convertedAmount = amount * 1.0; // 1:1 exchange rate for stablecoins
      const fee = amount * 0.001; // 0.1% fee
      
      res.json({
        success: true,
        fromCoin,
        toCoin,
        fromAmount: amount,
        toAmount: convertedAmount, // Gross amount before fees
        exchangeRate: 1.0,
        fee,
        txHash: result.transaction.txHash,
      });
    } catch (error: any) {
      console.error("Tenant crypto convert error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/crypto/transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      // Get tenant ID from user record
      const user = await storage.getUser(req.userId!);
      const tenantId = user!.tenantId!;
      
      // Get real transaction history from database
      const transactions = await storage.getCryptoTransactions(orgId, tenantId);
      
      // Format for frontend
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        coin: tx.fromCoin,
        fromCoin: tx.fromCoin,
        toCoin: tx.toCoin,
        amount: parseFloat(tx.amount),
        usdValue: parseFloat(tx.usdValue || "0"),
        status: tx.status,
        txHash: tx.txHash || "",
        createdAt: tx.createdAt.toISOString(),
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Tenant crypto transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Merchant Transaction Routes ============
  // Get all merchants for tenant's organization
  app.get("/api/tenant/merchants", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const merchants = await storage.getMerchants(orgId);
      
      // Format for frontend
      const formattedMerchants = merchants.map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        description: m.description,
        settlementDays: m.settlementDays,
        yieldRate: parseFloat(m.yieldRate),
        active: m.active,
      }));
      
      res.json({ merchants: formattedMerchants });
    } catch (error: any) {
      console.error("Get merchants error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get merchant transaction history for tenant
  app.get("/api/tenant/merchant-transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.userId!;
      const status = req.query.status as string | undefined;
      
      // Find user to get email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Find tenant by email
      const tenant = await storage.getTenantByEmail(user.email);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant profile not found" });
      }
      
      const transactions = await storage.getMerchantTransactions(
        tenant.id,
        status ? { status } : undefined
      );
      
      // Storage layer already converted decimals to numbers - pass through directly
      const formattedTransactions = transactions.map(tx => ({
        id: tx.id,
        merchantId: tx.merchantId,
        merchantName: tx.merchantName,
        amount: tx.amount,
        transactionDate: tx.transactionDate.toISOString(),
        settlementDate: tx.settlementDate.toISOString(),
        status: tx.status,
        settledAt: tx.settledAt?.toISOString() || null,
        settlementDays: tx.settlementDays,
        yieldRate: tx.yieldRate,
        yieldGenerated: tx.yieldGenerated,
        propertyYieldShare: tx.propertyYieldShare,
        tenantYieldShare: tx.tenantYieldShare,
        platformYieldShare: tx.platformYieldShare,
        description: tx.description,
      }));
      
      res.json({ transactions: formattedTransactions });
    } catch (error: any) {
      console.error("Get merchant transactions error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create new merchant transaction (tenant makes purchase)
  app.post("/api/tenant/merchant-transactions", requireRole("Tenant"), async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const userId = req.userId!;
      const { merchantId, amount, description } = req.body;
      
      // Find user to get email
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Find tenant by email
      const tenant = await storage.getTenantByEmail(user.email);
      if (!tenant) {
        return res.status(404).json({ error: "Tenant profile not found" });
      }
      
      // Validate input
      if (!merchantId || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid merchant transaction data" });
      }
      
      // Create transaction with yield splits (demo values: 90% property / 10% platform)
      const propertyYieldShare = (amount * 0.009).toFixed(2); // 0.9% to property owner
      const platformYieldShare = (amount * 0.001).toFixed(2); // 0.1% to platform
      
      const transaction = await storage.createMerchantTransaction({
        merchantId,
        tenantId: tenant.id,
        organizationId: orgId,
        amount: amount.toString(),
        description: description || null,
        propertyYieldShare,
        platformYieldShare,
      }, userId);
      
      res.json({ 
        transaction: {
          id: transaction.id,
          merchantId: transaction.merchantId,
          amount: parseFloat(transaction.amount),
          transactionDate: transaction.transactionDate.toISOString(),
          settlementDate: transaction.settlementDate.toISOString(),
          status: transaction.status,
          settlementDays: transaction.settlementDays,
          yieldGenerated: parseFloat(transaction.yieldGenerated),
          tenantYieldShare: transaction.tenantYieldShare ? parseFloat(transaction.tenantYieldShare) : 0,
        },
        message: "Merchant transaction created - yield generation in progress!",
      });
    } catch (error: any) {
      console.error("Create merchant transaction error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Vendor Instant Payment Routes ============
  // Get all vendors for organization
  app.get("/api/vendors", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const vendors = await storage.getVendors(orgId);
      res.json({ vendors });
    } catch (error: any) {
      console.error("Get vendors error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get vendor invoices (with optional status filter)
  app.get("/api/vendor-invoices", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId!;
      const status = req.query.status as string | undefined;
      
      const invoices = await storage.getVendorInvoices(orgId, status ? { status } : undefined);
      
      res.json({ invoices });
    } catch (error: any) {
      console.error("Get vendor invoices error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Pay vendor invoice instantly (showcases yield amplification!)
  app.post("/api/vendor-invoices/:id/pay-instant", requireAuth, async (req, res) => {
    try {
      const invoiceId = req.params.id;
      
      // Process instant payment (calculates yield based on float duration)
      const updatedInvoice = await storage.payVendorInstant(invoiceId);
      
      res.json({ 
        invoice: updatedInvoice,
        message: "Vendor paid instantly - yield generation locked in!",
      });
    } catch (error: any) {
      console.error("Pay vendor instant error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // ============ Admin Routes ============
  // Only Admin can reset demo
  app.post("/api/admin/reset", requireRole("Admin"), async (req, res) => {
    try {
      await seedDatabase();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Reset error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pms/sync", requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      // Mock: In production, would sync with PMS API
      res.json({ success: true });
    } catch (error: any) {
      console.error("PMS sync error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rent Stability & Ownership Routes ============
  app.get("/api/rent-stability", requireAuth, requireRole("PropertyManager", "Admin", "CFO", "Analyst"), async (req, res) => {
    try {
      // Mocked for demo; in production, this would query prediction models
      res.json({
        volatility: 1.8,
        delinquencyReduction: 14.2,
        ownershipReadyUnits: 38,
        paymentProbability: 0.94
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/readiness", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const user = req.user as any;
      const tenantId = user?.tenantId;
      if (!tenantId) return res.status(404).json({ error: "Tenant record not found" });
      
      const tenant = await storage.getTenant(tenantId);
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Neuromorphic Intelligence Layer ============

  app.get("/api/intelligence/portfolio", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        neuralActivityLevel: 0.78,
        spikeFrequency: 142,
        temporalMemoryDepth: 90,
        portfolioStabilityScore: 82.4,
        portfolioStabilityTrend: "improving",
        activeInflectionPoints: 3,
        modelConfidence: 0.91,
        lastModelUpdate: new Date().toISOString(),
        spikeTrainData: [
          { time: "00:00", rentSpikes: 12, vendorSpikes: 4, p2pSpikes: 2, volatility: 0.15 },
          { time: "04:00", rentSpikes: 3, vendorSpikes: 1, p2pSpikes: 0, volatility: 0.08 },
          { time: "08:00", rentSpikes: 28, vendorSpikes: 8, p2pSpikes: 5, volatility: 0.32 },
          { time: "12:00", rentSpikes: 45, vendorSpikes: 15, p2pSpikes: 8, volatility: 0.52 },
          { time: "16:00", rentSpikes: 38, vendorSpikes: 12, p2pSpikes: 6, volatility: 0.41 },
          { time: "20:00", rentSpikes: 22, vendorSpikes: 6, p2pSpikes: 3, volatility: 0.25 },
        ],
        temporalMemoryDecay: [
          { daysAgo: 0, memoryStrength: 1.0, signalWeight: 0.95 },
          { daysAgo: 7, memoryStrength: 0.92, signalWeight: 0.88 },
          { daysAgo: 14, memoryStrength: 0.78, signalWeight: 0.72 },
          { daysAgo: 30, memoryStrength: 0.55, signalWeight: 0.48 },
          { daysAgo: 60, memoryStrength: 0.30, signalWeight: 0.22 },
          { daysAgo: 90, memoryStrength: 0.12, signalWeight: 0.08 },
        ],
        propertyScores: [
          { property: "Sunset Towers", stabilityScore: 94, refinanceIndex: 88, spikeRate: 0.12, trend: "stable", units: 120, riskLevel: "low" },
          { property: "Maple Gardens", stabilityScore: 76, refinanceIndex: 62, spikeRate: 0.28, trend: "declining", units: 85, riskLevel: "medium" },
          { property: "Riverdale Apts", stabilityScore: 58, refinanceIndex: 45, spikeRate: 0.45, trend: "volatile", units: 64, riskLevel: "high" },
          { property: "Oak Ridge", stabilityScore: 96, refinanceIndex: 91, spikeRate: 0.09, trend: "stable", units: 200, riskLevel: "low" },
          { property: "Pine Valley", stabilityScore: 42, refinanceIndex: 28, spikeRate: 0.62, trend: "critical", units: 42, riskLevel: "critical" },
          { property: "Harbor View", stabilityScore: 88, refinanceIndex: 82, spikeRate: 0.15, trend: "improving", units: 156, riskLevel: "low" },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/tenant-scores", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        tenantScores: [
          { id: "t1", name: "Maria G.", unit: "Sunset #412", stabilityScore: 95, paymentPattern: "consistent", spikeEvents: 1, streakMonths: 24, tierMigration: "2→3", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 98 }, { factor: "Engagement Level", weight: 0.25, score: 92 }, { factor: "P2P Contributions", weight: 0.20, score: 88 }, { factor: "Tenure Duration", weight: 0.15, score: 96 }] },
          { id: "t2", name: "James W.", unit: "Oak #108", stabilityScore: 82, paymentPattern: "mostly_consistent", spikeEvents: 3, streakMonths: 18, tierMigration: "1→2", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 85 }, { factor: "Engagement Level", weight: 0.25, score: 78 }, { factor: "P2P Contributions", weight: 0.20, score: 72 }, { factor: "Tenure Duration", weight: 0.15, score: 88 }] },
          { id: "t3", name: "Sarah C.", unit: "Harbor #203", stabilityScore: 71, paymentPattern: "improving", spikeEvents: 5, streakMonths: 14, tierMigration: "1→2", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 74 }, { factor: "Engagement Level", weight: 0.25, score: 68 }, { factor: "P2P Contributions", weight: 0.20, score: 65 }, { factor: "Tenure Duration", weight: 0.15, score: 72 }] },
          { id: "t4", name: "David L.", unit: "Maple #305", stabilityScore: 54, paymentPattern: "irregular", spikeEvents: 12, streakMonths: 6, tierMigration: "0→1", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 48 }, { factor: "Engagement Level", weight: 0.25, score: 55 }, { factor: "P2P Contributions", weight: 0.20, score: 42 }, { factor: "Tenure Duration", weight: 0.15, score: 68 }] },
          { id: "t5", name: "Lisa R.", unit: "Sunset #201", stabilityScore: 38, paymentPattern: "declining", spikeEvents: 18, streakMonths: 2, tierMigration: "1→0", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 32 }, { factor: "Engagement Level", weight: 0.25, score: 40 }, { factor: "P2P Contributions", weight: 0.20, score: 28 }, { factor: "Tenure Duration", weight: 0.15, score: 55 }] },
          { id: "t6", name: "Kevin M.", unit: "Riverdale #102", stabilityScore: 22, paymentPattern: "critical", spikeEvents: 25, streakMonths: 0, tierMigration: "1→0", drivers: [{ factor: "Payment Consistency", weight: 0.40, score: 15 }, { factor: "Engagement Level", weight: 0.25, score: 22 }, { factor: "P2P Contributions", weight: 0.20, score: 18 }, { factor: "Tenure Duration", weight: 0.15, score: 35 }] },
        ],
        scoringModel: {
          version: "SNN-v2.4",
          lastTrained: "2026-02-04T08:00:00Z",
          accuracy: 0.934,
          factors: ["Payment Consistency (40%)", "Engagement Level (25%)", "P2P Contributions (20%)", "Tenure Duration (15%)"],
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/cohort-insights", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        insights: [
          { id: "ci1", type: "ownership_surge", severity: "high", title: "30% of Tier 2 tenants will qualify for FHA in 60 days", description: "19 tenants in Tier 2 are on trajectory to meet FHA eligibility criteria based on payment consistency, credit trajectory, and escrow accumulation patterns.", affectedCount: 19, totalCohort: 63, confidence: 0.87, timeframe: "60 days", actionable: true, suggestedAction: "Initiate pre-qualification outreach and schedule lender matching for high-readiness tenants" },
          { id: "ci2", type: "delinquency_risk", severity: "critical", title: "Pine Valley cluster: 8 tenants showing pre-delinquency spike pattern", description: "Temporal memory analysis detected a correlated behavioral shift in 8 tenants at Pine Valley. Pattern matches historical pre-delinquency signatures with 91% confidence.", affectedCount: 8, totalCohort: 42, confidence: 0.91, timeframe: "14 days", actionable: true, suggestedAction: "Deploy targeted incentive campaign ($15 early-pay bonus) and schedule proactive outreach" },
          { id: "ci3", type: "cashflow_shock", severity: "warning", title: "Vendor payout cluster may create $85K liquidity gap on March 15", description: "3 vendor Net60 invoices totaling $85K mature on the same date. Combined with rent cycle timing, this creates a predicted 2.1-day liquidity shortfall.", affectedCount: 3, totalCohort: 12, confidence: 0.82, timeframe: "37 days", actionable: true, suggestedAction: "Pre-position $90K in immediate reserve bucket or stagger vendor payouts by 5 days" },
          { id: "ci4", type: "incentive_roi", severity: "info", title: "Early Bird incentive showing 340% ROI in Sunset Towers cohort", description: "Tenants enrolled in the Early Bird Bonus program at Sunset Towers show 94.2% on-time rate vs 82.1% for non-enrolled. $4,250 in rewards generating $14,450 in improved collection timing.", affectedCount: 48, totalCohort: 120, confidence: 0.94, timeframe: "ongoing", actionable: false, suggestedAction: "Consider expanding program to Maple Gardens and Harbor View properties" },
          { id: "ci5", type: "stability_improvement", severity: "success", title: "Portfolio-wide stability score improved 6.2 points in 30 days", description: "Neural spike frequency has decreased 18% across the portfolio, indicating more predictable payment patterns. Primary driver: streak-based cashback program adoption up 22%.", affectedCount: 500, totalCohort: 500, confidence: 0.96, timeframe: "30 days", actionable: false, suggestedAction: "Maintain current incentive levels; monitor for regression in Q2" },
        ],
        cohortMigration: [
          { period: "Sep", tier0: 320, tier1: 120, tier2: 45, tier3: 15 },
          { period: "Oct", tier0: 305, tier1: 125, tier2: 50, tier3: 20 },
          { period: "Nov", tier0: 288, tier1: 130, tier2: 55, tier3: 27 },
          { period: "Dec", tier0: 275, tier1: 132, tier2: 60, tier3: 33 },
          { period: "Jan", tier0: 260, tier1: 135, tier2: 63, tier3: 42 },
          { period: "Feb", tier0: 248, tier1: 132, tier2: 68, tier3: 52 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/inflection-points", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        inflectionPoints: [
          { id: "ip1", type: "delinquency", direction: "negative", probability: 0.91, tenant: "Kevin M.", unit: "Riverdale #102", property: "Riverdale Apts", detectedAt: "2026-02-05T14:30:00Z", predictedDate: "2026-02-20T00:00:00Z", signalStrength: 0.94, spikeHistory: [0.1, 0.15, 0.22, 0.35, 0.48, 0.62, 0.78, 0.91], neuralDrivers: ["3 consecutive late payments (>10d)", "Engagement drop-off: no portal login in 21 days", "P2P contribution stopped 45 days ago"] },
          { id: "ip2", type: "delinquency", direction: "negative", probability: 0.78, tenant: "Lisa R.", unit: "Sunset #201", property: "Sunset Towers", detectedAt: "2026-02-04T09:15:00Z", predictedDate: "2026-02-25T00:00:00Z", signalStrength: 0.82, spikeHistory: [0.05, 0.08, 0.12, 0.18, 0.28, 0.42, 0.58, 0.78], neuralDrivers: ["Payment amount decreasing (partial payments last 2 months)", "Tier migration regressing: 1→0", "Response to nudges declining"] },
          { id: "ip3", type: "ownership_ready", direction: "positive", probability: 0.92, tenant: "Maria G.", unit: "Sunset #412", property: "Sunset Towers", detectedAt: "2026-02-03T11:00:00Z", predictedDate: "2026-03-15T00:00:00Z", signalStrength: 0.96, spikeHistory: [0.45, 0.52, 0.58, 0.65, 0.72, 0.80, 0.88, 0.92], neuralDrivers: ["24-month perfect payment streak", "Credit score trajectory: 680→710 in 6 months", "Escrow accumulation rate accelerating (+12% MoM)"] },
          { id: "ip4", type: "cashflow_shock", direction: "negative", probability: 0.82, tenant: null, unit: null, property: "Portfolio-wide", detectedAt: "2026-02-04T16:00:00Z", predictedDate: "2026-03-15T00:00:00Z", signalStrength: 0.85, spikeHistory: [0.10, 0.12, 0.18, 0.25, 0.38, 0.52, 0.68, 0.82], neuralDrivers: ["3 vendor invoices ($85K total) maturing same date", "Rent cycle trough coincides with vendor payout peak", "Reserve bucket at 72% of recommended level"] },
          { id: "ip5", type: "stability_shift", direction: "positive", probability: 0.88, tenant: "James W.", unit: "Oak #108", property: "Oak Ridge", detectedAt: "2026-02-05T08:45:00Z", predictedDate: "2026-04-01T00:00:00Z", signalStrength: 0.90, spikeHistory: [0.30, 0.38, 0.45, 0.52, 0.60, 0.72, 0.82, 0.88], neuralDrivers: ["Payment timing improving: avg 8d early → 12d early", "Active P2P contributor (3 roommate splits/mo)", "Tier migration trajectory: approaching Tier 3 threshold"] },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/intelligence/noi-forecast", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({
        forecast: [
          { month: "Mar", baseline: 245000, optimistic: 258000, pessimistic: 228000, neural: 252000 },
          { month: "Apr", baseline: 248000, optimistic: 265000, pessimistic: 230000, neural: 256000 },
          { month: "May", baseline: 250000, optimistic: 270000, pessimistic: 225000, neural: 261000 },
          { month: "Jun", baseline: 252000, optimistic: 275000, pessimistic: 222000, neural: 264000 },
          { month: "Jul", baseline: 255000, optimistic: 280000, pessimistic: 220000, neural: 268000 },
          { month: "Aug", baseline: 258000, optimistic: 285000, pessimistic: 218000, neural: 272000 },
        ],
        currentNOI: 242000,
        projectedNOI: 268000,
        noiForecastChange: 10.7,
        incentiveImpact: {
          currentSpend: 8500,
          projectedReturn: 34200,
          roi: 302,
          optimalSpend: 11200,
          optimalReturn: 48500,
          optimalRoi: 333,
        },
        refinanceTiming: {
          optimalWindow: "Q3 2026",
          currentDSCR: 1.42,
          projectedDSCR: 1.58,
          currentLTV: 0.68,
          projectedLTV: 0.64,
          readyProperties: 3,
          totalProperties: 6,
          recommendation: "3 of 6 properties meet refinance criteria. Neural model projects optimal window in Q3 2026 when DSCR reaches 1.58 and portfolio stability exceeds 85.",
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Cash Flow Forecasting ============
  app.get("/api/forecast", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const today = new Date();
      const generateDailyForecast = (days: number) => {
        const data = [];
        let cumulativeInflow = 0;
        let cumulativeOutflow = 0;
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dayOfMonth = date.getDate();
          const isRentDay = dayOfMonth <= 5;
          const isPayrollDay = dayOfMonth === 15 || dayOfMonth === 30;
          const isVendorDay = dayOfMonth === 10 || dayOfMonth === 20;
          const baseRent = isRentDay ? 85000 + Math.sin(i * 0.3) * 12000 : 2000 + Math.sin(i * 0.5) * 1500;
          const vendorPayout = isVendorDay ? 28000 + Math.sin(i * 0.4) * 8000 : 3500 + Math.sin(i * 0.2) * 1200;
          const payroll = isPayrollDay ? 42000 : 0;
          const maintenance = 1200 + Math.sin(i * 0.7) * 800;
          const insurance = dayOfMonth === 1 ? 8500 : 0;
          const inflow = Math.round(baseRent + Math.random() * 3000);
          const outflow = Math.round(vendorPayout + payroll + maintenance + insurance);
          cumulativeInflow += inflow;
          cumulativeOutflow += outflow;
          data.push({
            date: date.toISOString().split("T")[0],
            dayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
            inflow,
            outflow,
            netCashFlow: inflow - outflow,
            cumulativeNet: cumulativeInflow - cumulativeOutflow,
            rentCollected: isRentDay ? inflow * 0.85 : inflow * 0.3,
            vendorPayments: vendorPayout,
            confidence: Math.max(0.6, 1 - i * 0.004),
          });
        }
        return data;
      };
      const daily = generateDailyForecast(90);
      const weekly = [];
      for (let w = 0; w < 13; w++) {
        const weekSlice = daily.slice(w * 7, (w + 1) * 7);
        if (weekSlice.length === 0) break;
        weekly.push({
          week: `W${w + 1}`,
          startDate: weekSlice[0].date,
          inflow: weekSlice.reduce((s, d) => s + d.inflow, 0),
          outflow: weekSlice.reduce((s, d) => s + d.outflow, 0),
          netCashFlow: weekSlice.reduce((s, d) => s + d.netCashFlow, 0),
          avgConfidence: weekSlice.reduce((s, d) => s + d.confidence, 0) / weekSlice.length,
        });
      }
      res.json({
        daily,
        weekly,
        summary: {
          totalProjectedInflow: daily.reduce((s, d) => s + d.inflow, 0),
          totalProjectedOutflow: daily.reduce((s, d) => s + d.outflow, 0),
          netCashPosition: daily.reduce((s, d) => s + d.netCashFlow, 0),
          avgDailyInflow: Math.round(daily.reduce((s, d) => s + d.inflow, 0) / 90),
          avgDailyOutflow: Math.round(daily.reduce((s, d) => s + d.outflow, 0) / 90),
          liquidityRiskDays: daily.filter(d => d.netCashFlow < -20000).length,
          peakInflowDay: daily.reduce((max, d) => d.inflow > max.inflow ? d : max, daily[0]).date,
          lowestCashDay: daily.reduce((min, d) => d.cumulativeNet < min.cumulativeNet ? d : min, daily[0]).date,
        },
        scenarios: [
          { name: "Baseline", description: "Current collection rates and vendor terms maintained", probability: 0.65, noi90Day: 742000, cashReserve: 185000, delinquencyRate: 4.2 },
          { name: "Optimistic", description: "Incentive programs improve on-time rate by 8%", probability: 0.20, noi90Day: 812000, cashReserve: 225000, delinquencyRate: 2.8 },
          { name: "Stress", description: "Economic downturn increases delinquency by 40%", probability: 0.15, noi90Day: 628000, cashReserve: 95000, delinquencyRate: 7.1 },
        ],
        assumptions: {
          occupancyRate: 94.5,
          avgRent: 1525,
          onTimeRate: 87.3,
          vendorTerms: "Net45 avg",
          maintenanceReserve: 2.5,
          yieldOnFloat: 4.2,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Enhanced Collections ============
  app.get("/api/collections/enhanced", requireAuth, requireRole("Admin", "PropertyManager", "CFO"), async (req, res) => {
    try {
      res.json({
        summary: {
          totalOutstanding: 187450,
          totalTenants: 42,
          atRiskCount: 8,
          avgDaysPastDue: 12.4,
          collectionRate: 87.3,
          collectionRateChange: 2.1,
          totalCollectedMTD: 425000,
          projectedCollection: 485000,
        },
        aging: [
          { bucket: "Current", count: 285, amount: 425000, percentage: 68.2 },
          { bucket: "1-30 Days", count: 45, amount: 67500, percentage: 10.8 },
          { bucket: "31-60 Days", count: 22, amount: 44000, percentage: 7.1 },
          { bucket: "61-90 Days", count: 12, amount: 30000, percentage: 4.8 },
          { bucket: "90+ Days", count: 8, amount: 45950, percentage: 7.4 },
          { bucket: "Collections", count: 3, amount: 10500, percentage: 1.7 },
        ],
        tenants: [
          { id: "c1", name: "Kevin M.", unit: "Riverdale #102", property: "Riverdale Apts", amountDue: 3200, dueDate: "2026-01-01", daysPastDue: 37, status: "overdue", riskScore: 92, riskLevel: "critical", lastPayment: "2025-12-15", paymentHistory: "irregular", contactAttempts: 4, lastContacted: "2026-02-03", nudgeSent: true, paylinkSent: true, hasPlan: false },
          { id: "c2", name: "Lisa R.", unit: "Sunset #201", property: "Sunset Towers", amountDue: 1500, dueDate: "2026-01-15", daysPastDue: 23, status: "overdue", riskScore: 78, riskLevel: "high", lastPayment: "2025-12-28", paymentHistory: "declining", contactAttempts: 2, lastContacted: "2026-02-01", nudgeSent: true, paylinkSent: false, hasPlan: false },
          { id: "c3", name: "David L.", unit: "Maple #305", property: "Maple Gardens", amountDue: 800, dueDate: "2026-02-01", daysPastDue: 6, status: "overdue", riskScore: 54, riskLevel: "medium", lastPayment: "2026-01-02", paymentHistory: "irregular", contactAttempts: 1, lastContacted: "2026-02-05", nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c4", name: "Tom H.", unit: "Oak #215", property: "Oak Ridge", amountDue: 1525, dueDate: "2026-02-01", daysPastDue: 6, status: "overdue", riskScore: 45, riskLevel: "medium", lastPayment: "2026-01-04", paymentHistory: "mostly_consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c5", name: "Anna P.", unit: "Pine #108", property: "Pine Valley", amountDue: 4800, dueDate: "2025-12-01", daysPastDue: 68, status: "overdue", riskScore: 95, riskLevel: "critical", lastPayment: "2025-11-01", paymentHistory: "critical", contactAttempts: 6, lastContacted: "2026-02-06", nudgeSent: true, paylinkSent: true, hasPlan: true },
          { id: "c6", name: "Mike B.", unit: "Harbor #410", property: "Harbor View", amountDue: 750, dueDate: "2026-02-01", daysPastDue: 6, status: "partial", riskScore: 32, riskLevel: "low", lastPayment: "2026-02-01", paymentHistory: "consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c7", name: "Rachel K.", unit: "Sunset #505", property: "Sunset Towers", amountDue: 1525, dueDate: "2026-02-05", daysPastDue: 2, status: "pending", riskScore: 18, riskLevel: "low", lastPayment: "2026-01-03", paymentHistory: "consistent", contactAttempts: 0, lastContacted: null, nudgeSent: false, paylinkSent: false, hasPlan: false },
          { id: "c8", name: "Chris D.", unit: "Maple #112", property: "Maple Gardens", amountDue: 2400, dueDate: "2025-12-15", daysPastDue: 53, status: "overdue", riskScore: 88, riskLevel: "high", lastPayment: "2025-11-20", paymentHistory: "declining", contactAttempts: 3, lastContacted: "2026-01-28", nudgeSent: true, paylinkSent: true, hasPlan: false },
        ],
        trendData: [
          { month: "Sep", collected: 392000, outstanding: 108000, rate: 78.4 },
          { month: "Oct", collected: 405000, outstanding: 95000, rate: 81.0 },
          { month: "Nov", collected: 418000, outstanding: 82000, rate: 83.6 },
          { month: "Dec", collected: 412000, outstanding: 88000, rate: 82.4 },
          { month: "Jan", collected: 425000, outstanding: 75000, rate: 85.0 },
          { month: "Feb", collected: 436000, outstanding: 64000, rate: 87.2 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Financial Hub ============
  app.get("/api/tenant/financial-hub", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      res.json({ status: "ok" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Tenant Payment Calendar ============
  app.get("/api/tenant/payment-calendar", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const today = new Date();
      const events = [];
      for (let m = -1; m <= 3; m++) {
        const rentDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
        const isPast = rentDate < today;
        events.push({
          id: `rent-${m}`,
          type: "rent",
          title: "Monthly Rent",
          amount: 1525,
          date: rentDate.toISOString().split("T")[0],
          status: isPast ? "paid" : m === 0 ? "due_soon" : "upcoming",
          autopay: true,
          paymentMethod: "ACH - Chase ****4521",
        });
        if (m >= 0) {
          events.push({
            id: `cashback-${m}`,
            type: "cashback",
            title: "On-Time Cashback",
            amount: 3.50,
            date: new Date(today.getFullYear(), today.getMonth() + m, 5).toISOString().split("T")[0],
            status: isPast ? "credited" : "projected",
            autopay: false,
            paymentMethod: null,
          });
        }
      }
      events.push({
        id: "split-1",
        type: "split",
        title: "Rent Split - Alex M.",
        amount: 762.50,
        date: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0],
        status: "received",
        autopay: false,
        paymentMethod: "P2P Transfer",
      });
      res.json({
        events,
        autopaySettings: {
          enabled: true,
          paymentMethod: "ACH - Chase ****4521",
          scheduledDay: 1,
          amount: 1525,
          nextPayment: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split("T")[0],
        },
        upcomingTotal: 1525,
        streakMonths: 8,
        projectedCashback: 42.00,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Toggle Autopay ============
  app.post("/api/tenant/autopay", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const { enabled } = req.body;
      res.json({ success: true, autopayEnabled: enabled, message: enabled ? "Autopay enabled successfully" : "Autopay disabled" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ AI Analytics (Business Console) ============
  app.post("/api/ai-analytics", requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("AI Analytics request:", prompt.substring(0, 100));

    try {
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Naltos AI Analytics, an NLP-powered business intelligence engine for multifamily real estate property management. You provide data-driven analytical insights to property owners, managers, CFOs, and analysts.

Your role:
- Analyze portfolio performance, collections, revenue, treasury, vendor payments, and behavioral incentives
- Provide structured, quantitative insights with specific numbers, percentages, and comparisons
- Make actionable recommendations backed by data patterns
- Use professional financial language appropriate for real estate executives
- Reference realistic multifamily industry benchmarks when relevant

Response format guidelines:
- Use clear headers and sections for complex analyses
- Include specific metrics and KPIs (On-Time %, DSO, NOI, yield rates, occupancy, etc.)
- Provide trend indicators (increasing/decreasing/stable) with percentage changes
- When comparing properties or time periods, use structured comparisons
- End with 2-3 actionable recommendations when appropriate
- Keep responses concise but comprehensive (aim for 200-400 words)

For demo purposes, reference realistic but fictional portfolio data. The platform manages multiple multifamily properties with hundreds of units, generates yield from rent float and vendor payment float, and uses behavioral incentives (cashback, credit building) to improve on-time payment rates. Treasury products include NRF (tokenized T-Bills), NRK (money market), and NRC (delta-neutral credit). All user-facing values are in USD.`
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader("Cache-Control", "no-cache");

      let totalContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          totalContent += content;
          res.write(content);
        }
      }

      console.log("AI Analytics response length:", totalContent.length);
      res.end();
    } catch (error: any) {
      console.error("AI Analytics error:", error?.message || error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to generate analytics response" });
      } else {
        res.end();
      }
    }
  });

  // ============ P2P Transfers ============
  app.get("/api/tenant/p2p", requireRole("Tenant"), async (req, res) => {
    try {
      const now = new Date();
      const p2pData = {
        balance: 5000,
        monthlyVolume: 1240,
        totalSent: 3850,
        totalReceived: 2610,
        activeRequests: 2,
        contacts: [
          { id: "c1", name: "Sarah Chen", unit: "Unit 403", avatar: "SC", isFavorite: true },
          { id: "c2", name: "Marcus Johnson", unit: "Unit 410", avatar: "MJ", isFavorite: true },
          { id: "c3", name: "Emily Rivera", unit: "Unit 318", avatar: "ER", isFavorite: false },
          { id: "c4", name: "David Kim", unit: "Unit 502", avatar: "DK", isFavorite: false },
          { id: "c5", name: "Lisa Patel", unit: "Unit 215", avatar: "LP", isFavorite: false },
          { id: "c6", name: "James Wu", unit: "Unit 607", avatar: "JW", isFavorite: false },
        ],
        recentTransactions: [
          { id: "tx1", type: "sent", counterparty: "Sarah Chen", counterpartyUnit: "Unit 403", amount: 45.00, description: "Groceries split", status: "completed", date: new Date(now.getTime() - 2 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.005 },
          { id: "tx2", type: "received", counterparty: "Marcus Johnson", counterpartyUnit: "Unit 410", amount: 120.00, description: "Utilities share", status: "completed", date: new Date(now.getTime() - 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.012 },
          { id: "tx3", type: "split", counterparty: "Emily Rivera", counterpartyUnit: "Unit 318", amount: 32.50, description: "Takeout order", status: "completed", date: new Date(now.getTime() - 3 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.003 },
          { id: "tx4", type: "requested", counterparty: "David Kim", counterpartyUnit: "Unit 502", amount: 75.00, description: "Parking fee split", status: "pending", date: new Date(now.getTime() - 4 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0 },
          { id: "tx5", type: "sent", counterparty: "Lisa Patel", counterpartyUnit: "Unit 215", amount: 200.00, description: "Furniture purchase share", status: "completed", date: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.021 },
          { id: "tx6", type: "received", counterparty: "James Wu", counterpartyUnit: "Unit 607", amount: 55.00, description: "Game night supplies", status: "completed", date: new Date(now.getTime() - 10 * 24 * 3600000).toISOString(), fee: 0, yieldGenerated: 0.006 },
        ],
        splitExpenses: [
          {
            id: "sp1",
            title: "Monthly Utilities (February)",
            totalAmount: 240.00,
            myShare: 80.00,
            participants: [
              { name: "You", share: 80.00, paid: true },
              { name: "Sarah Chen", share: 80.00, paid: true },
              { name: "Marcus Johnson", share: 80.00, paid: false },
            ],
            status: "active",
            createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
          },
          {
            id: "sp2",
            title: "Pizza Night",
            totalAmount: 65.00,
            myShare: 16.25,
            participants: [
              { name: "You", share: 16.25, paid: true },
              { name: "Emily Rivera", share: 16.25, paid: true },
              { name: "David Kim", share: 16.25, paid: true },
              { name: "Lisa Patel", share: 16.25, paid: true },
            ],
            status: "settled",
            createdAt: new Date(now.getTime() - 14 * 24 * 3600000).toISOString(),
          },
        ],
      };
      res.json(p2pData);
    } catch (error: any) {
      console.error("P2P data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/p2p/send", requireRole("Tenant"), async (req, res) => {
    try {
      const { contactId, amount, description } = req.body;
      res.json({ success: true, transactionId: `p2p-${Date.now()}`, amount, description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/p2p/request", requireRole("Tenant"), async (req, res) => {
    try {
      const { contactId, amount, description } = req.body;
      res.json({ success: true, requestId: `req-${Date.now()}`, amount, description });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Rental Insurance ============
  app.get("/api/tenant/rental-insurance", requireRole("Tenant"), async (req, res) => {
    try {
      const insuranceData = {
        activePlan: {
          id: "plan-standard",
          name: "Standard Coverage",
          monthlyPremium: 18,
          coverageAmount: 25000,
          deductible: 250,
          features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement"],
          popular: true,
          enrolled: true,
        },
        availablePlans: [
          {
            id: "plan-basic",
            name: "Basic Coverage",
            monthlyPremium: 9,
            coverageAmount: 10000,
            deductible: 500,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Lock Replacement"],
            popular: false,
            enrolled: false,
          },
          {
            id: "plan-standard",
            name: "Standard Coverage",
            monthlyPremium: 18,
            coverageAmount: 25000,
            deductible: 250,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement"],
            popular: true,
            enrolled: true,
          },
          {
            id: "plan-premium",
            name: "Premium Coverage",
            monthlyPremium: 29,
            coverageAmount: 50000,
            deductible: 100,
            features: ["Personal Property", "Liability Protection", "Water Damage", "Theft Coverage", "Temporary Housing", "Legal Defense", "Pet Damage", "Lock Replacement", "Electronics Coverage", "Identity Theft", "Earthquake", "Flood"],
            popular: false,
            enrolled: false,
          },
        ],
        claims: [
          { id: "clm-1", type: "Water Damage", description: "Pipe leak under kitchen sink caused water damage to flooring and cabinet", amount: 1850, status: "paid", submittedDate: "Dec 15, 2025", resolvedDate: "Dec 22, 2025", paidAmount: 1600 },
          { id: "clm-2", type: "Theft", description: "Package stolen from hallway — electronics valued at $420", amount: 420, status: "under_review", submittedDate: "Jan 28, 2026", resolvedDate: null, paidAmount: null },
        ],
        coveragePool: {
          totalPoolSize: 2450000,
          stablecoinBacking: [
            { coin: "USDC", amount: 1470000, pct: 60 },
            { coin: "USDT", amount: 612500, pct: 25 },
            { coin: "DAI", amount: 367500, pct: 15 },
          ],
          reserveRatio: 142,
          poolYield: 4.8,
          yourContribution: 324.00,
          yourYieldEarned: 12.85,
        },
        monthlyHistory: [
          { month: "Sep", premium: 18, poolValue: 2180000 },
          { month: "Oct", premium: 18, poolValue: 2240000 },
          { month: "Nov", premium: 18, poolValue: 2310000 },
          { month: "Dec", premium: 18, poolValue: 2360000 },
          { month: "Jan", premium: 18, poolValue: 2410000 },
          { month: "Feb", premium: 18, poolValue: 2450000 },
        ],
        stats: {
          totalPremiumsPaid: 324.00,
          totalClaimsPaid: 1600,
          coverageMonths: 18,
          yieldEarnedOnPremiums: 12.85,
        },
      };
      res.json(insuranceData);
    } catch (error: any) {
      console.error("Rental insurance data error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/rental-insurance/enroll", requireRole("Tenant"), async (req, res) => {
    try {
      const { planId } = req.body;
      res.json({ success: true, planId, message: "Enrolled successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/rental-insurance/claim", requireRole("Tenant"), async (req, res) => {
    try {
      const { type, amount, description } = req.body;
      res.json({ success: true, claimId: `clm-${Date.now()}`, type, amount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Activity Feed ============
  app.get("/api/activity", requireAuth, async (req, res) => {
    try {
      const userRole = req.session.userRole;
      const activities: any[] = [];
      const now = new Date();
      if (userRole === "Admin" || userRole === "PropertyManager" || userRole === "CFO" || userRole === "Analyst") {
        activities.push(
          { id: "a1", type: "payment", icon: "dollar", title: "Rent payment received", description: "Maria G. paid $1,525 for Sunset #412", timestamp: new Date(now.getTime() - 15 * 60000).toISOString(), read: false, severity: "success" },
          { id: "a2", type: "alert", icon: "alert", title: "Delinquency risk detected", description: "Kevin M. (Riverdale #102) flagged by neural model - 91% probability", timestamp: new Date(now.getTime() - 45 * 60000).toISOString(), read: false, severity: "critical" },
          { id: "a3", type: "incentive", icon: "award", title: "Incentive milestone reached", description: "Early Bird program hit 340% ROI at Sunset Towers", timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, severity: "info" },
          { id: "a4", type: "vendor", icon: "truck", title: "Vendor payment processed", description: "ABC Plumbing - $4,200 instant payment via ACH", timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "a5", type: "system", icon: "sync", title: "PMS sync completed", description: "AppFolio data synchronized - 12 new transactions imported", timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a6", type: "collection", icon: "mail", title: "Nudge sent automatically", description: "Automated reminder sent to David L. (Maple #305)", timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a7", type: "treasury", icon: "trending", title: "Float yield distributed", description: "$1,847.52 yield accrued from rent float - deposited to treasury", timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "a8", type: "ownership", icon: "home", title: "Tenant ownership milestone", description: "Maria G. reached FHA eligibility threshold - lender matching available", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "a9", type: "alert", icon: "alert", title: "Liquidity gap predicted", description: "$85K vendor payout cluster on March 15 may create 2.1-day shortfall", timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(), read: true, severity: "warning" },
          { id: "a10", type: "payment", icon: "dollar", title: "Bulk rent collection", description: "142 payments received totaling $216,550 - 94.5% on-time rate", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "success" }
        );
      } else if (userRole === "Tenant") {
        activities.push(
          { id: "t1", type: "payment", icon: "dollar", title: "Rent payment confirmed", description: "February rent of $1,525 processed successfully via ACH", timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "t2", type: "cashback", icon: "award", title: "Cashback earned", description: "$3.50 on-time payment cashback credited to your wallet", timestamp: new Date(now.getTime() - 3 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "t3", type: "streak", icon: "fire", title: "Payment streak milestone", description: "8-month on-time streak! Silver tier cashback unlocked ($3.50/mo)", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "t4", type: "split", icon: "users", title: "Rent split received", description: "Alex M. sent $762.50 for their share of February rent", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "success" },
          { id: "t5", type: "ownership", icon: "home", title: "Ownership readiness update", description: "Your credit trajectory looks great! Review your FHA eligibility status", timestamp: new Date(now.getTime() - 72 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "t6", type: "merchant", icon: "store", title: "Purchase cashback earned", description: "$0.45 yield earned from Local Grocery purchase ($22.50)", timestamp: new Date(now.getTime() - 96 * 3600000).toISOString(), read: true, severity: "success" }
        );
      } else if (userRole === "Vendor") {
        activities.push(
          { id: "v1", type: "payment", icon: "dollar", title: "Payment received", description: "$4,200 from Naltos Demo Properties - Invoice #INV-2024-047", timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "v2", type: "yield", icon: "trending", title: "Float yield accrued", description: "$12.85 yield earned on Net45 float balance", timestamp: new Date(now.getTime() - 6 * 3600000).toISOString(), read: false, severity: "info" },
          { id: "v3", type: "payout", icon: "bank", title: "ACH payout scheduled", description: "$8,500 scheduled for February 15 via ACH (Net30)", timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "v4", type: "invoice", icon: "file", title: "New invoice received", description: "Invoice #INV-2024-052 for $3,150 from Naltos Demo Properties", timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(), read: true, severity: "info" }
        );
      } else if (userRole === "Merchant") {
        activities.push(
          { id: "m1", type: "transaction", icon: "store", title: "Transaction processed", description: "$45.00 purchase from Tenant Maria G. - settlement in 2 days", timestamp: new Date(now.getTime() - 30 * 60000).toISOString(), read: false, severity: "success" },
          { id: "m2", type: "settlement", icon: "dollar", title: "Settlement completed", description: "$1,250.00 batch settlement deposited to your account", timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(), read: false, severity: "success" },
          { id: "m3", type: "yield", icon: "trending", title: "Settlement yield earned", description: "$2.15 yield from 2-day settlement float", timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(), read: true, severity: "info" },
          { id: "m4", type: "promotion", icon: "megaphone", title: "Promotion opportunity", description: "Offer 5% cashback to Naltos tenants and increase foot traffic", timestamp: new Date(now.getTime() - 36 * 3600000).toISOString(), read: true, severity: "info" }
        );
      }
      const unreadCount = activities.filter(a => !a.read).length;
      res.json({ activities, unreadCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Mark Activity Read ============
  app.post("/api/activity/read", requireAuth, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Vendor Statements ============
  app.get("/api/vendor/statements", requireVendor(storage), async (req, res) => {
    try {
      const statements = [];
      const today = new Date();
      for (let m = 0; m < 6; m++) {
        const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
        statements.push({
          id: `stmt-${m}`,
          period: monthName,
          date: date.toISOString().split("T")[0],
          invoiceCount: 3 + Math.floor(Math.random() * 4),
          totalAmount: 8500 + Math.floor(Math.random() * 6000),
          totalYield: 25 + Math.floor(Math.random() * 40),
          status: m === 0 ? "current" : "available",
        });
      }
      res.json({ statements });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Merchant Statements ============
  app.get("/api/merchant/statements", requireMerchant(storage), async (req, res) => {
    try {
      const statements = [];
      const today = new Date();
      for (let m = 0; m < 6; m++) {
        const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const monthName = date.toLocaleString("default", { month: "long", year: "numeric" });
        statements.push({
          id: `mstmt-${m}`,
          period: monthName,
          date: date.toISOString().split("T")[0],
          transactionCount: 25 + Math.floor(Math.random() * 30),
          totalVolume: 3200 + Math.floor(Math.random() * 2000),
          totalYield: 8 + Math.floor(Math.random() * 12),
          avgSettlementDays: 1.5 + Math.random() * 0.8,
          status: m === 0 ? "current" : "available",
        });
      }
      res.json({ statements });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/deposit-alternatives", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/rent-pricing", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/capital-access", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/credit-builder", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      res.json({
        currentScore: 712,
        scoreChange: 28,
        enrolledSince: "2025-03-15",
        bureaus: [
          { name: "Experian", status: "active", lastReported: "2026-02-01", scoreImpact: 28 },
          { name: "TransUnion", status: "active", lastReported: "2026-01-28", scoreImpact: 24 },
          { name: "Equifax", status: "pending", expectedStart: "2026-03-01", scoreImpact: null },
        ],
        scoreHistory: [
          { month: "May", score: 684 }, { month: "Jun", score: 688 }, { month: "Jul", score: 691 },
          { month: "Aug", score: 695 }, { month: "Sep", score: 698 }, { month: "Oct", score: 702 },
          { month: "Nov", score: 705 }, { month: "Dec", score: 708 }, { month: "Jan", score: 710 },
          { month: "Feb", score: 712 },
        ],
        paymentHistory: [
          { month: "February 2026", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "January 2026", amount: 1500, status: "On Time", reported: true, impact: 3 },
          { month: "December 2025", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "November 2025", amount: 1500, status: "On Time", reported: true, impact: 3 },
          { month: "October 2025", amount: 1500, status: "On Time", reported: true, impact: 2 },
          { month: "September 2025", amount: 1500, status: "On Time", reported: true, impact: 3 },
        ],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Property & Tenant Lookup (for Lease Wizard) ============

  app.get("/api/properties", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const props = await storage.getPropertiesByOrg(req.organizationId!);
      res.json(props);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/properties/:id/units", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const props = await storage.getPropertiesByOrg(req.organizationId!);
      const property = props.find(p => p.id === req.params.id);
      if (!property) return res.status(404).json({ error: "Property not found" });
      const unitList = await storage.getUnitsByProperty(req.params.id);
      res.json(unitList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenants", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const tenantList = await storage.getTenantsByOrg(req.organizationId!);
      res.json(tenantList);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Lease Agreement Orchestration ============

  app.post("/api/lease-agreements", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const {
        propertyId, propertyName, unitId, unitLabel, tenantName, tenantEmail, tenantId,
        monthlyRent, leaseTerm, startDate,
        securityDepositMultiplier = 1, lateFeePercent = 5, lateFeeGraceDays = 5,
        petPolicy = false, petDeposit = 0, parkingIncluded = false, parkingFee = 0,
        utilitiesIncluded = [], specialProvisions = "", isDraft = false,
      } = req.body;
      if (!propertyName || !unitLabel || !tenantName || !tenantEmail || !monthlyRent || !leaseTerm || !startDate) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const rent = Number(monthlyRent);
      const term = Number(leaseTerm);
      const securityDeposit = rent * Number(securityDepositMultiplier);
      const start = new Date(startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + term);
      const endDate = end.toISOString().split("T")[0];

      const petSection = petPolicy ? `\nPet Policy: Pets allowed with a $${petDeposit} pet deposit.` : "\nPet Policy: No pets allowed.";
      const parkingSection = parkingIncluded ? `\nParking: Included${parkingFee > 0 ? ` at $${parkingFee}/month` : " at no additional cost"}.` : "\nParking: Not included.";
      const utilitiesSection = utilitiesIncluded.length > 0 ? `\nUtilities Included: ${utilitiesIncluded.join(", ")}.` : "\nUtilities: Tenant responsible for all utilities.";
      const provisionsSection = specialProvisions ? `\nSpecial Provisions: ${specialProvisions}` : "";

      const aiPrompt = `You are a property management AI assistant for Naltos, a multifamily real estate platform. Generate a professional residential lease agreement with comprehensive clauses.

Property: ${propertyName}
Unit: ${unitLabel}
Tenant: ${tenantName} (${tenantEmail})
Monthly Rent: $${rent}
Lease Term: ${term} months (${startDate} to ${endDate})
Security Deposit: $${securityDeposit} (${securityDepositMultiplier}x monthly rent)
Late Fee: ${lateFeePercent}% after ${lateFeeGraceDays} days grace period${petSection}${parkingSection}${utilitiesSection}${provisionsSection}

Generate 8-12 detailed lease clauses. Each clause should be 3-5 sentences with specific, enforceable language. Cover these categories:
- financial (2-3 clauses): rent payment terms, security deposit, late fees
- maintenance (1-2 clauses): tenant vs landlord responsibilities
- rules (2-3 clauses): occupancy limits, noise/quiet hours, property modifications, pet policy, parking
- termination (1-2 clauses): early termination, lease renewal, move-out procedures
- general (1-2 clauses): governing law, notices, liability, insurance

Also write a 3-sentence plain-English summary of the entire lease.

Respond in valid JSON:
{
  "summary": "...",
  "clauses": [
    {"title": "...", "content": "...", "category": "financial|maintenance|rules|termination|general"}
  ]
}`;

      let aiSummary = `This lease is for ${unitLabel} at ${propertyName}, starting ${startDate} through ${endDate} (${term} months) at $${rent}/month with a $${securityDeposit} security deposit.`;
      let clauses: LeaseClause[] = [
        { id: `c${clauseIdCounter++}`, title: "Monthly Rent Payment", content: `Tenant agrees to pay $${rent} on the 1st of each month via ACH, card, or check through the Naltos platform. Rent is due in full without deduction or offset. A grace period of ${lateFeeGraceDays} days is provided before late fees apply.`, category: "financial" },
        { id: `c${clauseIdCounter++}`, title: "Late Fees & Penalties", content: `Payments received after the ${lateFeeGraceDays}-day grace period will incur a late fee of ${lateFeePercent}% of the monthly rent ($${(rent * lateFeePercent / 100).toFixed(2)}). If rent remains unpaid for 30 days, the landlord may initiate formal collection proceedings. Returned payment fees of $35 apply to any failed transactions.`, category: "financial" },
        { id: `c${clauseIdCounter++}`, title: "Security Deposit", content: `A security deposit of $${securityDeposit} (${securityDepositMultiplier}x monthly rent) is required at lease signing. The deposit will be held in accordance with state law and returned within 30 days of move-out, minus any deductions for damages beyond normal wear and tear. An itemized statement of deductions will be provided.`, category: "financial" },
        { id: `c${clauseIdCounter++}`, title: "Maintenance & Repairs", content: `Tenant is responsible for routine upkeep, cleanliness, and minor repairs under $100. Management handles major repairs, building systems, and structural maintenance. All maintenance requests should be submitted through the Naltos portal for proper tracking and timely response.`, category: "maintenance" },
        { id: `c${clauseIdCounter++}`, title: "Property Rules & Conduct", content: `Quiet hours are observed from 10:00 PM to 8:00 AM. No unauthorized modifications, alterations, or improvements to the unit without prior written consent. Tenant shall not engage in any activity that creates a nuisance or disturbs other residents.`, category: "rules" },
        { id: `c${clauseIdCounter++}`, title: petPolicy ? "Pet Policy" : "No-Pet Policy", content: petPolicy ? `Pets are permitted with a non-refundable pet deposit of $${petDeposit}. Tenant is responsible for all damages caused by pets and must comply with breed/weight restrictions. Pet waste must be properly disposed of, and pets must be leashed in common areas.` : `No pets are allowed on the premises without prior written approval from management. Violation of this policy may result in a $500 fine per occurrence and potential lease termination. Service animals are exempt with proper documentation.`, category: "rules" },
        { id: `c${clauseIdCounter++}`, title: "Lease Termination", content: `Either party may terminate with 60 days written notice before the lease end date. Early termination by tenant requires payment of 2 months rent as an early termination fee. The lease automatically converts to month-to-month at the same terms after the initial term unless either party provides written notice.`, category: "termination" },
        { id: `c${clauseIdCounter++}`, title: "Move-Out Procedures", content: `Tenant must provide written notice at least 60 days before vacating. The unit must be returned in the same condition as received, minus normal wear and tear. A move-out inspection will be scheduled within 48 hours of vacancy to assess any damages.`, category: "termination" },
        { id: `c${clauseIdCounter++}`, title: "General Provisions", content: `This agreement is governed by state landlord-tenant law. All notices must be in writing and delivered via certified mail, email, or the Naltos platform. Naltos platform communications constitute valid written notice for all purposes under this agreement.`, category: "general" },
      ];

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: aiPrompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const parsed = JSON.parse(completion.choices[0].message.content || "{}");
        if (parsed.summary) aiSummary = parsed.summary;
        if (parsed.clauses && Array.isArray(parsed.clauses)) {
          clauses = parsed.clauses.map((c: any) => ({
            id: `c${clauseIdCounter++}`,
            title: c.title,
            content: c.content,
            category: c.category || "general",
          }));
        }
      } catch (aiErr) {
        console.log("AI lease generation fallback to defaults:", aiErr);
      }

      const now = new Date().toISOString();
      const agreement: LeaseAgreement = {
        id: `lease-${leaseIdCounter++}`,
        propertyId: propertyId || "prop-1",
        propertyName,
        unitId: unitId || "u-101",
        unitLabel,
        tenantName,
        tenantEmail,
        tenantId,
        monthlyRent: rent,
        leaseTerm: term,
        startDate,
        endDate,
        securityDeposit,
        securityDepositMultiplier: Number(securityDepositMultiplier),
        lateFeePercent: Number(lateFeePercent),
        lateFeeGraceDays: Number(lateFeeGraceDays),
        petPolicy: Boolean(petPolicy),
        petDeposit: Number(petDeposit),
        parkingIncluded: Boolean(parkingIncluded),
        parkingFee: Number(parkingFee),
        utilitiesIncluded: utilitiesIncluded || [],
        specialProvisions: specialProvisions || "",
        status: isDraft ? "draft" : "pending_tenant",
        clauses,
        createdAt: now,
        sentAt: isDraft ? undefined : now,
        aiSummary,
        organizationId: req.organizationId,
        activity: [
          { id: `evt-${Date.now()}`, action: "created", timestamp: now, detail: "Lease agreement created with AI-generated clauses" },
          ...(isDraft ? [] : [{ id: `evt-${Date.now() + 1}`, action: "sent", timestamp: now, detail: `Sent to ${tenantName} at ${tenantEmail}` }]),
        ],
      };

      leaseAgreements.push(agreement);
      res.json(agreement);
    } catch (error: any) {
      console.error("Lease agreement creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/lease-agreements", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const orgAgreements = leaseAgreements.filter(la => la.organizationId === req.organizationId);
      res.json(orgAgreements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/lease-agreements/:id", requireAuth, async (req, res) => {
    try {
      const agreement = leaseAgreements.find(la => la.id === req.params.id);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      const isManager = ["Admin", "PropertyManager"].includes(user.role);
      const isTenantOwner = user.role === "Tenant" && agreement.tenantEmail === user.email;
      if (isManager && agreement.organizationId !== req.organizationId) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!isManager && !isTenantOwner) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/sign", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      const agreement = leaseAgreements.find(la => la.id === req.params.id && la.tenantEmail === user.email);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      if (agreement.status !== "pending_tenant") return res.status(400).json({ error: "Agreement is not awaiting signature" });
      const now = new Date().toISOString();
      agreement.status = "signed";
      agreement.signedAt = now;
      if (agreement.activity) {
        agreement.activity.push({ id: `evt-${Date.now()}`, action: "signed", timestamp: now, detail: `Signed by ${user.email}` });
      }
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/lease-agreements", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      const tenantAgreements = leaseAgreements.filter(la =>
        la.tenantEmail === user.email && (la.status === "pending_tenant" || la.status === "signed")
      );
      res.json(tenantAgreements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ---- Lease Management Endpoints ----

  app.patch("/api/lease-agreements/:id/clauses", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const agreement = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      if (agreement.status === "signed") return res.status(400).json({ error: "Cannot modify signed agreement" });

      const { action, clauseId, clause } = req.body;
      const now = new Date().toISOString();

      if (action === "edit" && clauseId && clause) {
        const idx = agreement.clauses.findIndex(c => c.id === clauseId);
        if (idx === -1) return res.status(404).json({ error: "Clause not found" });
        agreement.clauses[idx] = { ...agreement.clauses[idx], ...clause };
        agreement.activity.push({ id: `evt-${Date.now()}`, action: "clause_edited", timestamp: now, detail: `Edited clause: ${agreement.clauses[idx].title}` });
      } else if (action === "add" && clause) {
        const newClause = { ...clause, id: `c${clauseIdCounter++}`, isCustom: true };
        agreement.clauses.push(newClause);
        agreement.activity.push({ id: `evt-${Date.now()}`, action: "clause_added", timestamp: now, detail: `Added custom clause: ${newClause.title}` });
      } else if (action === "remove" && clauseId) {
        const removed = agreement.clauses.find(c => c.id === clauseId);
        agreement.clauses = agreement.clauses.filter(c => c.id !== clauseId);
        agreement.activity.push({ id: `evt-${Date.now()}`, action: "clause_removed", timestamp: now, detail: `Removed clause: ${removed?.title || clauseId}` });
      } else {
        return res.status(400).json({ error: "Invalid action. Use 'edit', 'add', or 'remove'." });
      }

      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/regenerate-clause", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const agreement = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      if (agreement.status === "signed") return res.status(400).json({ error: "Cannot modify signed agreement" });

      const { clauseId } = req.body;
      const clauseIdx = agreement.clauses.findIndex(c => c.id === clauseId);
      if (clauseIdx === -1) return res.status(404).json({ error: "Clause not found" });

      const clause = agreement.clauses[clauseIdx];
      const prompt = `You are a property management AI. Rewrite this lease clause with clearer, more professional language while keeping the same intent and category.

Current clause title: ${clause.title}
Current clause content: ${clause.content}
Category: ${clause.category}

Context: Property ${agreement.propertyName}, Unit ${agreement.unitLabel}, Rent $${agreement.monthlyRent}/month, Term ${agreement.leaseTerm} months.

Respond in JSON: {"title": "...", "content": "..."}`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.5,
        });
        const parsed = JSON.parse(completion.choices[0].message.content || "{}");
        if (parsed.title && parsed.content) {
          agreement.clauses[clauseIdx] = { ...clause, title: parsed.title, content: parsed.content };
          agreement.activity.push({ id: `evt-${Date.now()}`, action: "clause_regenerated", timestamp: new Date().toISOString(), detail: `AI regenerated clause: ${parsed.title}` });
        }
      } catch (aiErr) {
        console.log("AI clause regeneration error:", aiErr);
        return res.status(500).json({ error: "AI regeneration failed" });
      }

      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/cancel", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const agreement = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      if (agreement.status === "signed") return res.status(400).json({ error: "Cannot cancel a signed agreement" });
      agreement.status = "cancelled";
      agreement.cancelledAt = new Date().toISOString();
      agreement.activity.push({ id: `evt-${Date.now()}`, action: "cancelled", timestamp: new Date().toISOString(), detail: "Lease agreement was cancelled" });
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/duplicate", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const original = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!original) return res.status(404).json({ error: "Agreement not found" });

      const now = new Date().toISOString();
      const duplicate: LeaseAgreement = {
        ...JSON.parse(JSON.stringify(original)),
        id: `lease-${leaseIdCounter++}`,
        status: "draft",
        createdAt: now,
        sentAt: undefined,
        signedAt: undefined,
        cancelledAt: undefined,
        clauses: original.clauses.map(c => ({ ...c, id: `c${clauseIdCounter++}` })),
        activity: [{ id: `evt-${Date.now()}`, action: "created", timestamp: now, detail: `Duplicated from lease ${original.id}` }],
      };

      leaseAgreements.push(duplicate);
      res.json(duplicate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/send", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const agreement = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!agreement) return res.status(404).json({ error: "Agreement not found" });
      if (agreement.status !== "draft") return res.status(400).json({ error: "Only drafts can be sent" });
      agreement.status = "pending_tenant";
      agreement.sentAt = new Date().toISOString();
      agreement.activity.push({ id: `evt-${Date.now()}`, action: "sent", timestamp: new Date().toISOString(), detail: `Sent to ${agreement.tenantName} at ${agreement.tenantEmail}` });
      res.json(agreement);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/:id/renew", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const original = leaseAgreements.find(la => la.id === req.params.id && la.organizationId === req.organizationId);
      if (!original) return res.status(404).json({ error: "Agreement not found" });

      const { newTerm = original.leaseTerm, newRent = original.monthlyRent } = req.body;
      const newStart = new Date(original.endDate);
      const newEnd = new Date(newStart);
      newEnd.setMonth(newEnd.getMonth() + Number(newTerm));
      const now = new Date().toISOString();

      const renewal: LeaseAgreement = {
        ...JSON.parse(JSON.stringify(original)),
        id: `lease-${leaseIdCounter++}`,
        monthlyRent: Number(newRent),
        leaseTerm: Number(newTerm),
        startDate: newStart.toISOString().split("T")[0],
        endDate: newEnd.toISOString().split("T")[0],
        securityDeposit: Number(newRent) * original.securityDepositMultiplier,
        status: "draft",
        createdAt: now,
        sentAt: undefined,
        signedAt: undefined,
        cancelledAt: undefined,
        clauses: original.clauses.map(c => ({ ...c, id: `c${clauseIdCounter++}` })),
        aiSummary: `Renewal of lease for ${original.unitLabel} at ${original.propertyName}. New term: ${newTerm} months starting ${newStart.toISOString().split("T")[0]} at $${newRent}/month.`,
        activity: [{ id: `evt-${Date.now()}`, action: "created", timestamp: now, detail: `Renewal from lease ${original.id}` }],
      };

      leaseAgreements.push(renewal);
      res.json(renewal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/lease-agreements/ai-chat", requireAuth, async (req, res) => {
    try {
      const { message, leaseId, context } = req.body;
      if (!message) return res.status(400).json({ error: "Message required" });

      let leaseContext = "";
      if (leaseId) {
        const user = await storage.getUser(req.session.userId!);
        const agreement = leaseAgreements.find(la => {
          if (la.id !== leaseId) return false;
          if (!user) return false;
          if (["Admin", "PropertyManager"].includes(user.role)) return la.organizationId === req.organizationId;
          if (user.role === "Tenant") return la.tenantEmail === user.email;
          return false;
        });
        if (agreement) {
          leaseContext = `
Current Lease Details:
- Property: ${agreement.propertyName}, Unit: ${agreement.unitLabel}
- Tenant: ${agreement.tenantName}
- Monthly Rent: $${agreement.monthlyRent}
- Lease Term: ${agreement.leaseTerm} months starting ${agreement.startDate}
- Security Deposit: $${agreement.securityDeposit}
- Status: ${agreement.status}
Clauses:
${agreement.clauses.map(c => `- ${c.title}: ${c.content}`).join("\n")}`;
        }
      }

      const systemPrompt = `You are Naltos AI, a friendly and knowledgeable lease agreement assistant for a multifamily real estate platform. You help both property managers and tenants understand lease terms clearly.

${leaseContext}
${context || ""}

Guidelines:
- Explain lease terms in plain, simple English
- Be concise but thorough - 2-4 sentences per response
- If asked about specific clauses, reference the relevant terms
- For managers: help with lease structure, pricing, and tenant communication
- For tenants: explain rights, responsibilities, and what each clause means
- Always be professional and helpful
- Never provide actual legal advice - suggest consulting a lawyer for legal questions`;

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
        temperature: 0.4,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      }
      res.end();
    } catch (error: any) {
      console.error("Lease AI chat error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      } else {
        res.end();
      }
    }
  });

  // ====== PHASE 1: DISPUTES API ======

  app.get("/api/disputes", requireAuth, requireRole("Admin", "PropertyManager", "CFO", "Analyst"), async (req, res) => {
    try {
      const orgId = (req as any).organizationId;
      const { type, status } = req.query;
      const filters: any = {};
      if (type) filters.type = type;
      if (status) filters.status = status;
      const result = await storage.getDisputes(orgId, filters);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/disputes/:id", requireAuth, async (req, res) => {
    try {
      const dispute = await storage.getDispute(req.params.id);
      if (!dispute) return res.status(404).json({ error: "Dispute not found" });
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/disputes", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const orgId = (req as any).organizationId;
      const dispute = await storage.createDispute({ ...req.body, organizationId: orgId });
      await storage.addDisputeTimelineEntry(dispute.id, `Dispute ${dispute.disputeNumber} filed by ${dispute.filedBy}`);
      await storage.createActivityEvent({
        organizationId: orgId,
        eventType: "dispute_filed",
        title: `Dispute ${dispute.disputeNumber} filed`,
        description: dispute.description,
        entityType: "dispute",
        entityId: dispute.id,
      });
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/disputes/:id/status", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const { status, ...updates } = req.body;
      const dispute = await storage.updateDisputeStatus(req.params.id, status, updates);
      const actionMap: Record<string, string> = {
        under_review: "Dispute moved to Under Review",
        escalated: "Dispute escalated",
        mediation: "Dispute sent to Mediation",
        resolved: `Dispute resolved${updates.resolutionType ? ` - ${updates.resolutionType}` : ""}`,
        closed: "Dispute closed",
      };
      await storage.addDisputeTimelineEntry(dispute.id, actionMap[status] || `Status changed to ${status}`);
      const eventType = status === "resolved" ? "dispute_resolved" : status === "escalated" ? "dispute_escalated" : "dispute_updated";
      await storage.createActivityEvent({
        organizationId: dispute.organizationId,
        eventType: eventType as any,
        title: `Dispute ${dispute.disputeNumber} ${actionMap[status] || `updated to ${status}`}`,
        entityType: "dispute",
        entityId: dispute.id,
      });
      res.json(dispute);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/disputes/:id/timeline", requireAuth, async (req, res) => {
    try {
      const entry = await storage.addDisputeTimelineEntry(req.params.id, req.body.action);
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/disputes/:id/timeline", requireAuth, async (req, res) => {
    try {
      const timeline = await storage.getDisputeTimeline(req.params.id);
      res.json(timeline);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 1: PARTNER API ======

  app.get("/api/partner/organizations", requireAuth, async (req, res) => {
    try {
      const partnerOrgs = await storage.getPartnerOrgsByUser(req.userId!);
      res.json(partnerOrgs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partner/organizations/:id", requireAuth, async (req, res) => {
    try {
      const org = await storage.getPartnerOrganization(req.params.id);
      if (!org) return res.status(404).json({ error: "Partner organization not found" });
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partner/leads", requireAuth, async (req, res) => {
    try {
      const partnerOrgs = await storage.getPartnerOrgsByUser(req.userId!);
      if (partnerOrgs.length === 0) return res.json([]);
      const { status, leadType } = req.query;
      const filters: any = {};
      if (status) filters.status = status;
      if (leadType) filters.leadType = leadType;
      const allLeads = [];
      for (const org of partnerOrgs) {
        const leads = await storage.getPartnerLeads(org.id, filters);
        allLeads.push(...leads);
      }
      allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(allLeads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/partner/leads/:id/status", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updatePartnerLeadStatus(req.params.id, req.body.status);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partner/compliance", requireAuth, async (req, res) => {
    try {
      const partnerOrgs = await storage.getPartnerOrgsByUser(req.userId!);
      if (partnerOrgs.length === 0) return res.json([]);
      const allItems = [];
      for (const org of partnerOrgs) {
        const items = await storage.getPartnerComplianceItems(org.id);
        allItems.push(...items);
      }
      res.json(allItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/partner/activity", requireAuth, async (req, res) => {
    try {
      const partnerOrgs = await storage.getPartnerOrgsByUser(req.userId!);
      if (partnerOrgs.length === 0) return res.json([]);
      const orgId = partnerOrgs[0].organizationId;
      const events = await storage.getActivityEvents(orgId, { limit: 20 });
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Business-side partner management
  app.get("/api/partners", requireAuth, requireRole("Admin", "PropertyManager"), async (req, res) => {
    try {
      const orgId = (req as any).organizationId;
      const partners = await storage.getPartnerOrganizations(orgId);
      res.json(partners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 1: CONSENT & PRIVACY API ======

  app.get("/api/tenant/consents", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) return res.json([]);
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) return res.json([]);
      const records = await storage.getConsentRecords(tenant.id, tenant.organizationId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tenant/consents", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) return res.status(400).json({ error: "No tenant linked" });
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) return res.status(404).json({ error: "Tenant not found" });
      const record = await storage.createConsentRecord({
        ...req.body,
        tenantId: tenant.id,
        organizationId: tenant.organizationId,
      });
      await storage.createActivityEvent({
        organizationId: tenant.organizationId,
        eventType: record.action === "granted" ? "consent_granted" : "consent_revoked",
        title: `Consent ${record.action} for ${record.category}`,
        description: `Shared with: ${record.sharedWith}`,
        entityType: "consent",
        entityId: record.id,
        userId: userId,
      });
      res.json(record);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tenant/consents/:id", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const { enabled } = req.body;
      const action = enabled ? "granted" : "revoked";
      const updated = await storage.updateConsentStatus(req.params.id, enabled, action);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/tenant/partner-access", requireAuth, requireRole("Tenant"), async (req, res) => {
    try {
      const userId = req.userId!;
      const user = await storage.getUser(userId);
      if (!user?.tenantId) return res.json([]);
      const tenant = await storage.getTenant(user.tenantId);
      if (!tenant) return res.json([]);
      const logs = await storage.getPartnerAccessLogs(tenant.id, tenant.organizationId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 1: ACTIVITY EVENTS API ======

  app.get("/api/activity-events", requireAuth, async (req, res) => {
    try {
      const orgId = (req as any).organizationId;
      if (!orgId) return res.json([]);
      const { eventType, limit } = req.query;
      const filters: any = {};
      if (eventType) filters.eventType = eventType;
      if (limit) filters.limit = parseInt(limit as string);
      const events = await storage.getActivityEvents(orgId, filters);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 2: LEASE MANAGEMENT API ======

  app.get("/api/leases", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const result = await storage.getLeasesByOrg(orgId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/leases/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateLease(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/lease-violations", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const violations = await storage.getLeaseViolationsByOrg(orgId);
      res.json(violations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 2: UNITS API ======

  app.get("/api/units", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const result = await storage.getUnitsByOrg(orgId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/units/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateUnit(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/unit-turns", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const turns = await storage.getUnitTurnsByOrg(orgId);
      res.json(turns);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 2: MAINTENANCE API ======

  app.get("/api/maintenance/work-orders", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const { status, category, priority } = req.query;
      const filters: any = {};
      if (status) filters.status = status;
      if (category) filters.category = category;
      if (priority) filters.priority = priority;
      const orders = await storage.getWorkOrdersByOrg(orgId, filters);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/maintenance/work-orders/:id", requireAuth, async (req, res) => {
    try {
      const updated = await storage.updateWorkOrder(req.params.id, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/maintenance/preventive", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const tasks = await storage.getPreventiveTasksByOrg(orgId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 2: RESIDENTS API ======

  app.get("/api/residents", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const residents = await storage.getResidentsByOrg(orgId);
      res.json(residents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/residents/households", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const tenantsList = await storage.getTenantsByOrg(orgId);
      const households = await Promise.all(tenantsList.map(async (t) => {
        const members = await storage.getHouseholdMembersByTenant(t.id);
        return { tenantId: t.id, primary: t.name, members, totalOccupants: members.length + 1 };
      }));
      res.json(households);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/residents/pets", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const pets = await storage.getPetsByOrg(orgId);
      res.json(pets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/residents/vehicles", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.userId!);
      const orgId = user?.organizationId;
      if (!orgId) return res.json([]);
      const vehicles = await storage.getVehiclesByOrg(orgId);
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 3: MOVE-IN/MOVE-OUT API ======

  app.get("/api/move-ins", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMoveInsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/move-outs", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMoveOutsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/move-checklists", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMoveChecklistsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 3: COMMUNICATIONS API ======

  app.get("/api/communications/messages", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getTenantMessagesByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/communications/announcements", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAnnouncementsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/communications/notices", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getTenantNoticesByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/communications/complaints", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getComplaintsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 3: APPLICATIONS API ======

  app.get("/api/applications", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getLeasingApplicationsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/applications/waitlist", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getApplicantWaitlistByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 3: MARKETING API ======

  app.get("/api/marketing/listings", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMarketingListingsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketing/leads", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMarketingLeadsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/marketing/showings", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getMarketingShowingsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 3: COMMUNITY API ======

  app.get("/api/community/events", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getCommunityEventsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/community/programs", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getCommunityProgramsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: INSPECTIONS API ======

  app.get("/api/inspections/scheduled", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getInspectionsScheduledByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inspections/results", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getInspectionResultsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/inspections/conditions", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getInspectionUnitConditionsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: AMENITIES API ======

  app.get("/api/amenities/list", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAmenityListByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/amenities/reservations", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAmenityReservationsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/amenities/usage", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAmenityUsageByDayByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: PARKING API ======

  app.get("/api/parking/spaces", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getParkingSpaceAssignmentsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parking/permits", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getParkingPermitsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parking/violations", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getParkingViolationsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parking/towing", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getParkingTowingLogByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/parking/garage", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getParkingGarageAccessByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: PACKAGES API ======

  app.get("/api/packages/log", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPackageLogByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/packages/awaiting", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPackageAwaitingPickupByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/packages/lockers", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPackageLockerStatusByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/packages/carriers", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPackageCarrierSummaryByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: ACCESS CONTROL API ======

  app.get("/api/access-control/keys", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getKeyInventoryByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/access-control/cards", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAccessCardsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/access-control/locks", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getSmartLocksByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/access-control/logs", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getAccessLogsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: SAFETY API ======

  app.get("/api/safety/incidents", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getIncidentReportsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/safety/patrols", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPatrolLogsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/safety/cameras", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getCameraSystemsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/safety/fire", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getFireSafetyByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ====== PHASE 4: PEST CONTROL API ======

  app.get("/api/pest-control/treatments", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPestTreatmentScheduleByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pest-control/reports", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPestActiveReportsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pest-control/history", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPestUnitHistoryByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pest-control/vendors", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPestVendorsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pest-control/prevention", requireAuth, async (req, res) => {
    try {
      const orgId = req.organizationId;
      if (!orgId) return res.status(403).json({ message: "No organization" });
      const data = await storage.getPestPreventionProgramsByOrg(orgId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
