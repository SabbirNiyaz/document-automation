# 📄 Document Management System

A **full-stack document tracking & compliance platform** built with **Laravel + Inertia.js + React (TypeScript)** for managing parties, documents, PDF attachments, date-based renewal/notification tracking, and **automated email compliance notifications** — secured with **Laravel Fortify**, **Two-Factor Authentication**, and **Passkey (WebAuthn)** login.

---

## 📌 Features

- 🏢 Party (Client/Vendor) Master Management
- 📂 Document Master with Party & Document Type linking, short-code identifiers
- 🖇️ Multiple PDF Attachments per Document (with content-verified upload)
- 📅 Date Details — expiry/renewal tracking per document with email/SMS notification windows
- 📧 **Automated Email Notifications** — scheduled daily job sends compliance reminders (before/after date) via Markdown Mailables to configurable recipients
- 🔐 Laravel Fortify Authentication (Login, Registration, Password Reset, Email Verification)
- 🛡️ Two-Factor Authentication (TOTP + Recovery Codes)
- 🔑 Passkey (WebAuthn) Login & Password Confirmation
- 👤 Profile, Security & Appearance Settings
- 🗑️ Soft Deletes & Full Audit Trail (`created_by` / `updated_by`) on every record
- 🔍 Search, Status Filter & Pagination on every listing page
- ⚛️ Inertia.js + React (TSX) SPA-style frontend, no separate API layer
- 🎨 Sidebar-driven module navigation (shadcn/ui + Lucide icons)
- ✅ Strict Form Request Validation (class-based, per module)
- ⏱️ Laravel Task Scheduling (`Schedule::command`) for daily notification dispatch

---

# 🔐 Authentication & Account Security

## 📌 Auth Pages (Fortify + Inertia)

| Page | Route Helper | Description |
|------|-------------|------------|
| Login | `/login` | Email/password login, "remember me", passkey login |
| Register | `/register` | New account creation with password rules |
| Forgot Password | `/forgot-password` | Sends password reset link |
| Reset Password | `/reset-password/{token}` | Sets a new password via emailed token |
| Confirm Password | `/confirm-password` | Re-confirms password for sensitive actions (supports passkey) |
| Verify Email | `/verify-email` | Prompts + resends email verification link |
| Two-Factor Challenge | `/two-factor-challenge` | OTP code entry or recovery code fallback |

---

## 🛡️ Two-Factor Authentication

- Powered by **Laravel Fortify**
- TOTP-based authentication codes (6-digit OTP input)
- Recovery code fallback flow with toggle UI
- Confirmation-required mode supported (`requiresConfirmation`)
- Managed from **Security Settings**

---

## 🔑 Passkey (WebAuthn) Support

- Passkey login available directly on the **Login** screen
- Passkey-based **password confirmation** for sensitive actions
- Manage (add/rename/remove) passkeys from **Security Settings**
- Tracks `last_used_at` and authenticator type per passkey

---

## 👤 Account Settings

| Setting | Description |
|--------|------------|
| Profile | Update name/email — changing email resets `email_verified_at` |
| Security | Change password, manage 2FA, manage passkeys |
| Appearance | Light/Dark/System theme toggle |
| Delete Account | Permanently deletes the user (with password confirmation) |

---

# 📎 Attachment System

## 📌 PDF Upload & Verification

When a file is uploaded to a document (`POST /attachments`):

- File is stored on the **public disk** under `documents/`
- Upload is rejected unless it passes **triple PDF verification**
- Old file is auto-deleted from storage on replacement (`PUT /attachments/{attachment}`)

## 🔎 PDF Validation Layers

| Layer | Check | Description |
|-------|-------|------------|
| 1 | Extension | File extension must be `.pdf` |
| 2 | Magic Bytes | File must start with `%PDF-` header |
| 3 | Trailer | File must end with a valid `%%EOF` trailer |

## 📤 Attachment Delivery

| Feature | Description |
|--------|------------|
| Inline Viewing | Served via `response()->file()` with `Content-Disposition: inline` |
| Caching | `no-store, no-cache, must-revalidate` headers on every view request |
| Max Size | 10 MB per file |
| Storage Disk | `public` |

## 🧠 Attachment Flow

1. User uploads a PDF against a `docId`
2. File streamed to `storage/app/public/documents`
3. Extension → magic-byte → EOF-trailer checks run
4. `attachment_master` record created (name, path, type, size)
5. `created_by` auto-stamped from the authenticated user
6. On replace: new file saved, old file deleted only after successful save
7. On delete: DB record + physical file both removed

> 📝 **Note:** The project originally stored a single attachment path directly on `document_master`. This was migrated out (`remove_attachment_from_document_master_table`) in favor of a dedicated `attachment_master` table supporting **multiple attachments per document**.

---

# 📧 Email Notification System

## 📌 Overview

The system automatically emails concerned parties when a tracked date (from `date_details`) approaches or passes its `notification_before_days` / `notification_after_days` window, preventing missed compliance deadlines.

## ⏱️ Scheduling

A custom Artisan command drives the notification pipeline and is registered via Laravel's task scheduler:

```php
Schedule::command('notifications:send-dates')
    ->dailyAt('13:05')
    ->timezone('Asia/Dhaka');
```

- Runs once daily (an `everyMinute()` variant is available, commented out, for local testing/debugging)
- Requires the Laravel scheduler to be running (`schedule:run` via cron or `schedule:work` in development)

## ✉️ Mailable: `DateNotificationMail`

| Property | Description |
|----------|------------|
| `dateDetail` | The `DateDetail` model instance triggering the notification |
| `phase` | `'before'` or `'after'` — determines subject line, tense, and messaging |

**Subject line logic:**
- **Before:** `Reminder: {dateTypeName} — {document title} ({short_code})`
- **After:** `Overdue: {dateTypeName} — {document title} ({short_code})`

Built as a **Markdown Mailable** (`emails.date-notification`), rendering:
- Document title & short code
- Date type name
- The tracked date value (formatted `Y-m-d`)
- Phase-specific messaging (upcoming deadline vs. overdue/compliance notice)

## 🧠 Notification Flow

1. Scheduler triggers `notifications:send-dates` daily at 13:05 (Asia/Dhaka)
2. Command queries active `date_details` records due for a "before" or "after" notice, based on `notification_before_days` / `notification_after_days`
3. For each match, `DateNotificationMail` is built and dispatched with the relevant `dateDetail` + `phase`
4. `before_sent_at` / `after_sent_at` is stamped on the `date_details` record to prevent duplicate sends
5. Recipients are drawn from the `emails_text_area` field on the `date_details` record — a comma-separated string parsed via the `DateDetail` model's `getEmailsArrayAttribute()` accessor, which trims, filters empties, and de-duplicates addresses into a clean array

## 🛡️ Duplicate Prevention

- `before_sent_at` and `after_sent_at` timestamps act as send-guards — once populated for a given window, that phase is not re-sent
- Only records with `notify_email` enabled are processed

---

# 🗄️ Database Relationships

| Relationship | Type | Description |
|-------------|------|------------|
| PartyType → PartyMaster | One-to-Many | One party type has many parties |
| PartyMaster → Document | One-to-Many | One party has many documents (restrict on delete) |
| DocumentType → Document | One-to-Many | One document type has many documents (restrict on delete) |
| Document → DateDetail | One-to-Many | One document has many tracked dates (restrict on delete) |
| DateType → DateDetail | One-to-Many | One date type has many date detail entries (restrict on delete) |
| Document → Attachment | One-to-Many | One document can have multiple PDF attachments (cascade on delete) |
| User → Passkey | One-to-Many | One user can register multiple passkeys (cascade on delete) |

---

# 📊 Database Tables & Columns (MySQL)

## 👤 Users Table (`users`)

| Column | Type | Description |
|--------|------|------------|
| id | BIGINT (PK) | Primary key |
| name | VARCHAR | User name |
| email | VARCHAR (UNIQUE) | User email |
| email_verified_at | TIMESTAMP NULL | Email verification time |
| password | VARCHAR (hashed) | Hashed password |
| two_factor_secret | TEXT NULL | Encrypted TOTP secret |
| two_factor_recovery_codes | TEXT NULL | Encrypted recovery codes |
| two_factor_confirmed_at | TIMESTAMP NULL | 2FA confirmation time |
| remember_token | VARCHAR NULL | "Remember me" token |
| created_at / updated_at | TIMESTAMP | Standard timestamps |

## 🔑 Passkeys Table (`passkeys`)

| Column | Type | Description |
|--------|------|------------|
| id | BIGINT (PK) | Primary key |
| user_id | INT (FK) | Reference to `users`, cascade on delete |
| name | VARCHAR | Passkey label |
| credential_id | VARCHAR (UNIQUE) | WebAuthn credential ID |
| credential | JSON | WebAuthn credential payload |
| last_used_at | TIMESTAMP NULL | Last usage time |
| created_at / updated_at | TIMESTAMP | Standard timestamps |

## 🏷️ Party Types Table (`party_types`)

| Column | Type | Description |
|--------|------|------------|
| partyTypeId | INT (PK) | Primary key |
| partyTypeName | VARCHAR(255) | Party type name (unique) |
| status | ENUM (`Active`/`Inactive`, default `Active`) | Active / Inactive |
| created_by | INT NULL | Creator user id |
| modified_by | INT NULL | Last editor user id |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 🏢 Party Master Table (`party_master`)

| Column | Type | Description |
|--------|------|------------|
| partyId | INT (PK) | Primary key |
| partyName | VARCHAR(255) | Party name (indexed) |
| address | VARCHAR(255) NULL | Party address |
| partyTypeId | INT (FK) | Reference to `party_types`, restrict on delete |
| contactPerson | VARCHAR(255) NULL | Primary contact |
| phone | VARCHAR(255) NULL | Contact phone (4–15 digits) |
| email | VARCHAR(255) NULL | Contact email (RFC + DNS validated) |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 🏷️ Document Type Table (`document_type`)

| Column | Type | Description |
|--------|------|------------|
| document_id | INT (PK) | Primary key |
| document_name | VARCHAR(255) | Document type name (unique) |
| status | ENUM (`Active`/`Inactive`, default `Active`) | Active / Inactive |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 📄 Document Master Table (`document_master`)

| Column | Type | Description |
|--------|------|------------|
| docId | INT (PK) | Primary key |
| title | VARCHAR(255) | Document title |
| short_code | VARCHAR(10) NULL | Short identifier code, referenced in notification subject lines |
| description | TEXT NULL | Document description |
| partyName | INT (FK) | Reference to `party_master.partyId`, restrict on delete |
| docType | INT (FK) | Reference to `document_type.document_id`, restrict on delete |
| date | DATE | Document date |
| soft_copy | TEXT NULL | Soft-copy reference/path |
| status | ENUM (`Active`/`Inactive`, default `Active`) | Active / Inactive |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 📎 Attachment Master Table (`attachment_master`)

| Column | Type | Description |
|--------|------|------------|
| attachmentId | INT (PK) | Primary key |
| docId | INT (FK) | Reference to `document_master`, cascade on delete |
| file_name | VARCHAR(255) | Original file name |
| file_path | VARCHAR(500) | Stored file path |
| file_type | VARCHAR(100) NULL | MIME type |
| file_size | BIGINT NULL | File size in bytes |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 🏷️ Date Types Table (`date_types`)

| Column | Type | Description |
|--------|------|------------|
| dateTypeId | INT (PK) | Primary key |
| dateTypeName | VARCHAR(255) | Date type name (unique) |
| status | ENUM (`Active`/`Inactive`, default `Active`) | Active / Inactive |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

## 📅 Date Details Table (`date_details`)

| Column | Type | Description |
|--------|------|------------|
| id | BIGINT (PK) | Primary key |
| dateTypeId | INT (FK) | Reference to `date_types`, restrict on delete |
| docId | INT (FK) | Reference to `document_master`, restrict on delete |
| date_value | DATE | Tracked date (e.g. expiry/renewal) |
| notify_email | BOOLEAN | Enable email notification (default false) |
| notify_sms | BOOLEAN | Enable SMS notification (default false) |
| notification_before_days | INT NULL | Days before date to notify (1/3/7/15/30/60/90) |
| notification_after_days | INT NULL | Days after date to notify (1/3/7/15/30/60/90) |
| emails_text_area | TEXT NULL | Comma-separated recipient email address(es) for this tracked date's notifications |
| before_sent_at | DATETIME NULL | Timestamp last "before" notice was sent |
| after_sent_at | DATETIME NULL | Timestamp last "after" notice was sent |
| status | ENUM (`Active`/`Inactive`, default `Active`) | Active / Inactive |
| created_by / updated_by | INT NULL | Audit fields |
| created_at / updated_at / deleted_at | TIMESTAMP | Standard + soft-delete timestamps |

---

# 📊 Application Routes

All application routes below are protected by `auth` + `verified` middleware.

## 🏷️ Party Type Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/party-types` | List party types |
| POST | `/party-types` | Create party type |
| PUT | `/party-types/{party_type}` | Update party type |
| DELETE | `/party-types/{party_type}` | Soft-delete party type |

## 🏷️ Date Type Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/date-types` | List date types |
| POST | `/date-types` | Create date type |
| PUT | `/date-types/{date_type}` | Update date type |
| DELETE | `/date-types/{date_type}` | Soft-delete date type |

## 🏷️ Document Type Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/document-types` | List document types |
| POST | `/document-types` | Create document type |
| PUT | `/document-types/{document_type}` | Update document type |
| DELETE | `/document-types/{document_type}` | Soft-delete document type |

## 🏢 Party Master Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/party-masters` | List parties |
| POST | `/party-masters` | Create party |
| PUT | `/party-masters/{party_master}` | Update party |
| DELETE | `/party-masters/{party_master}` | Soft-delete party |

## 📄 Document Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/documents` | List documents (with dates & attachments) |
| POST | `/documents` | Create document |
| PUT | `/documents/{document}` | Update document |
| DELETE | `/documents/{document}` | Soft-delete document |

## 📎 Attachment Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| POST | `/attachments` | Upload PDF attachment |
| PUT | `/attachments/{attachment}` | Replace attachment file |
| DELETE | `/attachments/{attachment}` | Delete attachment |
| GET | `/attachments/{attachment}/view` | Stream PDF inline |

## 📅 Date Detail Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/date-details` | List tracked dates (searchable/filterable) |
| POST | `/date-details` | Create date detail |
| PUT | `/date-details/{date_detail}` | Update date detail |
| DELETE | `/date-details/{date_detail}` | Soft-delete date detail |

## 🔐 Authentication Routes (Fortify)

| Method | Endpoint | Description |
|--------|---------|------------|
| GET/POST | `/login` | Login form / submit (supports passkey) |
| GET/POST | `/register` | Registration form / submit |
| GET/POST | `/forgot-password` | Request password reset link |
| GET/POST | `/reset-password/{token}` | Reset password form / submit |
| GET/POST | `/confirm-password` | Confirm password for sensitive actions |
| GET | `/verify-email` | Email verification prompt |
| POST | `/two-factor-challenge` | Submit 2FA code or recovery code |

## 👤 Account Settings Routes

| Method | Endpoint | Description |
|--------|---------|------------|
| GET | `/settings/profile` | View profile settings |
| PATCH | `/settings/profile` | Update profile (resets email verification if changed) |
| DELETE | `/settings/profile` | Delete account |
| GET | `/settings/security` | View security settings (password, 2FA, passkeys) |
| PUT | `/settings/security` | Update password |
| GET | `/settings/appearance` | View/update theme appearance |

---

# ⏱️ Scheduled Commands

| Command | Schedule | Description |
|---------|---------|------------|
| `notifications:send-dates` | Daily at `13:05` (`Asia/Dhaka`) | Scans `date_details` for due before/after notification windows and dispatches `DateNotificationMail` to configured recipients |

> An `everyMinute()` variant is kept commented out in `routes/console.php` for local testing of the notification pipeline without waiting for the daily window.

---

# 📥 Form Request Validation Rules

## 🏢 Party Master Validation
- `partyName` required, unique (ignores soft-deleted rows)
- `phone` digits only, 4–15 digits
- `email` must pass RFC + DNS validation
- `partyTypeId` must exist in `party_types`

## 📄 Document Validation
- `title` required, max 255 chars
- `short_code` optional, max 10 chars
- `partyName` must exist in `party_master`
- `docType` must exist in `document_type`
- `attachment` (optional at creation) — PDF only, max 10 MB

## 📎 Attachment Validation
- File required on create, optional on update
- Extension, magic-byte, and EOF-trailer PDF checks
- Max size 10 MB

## 📅 Date Detail Validation
- `dateTypeId` must exist in `date_types`; `docId` must exist in `document_master`
- `date_value` required, valid date
- `notify_email` / `notify_sms` optional booleans
- `notification_before_days` / `notification_after_days` restricted to `[1, 3, 7, 15, 30, 60, 90]`
- `emails_text_area` optional; comma-separated string, each segment individually validated as a well-formed email address via a custom closure rule
- `status` required, restricted to `Active` / `Inactive`
- `stay` optional boolean (supports "save & stay on form" UX behavior)

## 🏷️ Type Validation (Party/Date/Document Types)
- Name required, max 255 chars, unique (ignoring soft-deleted rows)
- `status` restricted to `Active` / `Inactive`

---

# 🧠 Business Logic Highlights

### 🔑 Authentication & Security
- Powered by **Laravel Fortify** (login, registration, password reset, email verification)
- Two-Factor Authentication with OTP entry and recovery code fallback
- Passkey (WebAuthn) login and password confirmation
- Changing email resets `email_verified_at`, re-triggering verification

### 📎 Attachment Logic
- Every uploaded PDF is content-verified (not just extension-checked)
- Replacing a file deletes the old physical file only after the new one saves successfully
- Deleting an attachment removes both the DB record and the stored file
- Deleting a document cascades and removes its attachments

### 📅 Date Tracking & Notification Logic
- Each document can have multiple tracked dates (e.g. license expiry, contract renewal)
- Configurable email/SMS notification windows before and after the date
- A daily scheduled Artisan command (`notifications:send-dates`) dispatches Markdown-based `DateNotificationMail` emails to the recipient(s) stored in `emails_text_area`
- Subject and tone adapt automatically to the `phase` (`before` = upcoming reminder, `after` = overdue/compliance notice)
- `before_sent_at` / `after_sent_at` timestamps prevent duplicate notifications

### 🗂️ Audit Trail
- Every model auto-stamps `created_by` on creation and `updated_by` on update via Eloquent `booted()` hooks
- All core tables use **soft deletes** — nothing is ever hard-deleted from the primary flow
- Referential integrity enforced via `restrictOnDelete()` on core lookups (party/date/document types) so in-use records can't be removed

### ❌ Error Handling
- Centralized Form Request validation with custom messages per field
- Consistent flash-based success/error feedback (`session('success')` / `session('error')`)

---

# 🖼️ File Upload System

- Supports: PDF only
- Max 10 MB per file
- Stored on the **public** disk under `documents/`
- Served securely via a dedicated inline-view controller action (no direct public path exposure)

---

# ⚛️ Frontend Stack

- **Inertia.js** — server-driven SPA routing (no separate REST/JSON API)
- **React + TypeScript (.tsx)** — all pages under `resources/js/pages`
- **shadcn/ui** components (Button, Input, Label, Checkbox, Sidebar, InputOTP, etc.)
- **Lucide React** — icon set
- **Wayfinder-generated route/action helpers** (`@/actions/...`, `@/routes/...`) for type-safe backend calls from React

### 📁 Page Structure

| Group | Pages |
|-------|-------|
| Core Modules | `PartyTypes`, `DateTypes`, `DocumentTypes`, `PartyMasters`, `Documents`, `DateDetails` (all `Index.tsx`) |
| Auth | `login`, `register`, `forgot-password`, `reset-password`, `confirm-password`, `verify-email`, `two-factor-challenge` |
| Settings | `settings/profile`, `settings/security`, `settings/appearance` |

### 🧭 Navigation
- Collapsible icon sidebar (`AppSidebar`) built with shadcn `Sidebar` primitives
- Menu items map directly to backend controller routes: Documents, Date Details, Party Management, Document Types, Date Types, Party Types
- Reusable combobox components (`PartyCombobox`, `DateTypeCombobox`, `DocumentTypeCombobox`)

---

# 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel |
| Auth | Laravel Fortify (2FA, Passkeys) |
| Frontend | React + TypeScript via Inertia.js |
| UI | shadcn/ui + Tailwind CSS + Lucide Icons |
| Database | MySQL |
| File Storage | Laravel Filesystem (public disk) |
| Mail | Laravel Mailables (Markdown), Task Scheduling |

---

# 👨‍💻 Author

**[Sabbir Hossain Niyaz](https://github.com/SabbirNiyaz)**

💼 Software Engineer Intern, BRACNet Limited
