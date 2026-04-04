// ── Shared helpers ────────────────────────────────────────────────────────────

function parseCVBlocks(text) {
  const blocks = [];
  let currentSection = null;

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      if (currentSection) currentSection.lines.push('');
      continue;
    }
    if (/^[A-ZÄÖÜÉ\s]{4,}$/.test(trimmed) && trimmed.length < 35) {
      if (currentSection) blocks.push(currentSection);
      currentSection = { heading: trimmed, lines: [] };
    } else if (!currentSection) {
      const header = blocks.find((b) => b.type === 'header');
      if (!header) blocks.push({ type: 'header', lines: [trimmed] });
      else header.lines.push(trimmed);
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection) blocks.push(currentSection);
  return blocks;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// In docx, `size` is in half-points (1pt = 2 half-pts).
// `spacing` (after/before/line) is in twips (1pt = 20 twips).
const hp   = (pt) => Math.round(pt * 2);   // font size
const twip = (pt) => Math.round(pt * 20);  // spacing / margins

// ── Cover Letter PDF ──────────────────────────────────────────────────────────

export async function downloadCoverLetterPDF({ paragraphs, senderName, senderCity, date, company, jobTitle, language }) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();   // 210mm
  const ph  = doc.internal.pageSize.getHeight();  // 297mm
  const ml  = 25;
  const mr  = 25;
  const mt  = 22;   // tighter top margin
  const cw  = pw - ml - mr;

  const F = 'helvetica';

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 16) newPage(); }

  // Compute actual line height from jsPDF internals — avoids manual guessing
  // that causes gaps to grow proportionally with paragraph length.
  function lineH(fontSize) {
    doc.setFontSize(fontSize);
    return (doc.getLineHeight() / doc.internal.scaleFactor);
  }

  // ── Letterhead ────────────────────────────────────────────────────────────
  if (senderName) {
    doc.setFont(F, 'bold').setFontSize(10.5).setTextColor(18, 18, 18);
    doc.text(senderName, ml, y); y += lineH(10.5);
  }
  if (senderCity) {
    doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(110, 110, 110);
    doc.text(senderCity, ml, y); y += lineH(9.5);
  }

  // Date top-right
  doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(140, 140, 140);
  doc.text(date, pw - mr, mt, { align: 'right' });
  doc.setTextColor(18, 18, 18);

  y = Math.max(y, mt + lineH(9.5)) + 6;

  // ── Recipient ─────────────────────────────────────────────────────────────
  if (company) {
    doc.setFont(F, 'bold').setFontSize(10).setTextColor(18, 18, 18);
    doc.text(company, ml, y); y += lineH(10);
  }
  if (jobTitle) {
    const label = language === 'Deutsch' ? `Betr.: Bewerbung als ${jobTitle}` : `Re: ${jobTitle}`;
    doc.setFont(F, 'normal').setFontSize(9).setTextColor(110, 110, 110);
    doc.text(label, ml, y); y += lineH(9);
    doc.setTextColor(18, 18, 18);
  }

  // Thin rule
  y += 3;
  doc.setDrawColor(215, 215, 220).setLineWidth(0.25).line(ml, y, pw - mr, y);
  y += 5;

  // ── Body ──────────────────────────────────────────────────────────────────
  doc.setFont(F, 'normal').setFontSize(10.5).setTextColor(30, 30, 30);
  const BODY_LINE = lineH(10.5); // ~4.3mm — exact, not guessed
  const PARA_GAP  = 4.5;        // consistent gap between every paragraph

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, cw);
    const h = lines.length * BODY_LINE;
    guard(h + PARA_GAP);
    doc.text(lines, ml, y);
    y += h + PARA_GAP;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const pages = doc.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(F, 'normal').setFontSize(7).setTextColor(195, 195, 195);
    doc.text('Generated with CoverDraft', pw / 2, ph - 8, { align: 'center' });
  }

  doc.save(`cover-letter-${(company || 'letter').toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

// ── Cover Letter DOCX ─────────────────────────────────────────────────────────

export async function downloadCoverLetterDOCX({ paragraphs, senderName, senderCity, date, company, jobTitle, language }) {
  const { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } = await import('docx');

  const dark  = '141414';
  const mid   = '555555';
  const light = '999999';

  const children = [];

  // Header row — sender (bold, left) + date (right) via tab stop
  const headerRuns = [];
  if (senderName) {
    headerRuns.push(new TextRun({ text: senderName, bold: true, size: hp(10.5), color: dark }));
    headerRuns.push(new TextRun({ text: '\t', size: hp(10.5) }));
    headerRuns.push(new TextRun({ text: date, size: hp(9.5), color: light }));
  } else {
    headerRuns.push(new TextRun({ text: date, size: hp(9.5), color: light }));
  }
  children.push(new Paragraph({
    children: headerRuns,
    tabStops: [{ type: 'right', position: 9100 }],
    spacing: { after: senderCity ? twip(1) : twip(8) },
  }));

  if (senderCity) {
    children.push(new Paragraph({
      children: [new TextRun({ text: senderCity, size: hp(9.5), color: mid })],
      spacing: { after: twip(8) },
    }));
  }

  if (company) {
    children.push(new Paragraph({
      children: [new TextRun({ text: company, bold: true, size: hp(10), color: dark })],
      spacing: { after: jobTitle ? twip(1) : twip(6) },
    }));
  }
  if (jobTitle) {
    const label = language === 'Deutsch' ? `Betr.: Bewerbung als ${jobTitle}` : `Re: ${jobTitle}`;
    children.push(new Paragraph({
      children: [new TextRun({ text: label, size: hp(9), color: mid, italics: true })],
      spacing: { after: twip(8) },
    }));
  }

  // Separator line
  children.push(new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'DDDDDD' } },
    spacing: { after: twip(8) },
  }));

  // Body paragraphs
  for (const para of paragraphs) {
    children.push(new Paragraph({
      children: [new TextRun({ text: para, size: hp(10.5), color: dark })],
      spacing: { after: twip(6), line: 276 },  // 276 = 1.15× line spacing
    }));
  }

  // Footer
  children.push(new Paragraph({ children: [], spacing: { after: twip(16) } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Generated with CoverDraft', size: hp(7.5), color: 'CCCCCC' })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top:    twip(28),  // ~1 inch
            bottom: twip(25),
            left:   twip(32),
            right:  twip(28),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `cover-letter-${(company || 'letter').toLowerCase().replace(/\s+/g, '-')}.docx`);
}

// ── CV PDF ────────────────────────────────────────────────────────────────────

export async function downloadCVPDF(rawText) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();   // 210mm
  const ph  = doc.internal.pageSize.getHeight();  // 297mm
  const ml  = 20;
  const mr  = 20;
  const mt  = 20;
  const cw  = pw - ml - mr;  // 170mm usable width

  const F      = 'helvetica';
  const INDIGO = [55, 48, 163];
  const LINE   = 5.4;  // mm per body line

  // NOTE: jsPDF built-in fonts are Latin-1 (ISO-8859-1).
  // Unicode-only chars like ▸ (U+25B8) render as '%'. Use only Latin-1 safe chars.
  const BULLET = '-';  // safe Latin-1 bullet

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 14) newPage(); }

  // Helper: split + render text, always respecting cw
  function renderText(text, x, fontSize, style, color, indent = 0) {
    doc.setFont(F, style).setFontSize(fontSize).setTextColor(...color);
    const lines = doc.splitTextToSize(text, cw - indent);
    doc.text(lines, x + indent, y);
    return lines.length;
  }

  const blocks = parseCVBlocks(rawText);

  for (const block of blocks) {
    // ── Name / contact header ────────────────────────────────────────────────
    if (block.type === 'header') {
      block.lines.forEach((line, i) => {
        if (i === 0) {
          // Name — large, bold
          doc.setFont(F, 'bold').setFontSize(20).setTextColor(15, 15, 15);
          const nameLines = doc.splitTextToSize(line, cw);
          doc.text(nameLines, ml, y);
          y += nameLines.length * 8.5;
        } else {
          // Contact line — split if too long
          doc.setFont(F, 'normal').setFontSize(9).setTextColor(100, 100, 100);
          const contactLines = doc.splitTextToSize(line, cw);
          doc.text(contactLines, ml, y);
          y += contactLines.length * 4.8;
        }
      });
      // Indigo rule
      y += 2;
      doc.setDrawColor(...INDIGO).setLineWidth(0.7).line(ml, y, pw - mr, y);
      y += 6;
      continue;
    }

    // ── Section heading ──────────────────────────────────────────────────────
    guard(11);
    doc.setFont(F, 'bold').setFontSize(7.5).setTextColor(...INDIGO);
    doc.text(block.heading, ml, y);
    y += 1.5;
    doc.setDrawColor(180, 180, 220).setLineWidth(0.2).line(ml, y, pw - mr, y);
    y += 5;

    // ── Lines within section ─────────────────────────────────────────────────
    for (const raw of block.lines) {
      const line = raw.trim();
      if (!line) { y += 1.5; continue; }

      // Bullet point
      if (line.startsWith('-')) {
        const txt   = line.slice(1).trim();
        doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(txt, cw - 5);
        const h     = lines.length * LINE;
        guard(h);
        doc.text(BULLET, ml + 0.5, y);
        doc.text(lines, ml + 4.5, y);
        y += h + 1.2;
        continue;
      }

      // Role line: Title | Company | Period
      // Rendered as two rows to avoid overflow:
      //   Row 1: Title (bold, left)       Period (gray, right)
      //   Row 2: Company (gray, left)
      if (line.includes('|')) {
        guard(12);
        const parts = line.split('|').map((p) => p.trim());
        const title   = parts[0] || '';
        const company = parts[1] || '';
        const period  = parts[2] || '';

        // Row 1: Title + Period
        doc.setFont(F, 'bold').setFontSize(10).setTextColor(20, 20, 20);
        // Clamp title to leave room for period
        const periodWidth = period
          ? doc.setFont(F, 'normal').setFontSize(8.5).getTextWidth(period) + 2
          : 0;
        doc.setFont(F, 'bold').setFontSize(10).setTextColor(20, 20, 20);
        const titleLines = doc.splitTextToSize(title, cw - periodWidth - 3);
        doc.text(titleLines, ml, y);
        if (period) {
          doc.setFont(F, 'normal').setFontSize(8.5).setTextColor(140, 140, 140);
          doc.text(period, pw - mr, y, { align: 'right' });
        }
        y += titleLines.length * LINE;

        // Row 2: Company
        if (company) {
          doc.setFont(F, 'normal').setFontSize(9).setTextColor(100, 100, 100);
          const compLines = doc.splitTextToSize(company, cw);
          doc.text(compLines, ml, y);
          y += compLines.length * 4.8;
        }
        y += 1;
        continue;
      }

      // Regular text line
      doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(65, 65, 65);
      const lines = doc.splitTextToSize(line, cw);
      const h     = lines.length * LINE;
      guard(h);
      doc.text(lines, ml, y);
      y += h + 1;
    }
    y += 4;
  }

  // Footer on every page
  const pages = doc.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(F, 'normal').setFontSize(7).setTextColor(195, 195, 195);
    doc.text('Generated with CoverDraft', pw / 2, ph - 6, { align: 'center' });
  }

  doc.save('cv-optimized.pdf');
}

// ── CV DOCX ───────────────────────────────────────────────────────────────────

export async function downloadCVDOCX(rawText) {
  const {
    Document, Paragraph, TextRun, Packer, AlignmentType,
    BorderStyle, TabStopType,
  } = await import('docx');

  const dark   = '111111';
  const indigo = '3730A3';
  const mid    = '555555';
  const light  = '888888';

  const blocks   = parseCVBlocks(rawText);
  const children = [];

  for (const block of blocks) {
    if (block.type === 'header') {
      block.lines.forEach((line, i) => {
        children.push(new Paragraph({
          children: [new TextRun({
            text:  line,
            bold:  i === 0,
            size:  i === 0 ? hp(18) : hp(9.5),
            color: i === 0 ? dark : mid,
          })],
          spacing: { after: i === 0 ? twip(2) : twip(2) },
        }));
      });
      children.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: indigo } },
        spacing: { after: twip(8) },
      }));
      continue;
    }

    // Section heading
    children.push(new Paragraph({
      children: [new TextRun({ text: block.heading, bold: true, size: hp(7.5), color: indigo, allCaps: true })],
      border:   { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'CCCCFF' } },
      spacing:  { after: twip(5) },
    }));

    for (const raw of block.lines) {
      const line = raw.trim();
      if (!line) { children.push(new Paragraph({ children: [], spacing: { after: twip(2) } })); continue; }

      if (line.startsWith('-')) {
        children.push(new Paragraph({
          children: [new TextRun({ text: line.slice(1).trim(), size: hp(9.5), color: mid })],
          bullet:   { level: 0 },
          spacing:  { after: twip(2) },
        }));
        continue;
      }

      if (line.includes('|')) {
        const parts   = line.split('|').map((p) => p.trim());
        const title   = parts[0] || '';
        const company = parts[1] || '';
        const period  = parts[2] || '';

        // Row 1: Title (bold left) + Period (gray right via tab)
        const row1Runs = [new TextRun({ text: title, bold: true, size: hp(10), color: dark })];
        if (period) {
          row1Runs.push(new TextRun({ text: '\t', size: hp(9) }));
          row1Runs.push(new TextRun({ text: period, size: hp(8.5), color: light }));
        }
        children.push(new Paragraph({
          children:  row1Runs,
          tabStops:  [{ type: TabStopType.RIGHT, position: 9100 }],
          spacing:   { after: twip(1) },
          border:    { top: { style: BorderStyle.SINGLE, size: 2, color: 'EEEEEE' } },
        }));

        // Row 2: Company (gray, smaller)
        if (company) {
          children.push(new Paragraph({
            children: [new TextRun({ text: company, size: hp(9), color: mid })],
            spacing:  { after: twip(2) },
          }));
        }
        continue;
      }

      children.push(new Paragraph({
        children: [new TextRun({ text: line, size: hp(9.5), color: mid })],
        spacing:  { after: twip(2) },
      }));
    }

    children.push(new Paragraph({ children: [], spacing: { after: twip(7) } }));
  }

  children.push(new Paragraph({
    children: [new TextRun({ text: 'Generated with CoverDraft', size: hp(7.5), color: 'CCCCCC' })],
    alignment: AlignmentType.CENTER,
    spacing:   { before: twip(18) },
  }));

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top:    twip(25),
            bottom: twip(22),
            left:   twip(28),
            right:  twip(25),
          },
        },
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, 'cv-optimized.docx');
}
