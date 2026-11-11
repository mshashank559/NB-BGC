# Operational Runbook & Developer Guide

## 1. Quick Start Guide
```bash
# 1. Install dependencies
npm install

# 2. Run unit tests (Vitest)
npm run test

# 3. Launch development server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 2. Default Test Accounts (Pre-configured 1-Click Role Switcher)

| Role | Email | Password | Scope & Primary Capability |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` | Full visibility, Audit Trail, Monthly PDF/Excel Reports, Override unmark paid |
| **Compliance Manager** | `compliance@company.com` | `comp123` | Creates/Edits PO Form, Draft saving, Submit with validation, On-Offer invoice |
| **Account Manager** | `accounts@company.com` | `acc123` | Collection Hub, Custom 2-3 upfront + 5-6 remaining splits, Mark Paid, Invoices |

---

## 3. Environment Variables (`.env.example`)
```env
# Database connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nb_bgc"

# NextAuth / Session Secret
NEXTAUTH_SECRET="super-secret-jwt-key-for-development"
NEXTAUTH_URL="http://localhost:3000"

# Field Encryption Key (32 bytes AES-256-GCM hex)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# External MCP Invoice Service Integration
MCP_INVOICE_URL="https://mcp.internal.company.com/v1/invoices"
MCP_INVOICE_TOOL="generate_candidate_invoice"
USE_MOCK_MCP="true"

# Automated Reminders Configuration
REMINDER_LEAD_DAYS="2"
REMINDER_SEND_TIME="09:00"
REMINDER_TIMEZONE="Asia/Kolkata"
SMTP_HOST="localhost"
SMTP_PORT="1025"
```

