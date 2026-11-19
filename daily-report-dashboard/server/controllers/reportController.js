import Report from '../models/Report.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;

const bad = (res, message) => res.status(400).json({ message });

// GET /api/reports?month=2026-11
export const listByMonth = async (req, res, next) => {
  try {
    const { month } = req.query;
    if (!MONTH_RE.test(month || '')) return bad(res, 'month must be YYYY-MM');
    const reports = await Report.find({ date: { $regex: `^${month}-` } }).sort({ date: 1 });
    res.json(reports);
  } catch (e) {
    next(e);
  }
};

// GET /api/reports/range?from=2026-11-01&to=2026-11-19
export const listByRange = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!DATE_RE.test(from || '') || !DATE_RE.test(to || '')) {
      return bad(res, 'from and to must be YYYY-MM-DD');
    }
    const reports = await Report.find({ date: { $gte: from, $lte: to } }).sort({ date: 1 });
    res.json(reports);
  } catch (e) {
    next(e);
  }
};

// PUT /api/reports/:date  (create or update - one report per day)
export const upsertReport = async (req, res, next) => {
  try {
    const { date } = req.params;
    const { project = '', content = '' } = req.body || {};
    if (!DATE_RE.test(date)) return bad(res, 'date must be YYYY-MM-DD');
    if (!content.trim()) return bad(res, 'Report content cannot be empty');

    const report = await Report.findOneAndUpdate(
      { date },
      { project, content },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(report);
  } catch (e) {
    next(e);
  }
};

// DELETE /api/reports/:date
export const deleteReport = async (req, res, next) => {
  try {
    const { date } = req.params;
    if (!DATE_RE.test(date)) return bad(res, 'date must be YYYY-MM-DD');
    await Report.deleteOne({ date });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
};
