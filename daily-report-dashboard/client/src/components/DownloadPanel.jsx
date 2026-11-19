import { useState } from 'react';
import { api } from '../api.js';
import { daysAgoISO, todayISO } from '../utils/dates.js';
import { downloadReportsPdf } from '../utils/pdf.js';

export default function DownloadPanel() {
  const [from, setFrom] = useState(daysAgoISO(6));
  const [to, setTo] = useState(todayISO());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const run = async (f, t) => {
    if (f > t) {
      setMsg('"From" date must be before "To" date.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await api.get('/reports/range', { params: { from: f, to: t } });
      if (!data.length) {
        setMsg('No reports found in this range.');
        return;
      }
      downloadReportsPdf(data, f, t);
      setMsg(`Downloaded ${data.length} report${data.length === 1 ? '' : 's'}.`);
    } catch {
      setMsg('Could not fetch reports. Is the server running?');
    } finally {
      setBusy(false);
    }
  };

  const quick = (days) => run(daysAgoISO(days - 1), todayISO());

  return (
    <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-100">
      <h2 className="text-lg font-bold text-pink-700 mb-1">Download PDF</h2>
      <p className="text-sm text-gray-500 mb-4">Pick a range - the PDF downloads automatically.</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          disabled={busy}
          onClick={() => quick(15)}
          className="py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-soft hover:opacity-90 disabled:opacity-60 transition"
        >
          Last 15 days
        </button>
        <button
          disabled={busy}
          onClick={() => quick(30)}
          className="py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold shadow-soft hover:opacity-90 disabled:opacity-60 transition"
        >
          Last 30 days
        </button>
      </div>

      <div className="border-t border-pink-100 pt-4">
        <p className="text-sm font-medium text-gray-600 mb-2">Custom range</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/40 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          <span className="text-pink-400">to</span>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-pink-200 bg-pink-50/40 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          <button
            disabled={busy}
            onClick={() => run(from, to)}
            className="px-4 py-2 rounded-xl border border-pink-400 text-pink-600 font-medium hover:bg-pink-50 disabled:opacity-60 transition text-sm"
          >
            {busy ? 'Preparing...' : 'Download'}
          </button>
        </div>
      </div>

      {msg && <p className="mt-3 text-sm text-pink-600">{msg}</p>}
    </div>
  );
}
