-- ==============================================================================
-- Candidate Compliance & Payments Dashboard — Complete Supabase PostgreSQL Schema
-- Run this script directly in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'COMPLIANCE_MANAGER', 'ACCOUNT_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE candidate_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bgc_status_enum AS ENUM ('INITIATED', 'IN_PROGRESS', 'CLEARED', 'FLAGGED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE installment_status_enum AS ENUM ('PENDING', 'REMINDER_SENT', 'PAID', 'OVERDUE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status_enum AS ENUM ('DRAFT', 'SENT', 'PAID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status_enum AS ENUM ('SCHEDULED', 'SENT', 'FAILED', 'RESCHEDULED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'COMPLIANCE_MANAGER',
    active BOOLEAN NOT NULL DEFAULT true,
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: candidates (PO Detail Form Records)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name TEXT NOT NULL,
    personal_email TEXT NOT NULL,
    personal_phone TEXT NOT NULL,
    
    -- Marketing details (Hidden from Account Manager)
    marketing_email TEXT,
    marketing_phone TEXT,
    marketing_start_date DATE,
    marketing_end_date DATE,
    interview_support_taken BOOLEAN DEFAULT false,
    
    -- Internal People
    sales_person TEXT NOT NULL,
    manager TEXT,
    team_lead TEXT NOT NULL,
    senior_recruiter TEXT,
    
    -- Placement Details
    job_role TEXT NOT NULL,
    job_location TEXT,
    end_client TEXT NOT NULL,
    implementation_partner TEXT,
    po_month TEXT NOT NULL,
    
    -- Compensation
    package_rate TEXT,
    annual_income NUMERIC(12, 2) NOT NULL DEFAULT 0,
    upfront_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    bgc_offer_status bgc_status_enum NOT NULL DEFAULT 'INITIATED',
    
    -- Dates
    joining_date_end_client DATE NOT NULL,
    joining_date_company DATE,
    
    -- Agreement Terms
    agreement_end_percent_months TEXT DEFAULT '15% for 6 months',
    final_agreed_payment_condition TEXT NOT NULL,
    number_of_installments INT NOT NULL DEFAULT 4,
    remarks TEXT,
    
    -- Lifecycle & Ownership
    status candidate_status_enum NOT NULL DEFAULT 'DRAFT',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_account_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: payment_plans
CREATE TABLE IF NOT EXISTS public.payment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID UNIQUE NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    total_payable NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    installment_count INT NOT NULL DEFAULT 4,
    cycle_gap_days INT NOT NULL DEFAULT 30,
    is_one_shot BOOLEAN NOT NULL DEFAULT false,
    plan_type TEXT NOT NULL DEFAULT 'STANDARD_4', -- 'STANDARD_4' | 'SPLIT_OFFER_REMAINING' | 'CUSTOM'
    on_offer_count INT,
    remaining_count INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: installments (Individual Payment Slots)
CREATE TABLE IF NOT EXISTS public.installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.payment_plans(id) ON DELETE CASCADE,
    number INT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'STANDARD', -- 'UPFRONT' | 'REMAINING' | 'STANDARD'
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    due_date_is_manual BOOLEAN NOT NULL DEFAULT false,
    paid_date DATE,
    status installment_status_enum NOT NULL DEFAULT 'PENDING',
    invoice_number TEXT,
    invoice_status invoice_status_enum,
    invoice_version INT DEFAULT 1,
    reminder_status reminder_status_enum NOT NULL DEFAULT 'SCHEDULED',
    reminder_scheduled_for TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: audit_entries (Append-Only Mandatory Remark Log)
CREATE TABLE IF NOT EXISTS public.audit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT NOT NULL,
    remark TEXT NOT NULL CHECK (char_length(remark) >= 5), -- Mandatory min 5 chars rule
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    role_at_time user_role_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: invoices (MCP Generated Invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL,
    installment_number INT,
    type TEXT NOT NULL, -- 'ON_OFFER' | 'INSTALLMENT' | 'ONE_SHOT'
    invoice_number TEXT UNIQUE NOT NULL,
    version INT NOT NULL DEFAULT 1,
    amount NUMERIC(12, 2) NOT NULL,
    status invoice_status_enum NOT NULL DEFAULT 'SENT',
    payload_snapshot JSONB,
    mcp_ref TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: reminder_logs (Automated Email Reminders History)
CREATE TABLE IF NOT EXISTS public.reminder_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    installment_id UUID REFERENCES public.installments(id) ON DELETE SET NULL,
    installment_number INT NOT NULL,
    recipient_email TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status reminder_status_enum NOT NULL DEFAULT 'SCHEDULED',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: access_logs (Sensitive Contact/Income Access Audit)
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'READ' | 'EXPORT'
    fields_accessed TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_created_by ON public.candidates(created_by);
CREATE INDEX IF NOT EXISTS idx_candidates_po_month ON public.candidates(po_month);
CREATE INDEX IF NOT EXISTS idx_candidates_sales_person ON public.candidates(sales_person);
CREATE INDEX IF NOT EXISTS idx_candidates_team_lead ON public.candidates(team_lead);
CREATE INDEX IF NOT EXISTS idx_installments_plan_id ON public.installments(plan_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON public.installments(status);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON public.installments(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_candidate_id ON public.audit_entries(candidate_id);

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role_enum AS $$
    SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policies for Candidates Table:
-- 1. Admin: Full Access
CREATE POLICY "Admin Full Access Candidates" ON public.candidates
    FOR ALL USING (public.get_current_user_role() = 'ADMIN');

-- 2. Compliance Manager: Own Created Candidates Only
CREATE POLICY "Compliance Manager Own Candidates" ON public.candidates
    FOR ALL USING (
        public.get_current_user_role() = 'COMPLIANCE_MANAGER' 
        AND created_by = auth.uid()
    );

-- 3. Account Manager: SUBMITTED and CLOSED Candidates Only
CREATE POLICY "Account Manager Submitted Candidates" ON public.candidates
    FOR SELECT USING (
        public.get_current_user_role() = 'ACCOUNT_MANAGER' 
        AND status IN ('SUBMITTED', 'CLOSED')
    );

-- ==============================================================================
-- 6. SEED DATA (Default Users & Golden Test Candidate)
-- ==============================================================================
INSERT INTO public.users (id, email, name, role) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'admin@company.com', 'Rajesh Kumar (Admin)', 'ADMIN'),
    ('c0000000-0000-0000-0000-000000000001', 'compliance@company.com', 'Ananya Roy (Compliance Mgr)', 'COMPLIANCE_MANAGER'),
    ('b0000000-0000-0000-0000-000000000001', 'accounts@company.com', 'Suresh Menon (Account Mgr)', 'ACCOUNT_MANAGER')
ON CONFLICT (email) DO NOTHING;

-- Seed Default Settings
INSERT INTO public.system_settings (key, value, description) VALUES
    ('REMINDER_LEAD_DAYS', '2', 'Days before due date when reminder is triggered'),
    ('REMINDER_SEND_TIME', '09:00', 'Time of day in IST when reminders are dispatched'),
    ('REMINDER_TIMEZONE', 'Asia/Kolkata', 'System default timezone for operations'),
    ('GAP_MODE', 'FIXED_DAYS', 'Installment cycle gap mode (FIXED_DAYS or CALENDAR_DATE)')
ON CONFLICT (key) DO NOTHING;

-- Seed Golden Test Candidate ($8,400 Total, Joining 18 Oct 2026, 4 parts of $2,100)
DO $$
DECLARE
    cand_id UUID := '11111111-1111-1111-1111-111111111111';
    plan_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    INSERT INTO public.candidates (
        id, candidate_name, personal_email, personal_phone,
        sales_person, team_lead, job_role, end_client, po_month,
        annual_income, upfront_amount, bgc_offer_status,
        joining_date_end_client, final_agreed_payment_condition,
        number_of_installments, remarks, status, created_by
    ) VALUES (
        cand_id, 'Aryan Sharma', 'aryan.sharma.dev@gmail.com', '+91 98765 43210',
        'Vikram Joshi', 'Rohit Kulkarni', 'Lead Cloud Architect', 'Morgan Stanley Global Tech', 'October 2026',
        140000, 2100, 'CLEARED',
        '2026-10-18', '$8,400 total payable in 4 installments of $2,100 due 30 days apart',
        4, 'Golden benchmark candidate profile.', 'SUBMITTED', 'c0000000-0000-0000-0000-000000000001'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.payment_plans (
        id, candidate_id, total_payable, currency, installment_count, cycle_gap_days, plan_type
    ) VALUES (
        plan_id, cand_id, 8400, 'USD', 4, 30, 'STANDARD_4'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.installments (plan_id, number, tier, amount, due_date, status, paid_date, invoice_number, invoice_status) VALUES
        (plan_id, 1, 'STANDARD', 2100.00, '2026-11-17', 'PAID', '2026-11-16', 'INV-2026-001', 'PAID'),
        (plan_id, 2, 'STANDARD', 2100.00, '2026-12-17', 'PENDING', null, null, null),
        (plan_id, 3, 'STANDARD', 2100.00, '2027-01-16', 'PENDING', null, null, null),
        (plan_id, 4, 'STANDARD', 2100.00, '2027-02-15', 'PENDING', null, null, null)
    ON CONFLICT DO NOTHING;
END $$;

