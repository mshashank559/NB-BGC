# Candidate Compliance & Payments Dashboard

An internal post-placement lifecycle & installment collection CRM built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**, styled in the luxury **Apple Vision Pro Spatial Dark Glassmorphism** aesthetic.

---

## 🌟 Key Features

1. **Apple Vision Pro Spatial Dark Glass Aesthetic**:
   - Floating glass canvas with subtle 3D mouse parallax tilt (`ParallaxContainer.tsx`).
   - Circular SVG Collection Gauge displaying **23% Overall Collected** with live cyan glow.
   - Cash Flow Trajectory bar chart with interactive `[Week | Month | Year]` timeline filter.
   - Operations Center with interactive glowing cyan toggles for Automated Reminders and MCP Invoicing Engine.
2. **Instant 1-Click Role Switcher (Pre-configured Credentials)**:
   - **Admin** (`admin@company.com` / `admin123`): Full access, Audit Trail, Monthly PDF/Excel Reports, override unmark paid.
   - **Compliance Manager** (`compliance@company.com` / `comp123`): 8-group PO Detail Form (Draft save, 10 mandatory fields submit validation), own created records, On-Offer invoice trigger.
   - **Account Manager** (`accounts@company.com` / `acc123`): Collection Hub, Mark Paid modal, and strict data privacy (marketing details, annual income, package, recruiter stripped).
3. **🔥 Special Payment Window (Custom Flexibility)**:
   - Customized schedule builder allowing candidates to pay the **On-Offer amount in 2–3 installments** and the **Remaining balance in 5–6 installments** instead of the standard 4-part flat split.
4. **Mandatory 5-Character Remark & Audit Trail**:
   - Every date, amount, split, or one-shot adjustment strictly enforces a minimum 5-character reason, logged in the append-only audit trail.
5. **Admin Reporting**:
   - Real Excel (`.xlsx`) and PDF (`.pdf`) download with automated PII contact stripping.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run payment engine unit tests (including PRD Golden Test)
npm run test

# 3. Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Architecture & Docs

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - End-to-end architecture, role boundaries, security & calculation engine.
- [`docs/PERMISSIONS.md`](./docs/PERMISSIONS.md) - Complete role-to-permission matrix and field-level privacy rules.
- [`docs/ASSUMPTIONS.md`](./docs/ASSUMPTIONS.md) - Documented resolutions for open business questions.
- [`docs/API.md`](./docs/API.md) - Endpoint specifications and route handlers.
- [`docs/RUNBOOK.md`](./docs/RUNBOOK.md) - Developer runbook and environment variables.

