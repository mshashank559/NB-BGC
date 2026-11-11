# Assumptions & Decisions Log

The following decisions resolve the 8 open questions from the PRD as instructed in Section 11 of the Master Prompt:

1. **Total Payable Formula**:
   - The PRD left the exact mathematical link between annual income and total payable open.
   - *Decision*: Stored as an explicit, editable numeric field on the payment plan. Default initial calculation pre-fills as a percentage (e.g. 8% of annual income) or defaults to the agreed condition ($8,400 benchmark), confirmed by the Compliance Manager upon submission.
2. **Cycle Gap Duration**:
   - *Decision*: `GAP_MODE = FIXED_DAYS` (default 30 days counted from Joining Date). Non-manually edited dates recalculate dynamically when the joining date changes, while manually edited dates are preserved and flagged.
3. **Payment Confirmation Method**:
   - *Decision*: Payments are recorded manually by the Account Manager or Admin via the "Mark Paid" dialog with the actual payment receipt date. No direct online banking gateway feed in v1.
4. **Compliance Manager Payment Editing**:
   - *Decision*: Compliance Manager has a read-only view of payment status, but may edit due dates and amounts with a mandatory remark (min 5 characters). Compliance Manager cannot mark paid.
5. **Reminder Recipients**:
   - *Decision*: Reminders are dispatched exclusively to the candidate's **personal email address** (never the marketing email).
6. **Currency**:
   - *Decision*: Default currency is `USD`, stored on the payment plan.
7. **MCP Invoicing Provider**:
   - *Decision*: Implemented behind a clean `InvoiceProvider` interface with versioning (e.g., `v1`, `v2` upon amount recalculation) and mock/live adapters.
8. **Special Payment Customization Flexibility**:
   - *Decision*: Implemented a dedicated "Special Payment Window" enabling the Account Manager to split the On-Offer amount into 2–3 installments and the remaining balance into 5–6 installments with live validation.

