import { useEffect, useState } from 'react';
import { prettyDate } from '../utils/dates.js';

const TEMPLATE = `Tasks Completed
1.

*

Pending
-

Overall Status: `;

const LAST_PROJECT_KEY = 'drd:lastProject';

export default function ReportEditor({ date, report, onSave, onDelete }) {
  const [project, setProject] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (report) {
      setProject(report.project || '');
      setContent(report.content || '');
    } else {
      let last = '';
      try {
        last = localStorage.getItem(LAST_PROJECT_KEY) || '';
      } catch {
        /* ignore */
      }
      setProject(last);
      setContent(TEMPLATE);
    }
    setMsg(null);
  }, [date, report]);

  const handleSave = async () => {
    if (!content.trim()) {
      setMsg({ type: 'err', text: 'Report is empty.' });
      return;
    }
    setSaving(true);
    try {
      await onSave({ project, content });
      try {
        localStorage.setItem(LAST_PROJECT_KEY, project);
      } catch {
        /* ignore */
      }
      setMsg({ type: 'ok', text: 'Saved to ' + prettyDate(date) });
    } catch (e) {
      setMsg({ type: 'err', text: e?.response?.data?.message || 'Could not save report.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete the report for ${prettyDate(date)}?`)) return;
    try {
      await onDelete();
    } catch {
      setMsg({ type: 'err', text: 'Could not delete report.' });
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft p-6 border border-pink-100">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-pink-400 font-semibold">
            {report ? 'Editing report' : 'New report'}
          </p>
          <h2 className="text-xl font-bold text-pink-700">{prettyDate(date)}</h2>
        </div>
        {report && (
          <span className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full font-medium">
            Saved
          </span>
        )}
      </div>

      <label className="block text-sm font-medium text-gray-600 mb-1">Project</label>
      <input
        value={project}
        onChange={(e) => setProject(e.target.value)}
        placeholder="e.g. Wrench Wise LMS"
        className="w-full mb-4 px-4 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
      />

      <label className="block text-sm font-medium text-gray-600 mb-1">Daily report</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        spellCheck={false}
        className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-pink-50/40 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono text-sm leading-relaxed"
        placeholder="Type or paste your daily report here..."
      />

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold shadow-soft hover:opacity-90 disabled:opacity-60 transition"
        >
          {saving ? 'Saving...' : report ? 'Update Report' : 'Add Report'}
        </button>
        {report && (
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl border border-pink-300 text-pink-600 font-medium hover:bg-pink-50 transition"
          >
            Delete
          </button>
        )}
        {msg && (
          <span className={`text-sm ${msg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>
            {msg.text}
          </span>
        )}
      </div>
    </div>
  );
}
