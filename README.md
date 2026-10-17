# 🏭 IMTEX Exhibition Quiz & Lead Capture System

A production-ready, mobile-first web application engineered for the **IMTEX Exhibition** to capture high-value industry leads through an interactive manufacturing quiz, with secure server-side scoring and official **Google Sheets API v4** integration.

---

## 📑 Google Sheets Schema (`Responses` Sheet)

Each completed quiz appends exactly **one row** into the `Responses` tab with these 10 columns:

| Column | Header | Description | Initial Value / Example |
| :---: | :--- | :--- | :--- |
| **A** | `Submission ID` | Unique quiz attempt identifier | `IMTEX-20261017-9000` |
| **B** | `Timestamp` | Submission ISO timestamp | `2026-10-17T11:02:46.893Z` |
| **C** | `Full Name` | Visitor full name | `Vikram Sharma` |
| **D** | `Email Address` | Visitor email | `vikram@precisioncnc.in` |
| **E** | `Mobile Number` | 10-digit / international phone | `+91 98200 12345` |
| **F** | `Total Score` | Authoritative score (0–10) | `8` |
| **G** | `Maximum Score` | Fixed maximum score | `10` |
| **H** | `Completion Status` | Quiz completion state | `Completed` |
| **I** | `Goodies Collected` | Booth collection state | `No` (Initial) -> `Yes` (Staff Portal) |
| **J** | `Collection Timestamp` | ISO timestamp of gift collection | `2026-10-17T11:15:30.120Z` |

> [!IMPORTANT]
> **Privacy Guarantee**: Individual answers and per-question scores are strictly **never** saved to Google Sheets or displayed to attendees. Authorized booth staff update Column I (`Goodies Collected`) to `"Yes"` and record Column J (`Collection Timestamp`) via the secure `/staff` portal when the visitor claims their souvenir. Duplicate collections are automatically blocked with HTTP 409 Conflict.

---

## 🔑 Complete Google Sheets & Service Account Setup Guide

Follow these 4 simple steps to connect the quiz app to your live Google Sheet:

### Step 1: Enable Google Sheets API in Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `IMTEX-Quiz-2026`) or select an existing one.
3. In the search bar at the top, search for **Google Sheets API** and click **Enable**.

### Step 2: Create a Service Account & Download Credentials Key
1. In Google Cloud Console, navigate to **IAM & Admin** > **Service Accounts**.
2. Click **+ Create Service Account**.
   - **Name**: `imtex-quiz-bot`
   - **Role**: *Project > Editor* or *Basic > Viewer* (Sheets access is governed by document sharing).
3. Click **Done**.
4. Click on your newly created service account, navigate to the **Keys** tab, click **Add Key** > **Create new key**, and choose **JSON**.
5. Save the downloaded `.json` file securely on your computer. It contains:
   - `client_email` (e.g. `imtex-quiz-bot@your-project.iam.gserviceaccount.com`)
   - `private_key` (e.g. `"-----BEGIN PRIVATE KEY-----\nMIIEvg...\n-----END PRIVATE KEY-----\n"`)

### Step 3: Create Google Sheet & Share with Service Account
1. Open [Google Sheets](https://sheets.new) and name the spreadsheet **IMTEX 2026 Quiz Responses**.
2. Rename the first sheet tab to **`Responses`**.
3. Copy the **Spreadsheet ID** from the browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`1A2B3C4D5E6F7G8H9I0J_your_sheet_id`**`/edit`
4. Click the **Share** button at the top-right of the spreadsheet:
   - Paste the service account email (`imtex-quiz-bot@your-project.iam.gserviceaccount.com`).
   - Assign the permission role: **Editor** (uncheck *Notify people*).
   - Click **Share**.

### Step 4: Configure Vercel Environment Variables
In your Vercel Project Dashboard (**Settings** > **Environment Variables**), add the following:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `imtex-quiz-bot@your-project.iam.gserviceaccount.com` | Service account identity |
| `GOOGLE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` | Service account private key |
| `GOOGLE_SHEET_ID` | `1A2B3C4D5E6F7G8H9I0J_your_sheet_id` | Target Google Spreadsheet ID |
| `GOOGLE_SHEET_TAB_NAME` | `Responses` | Target tab name |
| `STAFF_ACCESS_KEY` | `IMTEX2026_BOOTH_STAFF_SECRET` | Passcode for authorized booth staff goodies redemption portal (`/staff`) |

> [!TIP]
> When adding `GOOGLE_PRIVATE_KEY` in Vercel, paste the exact key from the JSON file including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` headers. Vercel automatically preserves the `\n` line endings.

---

## 🎁 Booth Staff Goodies-Collection Portal (`/staff`)

A dedicated, protected workflow allows authorized IMTEX booth staff to verify quiz attendees and distribute souvenirs without exposing the visitor database:

1. **Authentication Gate**: Staff must authenticate using `STAFF_ACCESS_KEY` at `/staff`. The server validates passcodes using constant-time `crypto.timingSafeEqual` and returns an HMAC-SHA256 bearer session token valid for 8 hours (booth shift).
2. **Safe Lookup**: Staff search for attendees strictly by **Submission ID** (e.g. `IMTEX-20261017-9000`). The full visitor database is **never** dumped or exposed over public endpoints.
3. **1-Click Redemption**: Authorized staff click **"Mark Goodies as Collected"** which writes `Goodies Collected = Yes` and sets `Collection Timestamp` in Columns I and J of the Google Sheet.
4. **Duplicate Prevention**: If a visitor attempts to claim a second goodie using the same submission ID, the server rejects the request with **HTTP 409 Conflict** and alerts the staff that the souvenir was already issued earlier.
5. **Fail-Safe Disablement**: If `STAFF_ACCESS_KEY` is not configured on the server, all staff endpoints automatically return **HTTP 503 Service Unavailable** rather than allowing unsecured access.

---

## 🔒 Security Architecture Highlights

1. **No Credential Leakage**: Service account keys, spreadsheet credentials, staff secret keys, and question bank answer keys are strictly kept in the serverless backend (`api/`). Zero secrets are bundled into client assets.
2. **Server-Side Idempotency**: Network retries automatically detect previously completed submission attempts and return the confirmation pass **without appending duplicate rows** to Google Sheets.
3. **Data Sanitization**: Server logs redact personal identifiers (e.g., `P*** K***`, `p***@***.com`) and never print private keys.
4. **Rate Limiting**: Integrated sliding-window IP rate limiting prevents spam and denial-of-service attempts.

---

## 💻 Testing & Verification Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated quiz engine test suite (Question sampling, distribution, constraints)
python scripts/test_quiz_engine.py

# 3. Run automated staff workflow and security test suite (Auth, token validation, lookup, redemption, duplicate prevention)
node scratch/test_staff_endpoints.js

# 4. Start full-stack local server
npm run dev

# 5. Build for production (TypeScript check + Vite production bundle)
npm run build
```
