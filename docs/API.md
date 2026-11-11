# API Specifications & Endpoint Route Map

| Method & Path | Roles | Purpose & Checks |
| :--- | :---: | :--- |
| `POST /api/auth/login` | All | Public authentication, session issuance |
| `GET /api/me` | All | Returns current user profile, role, and permissions |
| `GET /api/candidates` | All | Scoped query. AM receives filtered payload with marketing & income stripped |
| `GET /api/candidates/:id` | All | Returns 404 if record is outside user scope (prevents enumeration) |
| `POST /api/candidates` | Admin, CM | Creates a new candidate in `DRAFT` status |
| `POST /api/candidates/:id/submit` | Admin, CM | Validates 10 mandatory fields; transitions to `SUBMITTED`, generates schedule |
| `PATCH /api/installments/:id` | Admin, CM, AM | Edits due date or amount. Requires mandatory 5+ char remark |
| `POST /api/installments/:id/mark-paid` | Admin, AM | Records payment receipt date; auto-closes candidate if balance reaches $0 |
| `POST /api/installments/:id/unmark-paid` | Admin | Reverts paid status; requires mandatory remark |
| `PATCH /api/plans/:id/custom-split` | Admin, AM | Splits upfront into 2-3 parts and remaining into 5-6 parts with remark |
| `POST /api/plans/:id/one-shot` | Admin, AM | Toggles one-shot single installment mode; blocked if any installment is paid |
| `POST /api/invoices/on-offer` | Admin, CM | Generates on-offer invoice via MCP (blocked in DRAFT) |
| `POST /api/invoices/installment` | Admin, AM | Generates installment invoice via MCP with versioning |
| `POST /api/reports/monthly` | Admin | Generates PDF & Excel activity reports for requested calendar month |
| `GET /api/audit` | Admin | Returns append-only audit trail entries |

