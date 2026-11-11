# Role-Based Access Control (RBAC) & Visibility Matrix

## 1. Authoritative Role-to-Permission Matrix

| Permission String | Admin | Compliance Manager | Account Manager | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `candidate.viewAll` | **Yes** | No | No | Superuser access |
| `candidate.viewOwn` | **Yes** | **Yes** | No | Scoped to `createdBy = me` |
| `candidate.viewPaymentSummary` | **Yes** | **Yes** (Own) | **Yes** (Submitted/Closed) | Accounts receives collection shape |
| `poForm.create` | **Yes** | **Yes** | No | Initiates PO Entry |
| `poForm.editDraft` | **Yes** | **Yes** (Own) | No | Missing fields allowed in draft |
| `poForm.submit` | **Yes** | **Yes** (Own) | No | Validates 10 mandatory fields |
| `schedule.view` | **Yes** | **Yes** (Own) | **Yes** | View installment slots |
| `schedule.editDueDate` | **Yes** | **Yes** (Remark) | **Yes** (Remark) | Reschedules reminder |
| `schedule.editAmount` | **Yes** | **Yes** (Remark) | **Yes** (Remark) | Validates total sum balance |
| `schedule.customizeSplit` | **Yes** | No | **Yes** (Remark) | Special 2-3 upfront + 5-6 remaining split |
| `schedule.switchOneShot` | **Yes** | No | **Yes** (Remark) | Disabled once any installment is paid |
| `installment.markPaid` | **Yes** | No | **Yes** | Records paid date, cancels reminder |
| `installment.unmarkPaid` | **Yes** (Remark) | No | No | Admin override only |
| `invoice.view` | **Yes** | **Yes** (Own) | **Yes** | View invoice numbers & statuses |
| `invoice.generateOnOffer` | **Yes** | **Yes** (After Submit) | No | Triggered on submitted records |
| `invoice.generateInstallment` | **Yes** | No | **Yes** | Generated per installment slot |
| `invoice.regenerate` | **Yes** | No | **Yes** | Retains version history |
| `reminder.viewLog` | **Yes** | No | **Yes** | Tracks delivery status & errors |
| `report.generate / download` | **Yes** | No | No | Monthly PDF & Excel reports |
| `audit.view` | **Yes** | No | No | Immutable audit log |
| `user.manage` | **Yes** | No | No | User roles and access |

---

## 2. Field-Level Data Visibility & Omission Matrix

| Field | Admin | Compliance Manager | Account Manager | Privacy Action |
| :--- | :---: | :---: | :---: | :--- |
| Candidate Name | Read / Write | Read / Write | Read | Visible |
| Personal Email | Read / Write | Read / Write | Read | Used for Reminders |
| Personal Phone | Read / Write | Read / Write | Read | Encrypted at rest |
| Marketing Email / Phone | Read / Write | Read / Write | **Hidden (-)** | Stripped from AM API payload |
| Marketing Dates / Interview Support | Read / Write | Read / Write | **Hidden (-)** | Stripped from AM API payload |
| Sales Person / Team Lead | Read / Write | Read / Write | Read | Visible |
| Manager / Senior Recruiter | Read / Write | Read / Write | **Hidden (-)** | Stripped from AM API payload |
| Job Role / End Client / Location | Read / Write | Read / Write | Read (Payment view) | Kept in collection drawer |
| Annual Income / Package Rate | Read / Write | Read / Write | **Hidden (-)** | Strictly stripped from AM payload |
| Upfront Amount / BGC Status | Read / Write | Read / Write | Read | Visible |
| Final Agreed Payment Condition | Read / Write | Read / Write | Read | Read-only |
| Installment Schedule & Balances | Read / Write | Read-only | Read / Write | Editable with Remark |
| Full Audit History | Read | **Hidden (-)** | **Hidden (-)** | Admin exclusive |

