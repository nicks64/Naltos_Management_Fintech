# Orchestration Layer - Security Limitations (Demo Scope)

## Overview
The orchestration layer (events timeline, merchant settlement preferences, vendor redemption requests) is implemented with **demo-scoped security** suitable for prototyping and demonstration purposes, but **NOT production-ready**.

## Current Implementation Status

### ✅ Implemented Security Features
1. **Organization Scoping**: All queries filter by organizationId to prevent cross-organization data leakage
2. **Basic Ownership Verification**: Merchant/vendor records are verified to belong to the specified organization
3. **Typed Parameters**: All methods use properly typed parameters (no `any` types in interfaces)
4. **Request Validation**: Redemption status updates verify the request belongs to the specified vendor/org

### ⚠️ Known Security Limitations

#### 1. User-to-Entity Authorization NOT Enforced
**Issue**: Methods accept vendorId/merchantId/organizationId as parameters from the caller without verifying the authenticated user has access to those entities.

**Impact**: In a multi-user environment, users could potentially access resources by guessing or discovering IDs, even within their own organization.

**Production Fix Required**: 
- Derive vendorId/merchantId from authenticated user via `vendorUserLinks`/`merchantUserLinks` tables
- Never trust caller-supplied entity IDs for authorization decisions
- Validate user has explicit access via junction tables

#### 2. Event Type Validation
**Issue**: `listOrchestrationEvents` accepts eventType as a string without enum validation.

**Impact**: Could accept invalid event types, potentially causing runtime errors.

**Production Fix Required**: 
- Validate against `orchestrationEventTypeEnum` before query
- Reject invalid event types with clear error messages

#### 3. Session-Based Authorization Gaps
**Issue**: Authorization relies on organization ID extraction from session, but doesn't validate user's role/permissions for specific operations.

**Impact**: Any authenticated user within an organization could potentially perform administrative actions.

**Production Fix Required**:
- Implement role-based access control (RBAC) for mutation operations
- Separate read vs. write permissions
- Audit log all administrative actions

#### 4. Rate Limiting & Abuse Prevention
**Issue**: No rate limiting on creation endpoints (events, redemption requests, preference updates).

**Impact**: Could be abused for DoS or resource exhaustion attacks.

**Production Fix Required**:
- Implement per-user/per-IP rate limiting
- Add request throttling for expensive operations
- Monitor for suspicious patterns

## Usage Guidelines

### ✅ Safe for Demo/Prototype Use Cases
- Single-organization demonstrations
- Controlled testing environments
- Feature validation and UI/UX testing
- Stakeholder presentations

### ❌ NOT Safe for Production Use Cases
- Multi-tenant production deployments
- Public-facing applications
- Financial transactions with real money
- Compliance-regulated environments (SOC 2, PCI-DSS, etc.)

## Migration Path to Production

To make this production-ready, implement in order:

1. **User Authorization Layer** (Critical)
   - Verify user access via junction tables
   - Never trust caller-supplied entity IDs
   - Derive permissions from authenticated session

2. **Input Validation** (High Priority)
   - Enum validation for all enum fields
   - Schema validation using Zod on all inputs
   - SQL injection prevention (already handled by Drizzle ORM)

3. **RBAC & Permissions** (High Priority)
   - Role-based access control for mutations
   - Separate admin vs. user permissions
   - Audit logging for sensitive operations

4. **Rate Limiting** (Medium Priority)
   - Per-endpoint rate limits
   - Per-user quotas
   - DDoS protection

5. **Comprehensive Testing** (High Priority)
   - Unit tests for all authorization logic
   - Integration tests for cross-entity access
   - Security penetration testing

## Documentation Updates

All orchestration-related storage methods are marked with:
```typescript
// NOTE: Demo-scoped implementation - not production-ready
// Security limitations documented in ORCHESTRATION_SECURITY.md
```

## Contact & Questions

For production deployment planning or security hardening assistance, please escalate to the security team before deploying to production environments.

---

**Last Updated**: 2025-11-15  
**Status**: Demo/Prototype Only  
**Production Ready**: ❌ NO
