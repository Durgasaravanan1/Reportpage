import { jsPDF } from 'jspdf';
import { prettyDate, todayISO } from './dates.js';

const PINK = [219, 39, 119]; // pink-600
const PINK_LIGHT = [252, 231, 243]; // pink-100
const DARK = [55, 65, 81];

const clean = (s) =>
  s
    .replace(/\t/g, '    ')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/[^\x00-\x7F•–—]/g, ''); // jsPDF default fonts are Latin only

const isHeading = (line) =>
  /^\s*\d+\.\s+\S/.test(line) ||
  /^\s*(tasks completed|pending|overall status|blockers|notes|tomorrow)/i.test(line);

const bulletMatch = (line) => line.match(/^(\s*)[*\-•]\s+(.*)$/);

/**
 * Builds a PDF from an array of reports [{date, project, content}] and
 * downloads it automatically.
 */
export function downloadReportsPdf(reports, from, to) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 42;
  const contentW = W - M * 2;
  let y = 0;

  const newPage = () => {
    doc.addPage();
    y = M;
  };
  const ensure = (h) => {
    if (y + h > H - M) newPage();
  };

  // ---- Cover header ----
  doc.setFillColor(...PINK);
  doc.rect(0, 0, W, 110, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('Daily Work Report', M, 52);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${prettyDate(from)}  -  ${prettyDate(to)}`, M, 74);
  doc.text(
    `${reports.length} report${reports.length === 1 ? '' : 's'}   |   Generated ${prettyDate(todayISO())}`,
    M,
    92
  );
  y = 140;

  reports.forEach((r, idx) => {
    if (idx > 0) y += 12;
    ensure(60);

    // ---- Day banner ----
    doc.setFillColor(...PINK_LIGHT);
    doc.roundedRect(M, y, contentW, 30, 6, 6, 'F');
    doc.setFillColor(...PINK);
    doc.rect(M, y, 4, 30, 'F');
    doc.setTextColor(...PINK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12.5);
    doc.text(prettyDate(r.date), M + 14, y + 19);
    if (r.project) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(120, 53, 95);
      doc.text(clean(`Project: ${r.project}`), W - M - 10, y + 19, { align: 'right' });
    }
    y += 44;

    // ---- Body ----
    doc.setTextColor(...DARK);
    const lines = (r.content || '').split(/\r?\n/);
    lines.forEach((raw) => {
      const line = clean(raw);
      if (!line.trim()) {
        y += 6;
        return;
      }

      const heading = isHeading(line);
      const bullet = bulletMatch(line);
      let text = line.trim();
      let indent = 0;

      if (bullet) {
        indent = 14 + Math.min(Math.floor(bullet[1].length / 2), 3) * 12;
        text = bullet[2];
      }

      doc.setFont('helvetica', heading && !bullet ? 'bold' : 'normal');
      doc.setFontSize(heading && !bullet ? 11 : 10);
      doc.setTextColor(...(heading && !bullet ? PINK : DARK));

      const wrapW = contentW - indent - (bullet ? 12 : 0);
      const wrapped = doc.splitTextToSize(text, wrapW);
      const lh = 14;

      wrapped.forEach((w, i) => {
        ensure(lh);
        if (bullet && i === 0) {
          doc.setFillColor(...PINK);
          doc.circle(M + indent + 3, y - 3, 1.8, 'F');
        }
        doc.text(w, M + indent + (bullet ? 12 : 0), y);
        y += lh;
      });
    });
  });

  // ---- Footer: page numbers ----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pages}`, W / 2, H - 20, { align: 'center' });
  }

  doc.save(`daily-report_${from}_to_${to}.pdf`);
}
