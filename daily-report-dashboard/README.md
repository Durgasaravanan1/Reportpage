# Daily Report Dashboard (MERN + Tailwind, pink theme)

Daily work report-a type panni, calendar la date select panni save pannalam.
15 days / 30 days / custom range ku PDF automatic-a download aagum.

## Tech
- MongoDB + Express + Node (server/)
- React (JSX) + Vite + Tailwind CSS (client/)
- jsPDF for PDF export (client side)

## Run

### 1. Backend
```bash
cd server
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run dev               # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite proxies `/api` to `http://localhost:5000`, so no extra config is needed in dev.
For production set `VITE_API_URL` (e.g. `https://your-api.com/api`) before `npm run build`.

## How to use
1. Calendar la date select pannunga (today default).
2. Project name + report type/paste pannunga -> **Add Report**.
3. Pink dot irukura dates = report already add aagirukku. Click panna edit pannalam.
4. **Download PDF** la *Last 15 days* / *Last 30 days* / custom range click pannunga - PDF auto download aagum.

## API
| Method | URL | Purpose |
|---|---|---|
| GET | `/api/reports?month=YYYY-MM` | Reports of a month |
| GET | `/api/reports/range?from=&to=` | Reports in a date range |
| PUT | `/api/reports/:date` | Create/update the report of a day |
| DELETE | `/api/reports/:date` | Delete a day's report |

## Report format (example)
```
Tasks Completed
1. Admin Question Bank Access

*  Enabled Question Banks visibility in the Admin sidebar.

Pending
- Complete end-to-end testing.

Overall Status: Development completed; testing pending.
```
`Tasks Completed`, numbered headings, `Pending`, `Overall Status` are shown as pink headings in the PDF;
lines starting with `*` or `-` become bullets.
