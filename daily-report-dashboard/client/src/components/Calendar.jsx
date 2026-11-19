import { useMemo } from 'react';
import { monthLabel, shiftMonth, toISO, todayISO } from '../utils/dates.js';

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ month, selected, reportDates, onMonthChange, onSelect }) {
  const today = todayISO();

  const cells = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const total = new Date(y, m, 0).getDate();
    const arr = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= total; d++) arr.push(toISO(new Date(y, m - 1, d)));
    return arr;
  }, [month]);

  return (
    <div className="bg-white rounded-3xl shadow-soft p-5 border border-pink-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition font-bold"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="text-lg font-semibold text-pink-700">{monthLabel(month)}</h2>
        <button
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 hover:bg-pink-200 transition font-bold"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEK.map((w) => (
          <div key={w} className="text-center text-xs font-medium text-pink-400 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso, i) => {
          if (!iso) return <div key={`e${i}`} />;
          const has = reportDates.has(iso);
          const isSel = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              onClick={() => onSelect(iso)}
              className={[
                'relative aspect-square rounded-xl text-sm font-medium transition',
                isSel
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-soft'
                  : has
                  ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  : 'text-gray-600 hover:bg-pink-50',
                isToday && !isSel ? 'ring-2 ring-pink-400' : '',
              ].join(' ')}
            >
              {Number(iso.slice(8))}
              {has && (
                <span
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isSel ? 'bg-white' : 'bg-pink-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-pink-500" /> Report added
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded ring-2 ring-pink-400" /> Today
        </span>
      </div>
    </div>
  );
}
