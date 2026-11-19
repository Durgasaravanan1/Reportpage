import { useCallback, useEffect, useMemo, useState } from 'react';
import Calendar from './components/Calendar.jsx';
import ReportEditor from './components/ReportEditor.jsx';
import DownloadPanel from './components/DownloadPanel.jsx';
import { api } from './api.js';
import { daysInMonth, monthKey, monthLabel, prettyDate, todayISO } from './utils/dates.js';

function Stat({ label, value }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-3 border border-pink-100 shadow-soft">
      <p className="text-xs text-pink-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-pink-700">{value}</p>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState(todayISO());
  const [month, setMonth] = useState(monthKey(todayISO()));
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  const load = useCallback(async (m) => {
    try {
      const { data } = await api.get('/reports', { params: { month: m } });
      setReports(data);
      setError(null);
    } catch {
      setError('Cannot reach the server. Start the backend and check MongoDB.');
    }
  }, []);

  useEffect(() => {
    load(month);
  }, [month, load]);

  const reportDates = useMemo(() => new Set(reports.map((r) => r.date)), [reports]);
  const current = reports.find((r) => r.date === selected) || null;

  const handleSelect = (iso) => {
    setSelected(iso);
    if (monthKey(iso) !== month) setMonth(monthKey(iso));
  };

  const handleSave = async ({ project, content }) => {
    await api.put(`/reports/${selected}`, { project, content });
    await load(month);
  };

  const handleDelete = async () => {
    await api.delete(`/reports/${selected}`);
    await load(month);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 text-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold">Daily Report Dashboard</h1>
        <p className="text-pink-100 mt-1">
          Write today's report, pick any date, and export 15 / 30 days as a PDF.
        </p>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-rose-100 text-rose-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Stat label={`Reports in ${monthLabel(month)}`} value={reports.length} />
        <Stat label="Days in month" value={daysInMonth(month)} />
        <Stat label="Selected date" value={prettyDate(selected)} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Calendar
            month={month}
            selected={selected}
            reportDates={reportDates}
            onMonthChange={setMonth}
            onSelect={handleSelect}
          />
          <DownloadPanel />
        </div>
        <div className="lg:col-span-3">
          <ReportEditor
            date={selected}
            report={current}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
