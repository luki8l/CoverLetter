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

  const LINE = 6.0;   // mm per text line
  const GAP  = 3.5;   // mm between paragraphs (was 5.5 — too big)
  const F    = 'helvetica';

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 16) newPage(); }

  // ── Letterhead ────────────────────────────────────────────────────────────
  if (senderName) {
    doc.setFont(F, 'bold').setFontSize(10.5).setTextColor(18, 18, 18);
    doc.text(senderName, ml, y); y += 5.5;
  }
  if (senderCity) {
    doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(110, 110, 110);
    doc.text(senderCity, ml, y); y += 5.5;
  }

  // Date top-right
  doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(140, 140, 140);
  doc.text(date, pw - mr, mt, { align: 'right' });
  doc.setTextColor(18, 18, 18);

  y = Math.max(y, mt + 5.5) + 7;

  // ── Recipient ─────────────────────────────────────────────────────────────
  if (company) {
    doc.setFont(F, 'bold').setFontSize(10).setTextColor(18, 18, 18);
    doc.text(company, ml, y); y += 5.5;
  }
  if (jobTitle) {
    const label = language === 'Deutsch' ? `Betr.: Bewerbung als ${jobTitle}` : `Re: ${jobTitle}`;
    doc.setFont(F, 'normal').setFontSize(9).setTextColor(110, 110, 110);
    doc.text(label, ml, y); y += 5;
    doc.setTextColor(18, 18, 18);
  }

  // Thin rule
  y += 4;
  doc.setDrawColor(215, 215, 220).setLineWidth(0.25).line(ml, y, pw - mr, y);
  y += 6;

  // ── Body ──────────────────────────────────────────────────────────────────
  doc.setFont(F, 'normal').setFontSize(10.5).setTextColor(30, 30, 30);

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, cw);
    const h = lines.length * LINE;
    guard(h + GAP);
    doc.text(lines, ml, y);
    y += h + GAP;
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
  const pw  = doc.internal.pageSize.getWidth();
  const ph  = doc.internal.pageSize.getHeight();
  const ml  = 20;
  const mr  = 20;
  const mt  = 20;
  const cw  = pw - ml - mr;

  const F      = 'helvetica';
  const INDIGO = [55, 48, 163];
  const LINE   = 5.6;

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 14) newPage(); }

  const blocks = parseCVBlocks(rawText);

  for (const block of blocks) {
    if (block.type === 'header') {
      block.lines.forEach((line, i) => {
        if (i === 0) {
          doc.setFont(F, 'bold').setFontSize(19).setTextColor(15, 15, 15);
          doc.text(line, ml, y); y += 8.5;
        } else {
          doc.setFont(F, 'normal').setFontSize(9).setTextColor(100, 100, 100);
          doc.text(line, ml, y); y += 5;
        }
      });
      y += 2;
      doc.setDrawColor(...INDIGO).setLineWidth(0.6).line(ml, y, pw - mr, y);
      y += 6;
      continue;
    }

    guard(11);
    doc.setFont(F, 'bold').setFontSize(7.5).setTextColor(...INDIGO);
    doc.text(block.heading, ml, y); y += 1.5;
    doc.setDrawColor(180, 180, 220).setLineWidth(0.2).line(ml, y, pw - mr, y);
    y += 4.5;

    for (const raw of block.lines) {
      const line = raw.trim();
      if (!line) { y += 1.5; continue; }

      if (line.startsWith('-')) {
        const txt   = line.slice(1).trim();
        const lines = doc.splitTextToSize(txt, cw - 5);
        const h     = lines.length * LINE;
        guard(h);
        doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(60, 60, 60);
        doc.text('▸', ml, y);
        doc.text(lines, ml + 4.5, y);
        y += h + 1;
        continue;
      }

      if (line.includes('|')) {
        guard(7);
        const parts = line.split('|').map((p) => p.trim());
        doc.setFont(F, 'bold').setFontSize(10).setTextColor(20, 20, 20);
        doc.text(parts[0], ml, y);
        if (parts[1]) {
          doc.setFont(F, 'normal').setFontSize(9).setTextColor(90, 90, 90);
          doc.text(`· ${parts[1]}`, ml + doc.getTextWidth(parts[0]) + 2, y);
        }
        if (parts[2]) {
          doc.setFont(F, 'normal').setFontSize(8.5).setTextColor(140, 140, 140);
          doc.text(parts[2], pw - mr, y, { align: 'right' });
        }
        y += LINE + 0.5;
        continue;
      }

      const lines = doc.splitTextToSize(line, cw);
      const h     = lines.length * LINE;
      guard(h);
      doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(70, 70, 70);
      doc.text(lines, ml, y);
      y += h + 1;
    }
    y += 4;
  }

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
        const parts = line.split('|').map((p) => p.trim());
        const runs  = [
          new TextRun({ text: parts[0], bold: true, size: hp(10), color: dark }),
        ];
        if (parts[1]) runs.push(new TextRun({ text: `  ·  ${parts[1]}`, size: hp(9.5), color: mid }));
        if (parts[2]) {
          runs.push(new TextRun({ text: '\t', size: hp(9.5) }));
          runs.push(new TextRun({ text: parts[2], size: hp(9), color: light }));
        }
        children.push(new Paragraph({
          children:  runs,
          tabStops:  [{ type: TabStopType.RIGHT, position: 9100 }],
          spacing:   { after: twip(2) },
          border:    { top: { style: BorderStyle.SINGLE, size: 2, color: 'EEEEEE' } },
        }));
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
