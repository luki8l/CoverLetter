// ── Shared helpers ────────────────────────────────────────────────────────────

/**
 * Parse the CV raw text into blocks matching CVPreview's logic.
 */
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

// ── Cover Letter PDF ──────────────────────────────────────────────────────────

export async function downloadCoverLetterPDF({ paragraphs, senderName, senderCity, date, company, jobTitle, language }) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw  = doc.internal.pageSize.getWidth();
  const ph  = doc.internal.pageSize.getHeight();
  const ml  = 28;
  const mr  = 28;
  const mt  = 32;
  const cw  = pw - ml - mr;

  const LINE = 6.4;
  const GAP  = 5.5;
  const F    = 'helvetica';

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 18) newPage(); }

  // ── Letterhead ────────────────────────────────────────────────────────────
  if (senderName) {
    doc.setFont(F, 'bold').setFontSize(11).setTextColor(18, 18, 18);
    doc.text(senderName, ml, y); y += LINE;
  }
  if (senderCity) {
    doc.setFont(F, 'normal').setFontSize(10).setTextColor(110, 110, 110);
    doc.text(senderCity, ml, y); y += LINE;
  }

  doc.setFont(F, 'normal').setFontSize(10).setTextColor(140, 140, 140);
  doc.text(date, pw - mr, mt, { align: 'right' });
  doc.setTextColor(18, 18, 18);

  y = Math.max(y, mt + LINE) + 10;

  // ── Recipient ─────────────────────────────────────────────────────────────
  if (company) {
    doc.setFont(F, 'bold').setFontSize(10.5).setTextColor(18, 18, 18);
    doc.text(company, ml, y); y += LINE;
  }
  if (jobTitle) {
    const label = language === 'Deutsch' ? `Betr.: Bewerbung als ${jobTitle}` : `Re: ${jobTitle}`;
    doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(110, 110, 110);
    doc.text(label, ml, y); y += LINE;
    doc.setTextColor(18, 18, 18);
  }

  // Thin rule
  y += 5;
  doc.setDrawColor(210, 210, 215).setLineWidth(0.25).line(ml, y, pw - mr, y);
  y += 8;

  // ── Body ──────────────────────────────────────────────────────────────────
  doc.setFont(F, 'normal').setFontSize(11).setTextColor(32, 32, 32);

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, cw);
    const h = lines.length * LINE;
    guard(h + GAP);
    doc.text(lines, ml, y);
    y += h + GAP;
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const pages = doc.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(F, 'normal').setFontSize(7.5).setTextColor(190, 190, 190);
    doc.text('Generated with CoverDraft', pw / 2, ph - 8, { align: 'center' });
  }

  doc.save(`cover-letter-${(company || 'letter').toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

// ── Cover Letter DOCX ─────────────────────────────────────────────────────────

export async function downloadCoverLetterDOCX({ paragraphs, senderName, senderCity, date, company, jobTitle, language }) {
  const { Document, Paragraph, TextRun, Packer, AlignmentType, BorderStyle } = await import('docx');

  const dark = '141414';
  const mid  = '555555';
  const gray = '999999';
  const PT   = (n) => n * 20; // points → twips

  const children = [];

  // Header row — sender + date on same line via tab stop
  const headerRuns = [];
  if (senderName) {
    headerRuns.push(new TextRun({ text: senderName, bold: true, size: PT(11), color: dark }));
    headerRuns.push(new TextRun({ text: '\t', size: PT(11) }));
    headerRuns.push(new TextRun({ text: date, size: PT(10), color: gray }));
  } else {
    headerRuns.push(new TextRun({ text: date, size: PT(10), color: gray }));
  }
  children.push(new Paragraph({
    children: headerRuns,
    tabStops: [{ type: 'right', position: 9100 }],
    spacing: { after: senderCity ? PT(1) : PT(10) },
  }));

  if (senderCity) {
    children.push(new Paragraph({
      children: [new TextRun({ text: senderCity, size: PT(10), color: mid })],
      spacing: { after: PT(12) },
    }));
  }

  if (company) {
    children.push(new Paragraph({
      children: [new TextRun({ text: company, bold: true, size: PT(10.5), color: dark })],
      spacing: { after: jobTitle ? PT(2) : PT(10) },
    }));
  }
  if (jobTitle) {
    const label = language === 'Deutsch' ? `Betr.: Bewerbung als ${jobTitle}` : `Re: ${jobTitle}`;
    children.push(new Paragraph({
      children: [new TextRun({ text: label, size: PT(9.5), color: mid, italics: true })],
      spacing: { after: PT(12) },
    }));
  }

  // Separator
  children.push(new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'DDDDDD' } },
    spacing: { after: PT(12) },
  }));

  // Body
  for (const para of paragraphs) {
    children.push(new Paragraph({
      children: [new TextRun({ text: para, size: PT(11), color: dark })],
      spacing: { after: PT(8), line: 320 },
    }));
  }

  // Footer
  children.push(new Paragraph({ children: [], spacing: { after: PT(24) } }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Generated with CoverDraft', size: PT(8), color: 'CCCCCC' })],
    alignment: AlignmentType.CENTER,
  }));

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1200, bottom: 1100, left: 1300, right: 1200 } } },
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
  const ml  = 22;
  const mr  = 22;
  const mt  = 24;
  const cw  = pw - ml - mr;

  const F      = 'helvetica';
  const INDIGO = [55, 48, 163];
  const LINE   = 5.8;

  let y = mt;

  function newPage() { doc.addPage(); y = mt; }
  function guard(h)  { if (y + h > ph - 15) newPage(); }

  const blocks = parseCVBlocks(rawText);

  for (const block of blocks) {
    // ── Header block (name / contact) ───────────────────────────────────────
    if (block.type === 'header') {
      block.lines.forEach((line, i) => {
        if (i === 0) {
          doc.setFont(F, 'bold').setFontSize(20).setTextColor(15, 15, 15);
          doc.text(line, ml, y); y += 9;
        } else {
          doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(100, 100, 100);
          doc.text(line, ml, y); y += 5.5;
        }
      });
      // Rule below header
      y += 2;
      doc.setDrawColor(...INDIGO).setLineWidth(0.7).line(ml, y, pw - mr, y);
      y += 7;
      continue;
    }

    // ── Section ─────────────────────────────────────────────────────────────
    guard(12);
    doc.setFont(F, 'bold').setFontSize(7.5).setTextColor(...INDIGO);
    doc.text(block.heading, ml, y); y += 1.5;
    doc.setDrawColor(180, 180, 220).setLineWidth(0.2).line(ml, y, pw - mr, y);
    y += 5;

    // ── Lines ────────────────────────────────────────────────────────────────
    for (const raw of block.lines) {
      const line = raw.trim();
      if (!line) { y += 2; continue; }

      // Bullet
      if (line.startsWith('-')) {
        const txt   = line.slice(1).trim();
        const lines = doc.splitTextToSize(txt, cw - 5);
        const h     = lines.length * LINE;
        guard(h);
        doc.setFont(F, 'normal').setFontSize(10).setTextColor(60, 60, 60);
        doc.text('▸', ml, y);
        doc.text(lines, ml + 4.5, y);
        y += h + 1.5;
        continue;
      }

      // Role line (Title | Company | Period)
      if (line.includes('|')) {
        guard(8);
        const parts = line.split('|').map((p) => p.trim());
        doc.setFont(F, 'bold').setFontSize(10.5).setTextColor(20, 20, 20);
        doc.text(parts[0], ml, y);
        if (parts[1]) {
          doc.setFont(F, 'normal').setFontSize(9.5).setTextColor(90, 90, 90);
          doc.text(`· ${parts[1]}`, ml + doc.getTextWidth(parts[0]) + 2, y);
        }
        if (parts[2]) {
          doc.setFont(F, 'normal').setFontSize(9).setTextColor(140, 140, 140);
          doc.text(parts[2], pw - mr, y, { align: 'right' });
        }
        y += LINE + 1;
        continue;
      }

      // Regular line
      const lines = doc.splitTextToSize(line, cw);
      const h     = lines.length * LINE;
      guard(h);
      doc.setFont(F, 'normal').setFontSize(10).setTextColor(70, 70, 70);
      doc.text(lines, ml, y);
      y += h + 1.5;
    }
    y += 5;
  }

  // Footer
  const pages = doc.internal.pages.length - 1;
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont(F, 'normal').setFontSize(7.5).setTextColor(190, 190, 190);
    doc.text('Generated with CoverDraft', pw / 2, ph - 7, { align: 'center' });
  }

  doc.save('cv-optimized.pdf');
}

// ── CV DOCX ───────────────────────────────────────────────────────────────────

export async function downloadCVDOCX(rawText) {
  const {
    Document, Paragraph, TextRun, Packer, AlignmentType,
    BorderStyle, TabStopType,
  } = await import('docx');

  const PT    = (n) => n * 20;
  const dark  = '111111';
  const indigo = '3730A3';
  const mid   = '555555';
  const light = '999999';

  const blocks = parseCVBlocks(rawText);
  const children = [];

  for (const block of blocks) {
    if (block.type === 'header') {
      block.lines.forEach((line, i) => {
        children.push(new Paragraph({
          children: [new TextRun({
            text: line,
            bold: i === 0,
            size: i === 0 ? PT(20) : PT(10),
            color: i === 0 ? dark : mid,
          })],
          spacing: { after: i === 0 ? PT(2) : PT(3) },
        }));
      });
      // Rule
      children.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: indigo } },
        spacing: { after: PT(10) },
      }));
      continue;
    }

    // Section heading
    children.push(new Paragraph({
      children: [new TextRun({ text: block.heading, bold: true, size: PT(8), color: indigo, allCaps: true })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: 'CCCCFF' } },
      spacing: { after: PT(6) },
    }));

    for (const raw of block.lines) {
      const line = raw.trim();
      if (!line) { children.push(new Paragraph({ children: [], spacing: { after: PT(2) } })); continue; }

      // Bullet
      if (line.startsWith('-')) {
        children.push(new Paragraph({
          children: [new TextRun({ text: line.slice(1).trim(), size: PT(10), color: mid })],
          bullet: { level: 0 },
          spacing: { after: PT(2) },
        }));
        continue;
      }

      // Role line
      if (line.includes('|')) {
        const parts = line.split('|').map((p) => p.trim());
        const runs = [
          new TextRun({ text: parts[0], bold: true, size: PT(10.5), color: dark }),
        ];
        if (parts[1]) runs.push(new TextRun({ text: `  ·  ${parts[1]}`, size: PT(9.5), color: mid }));
        if (parts[2]) {
          runs.push(new TextRun({ text: '\t', size: PT(9.5) }));
          runs.push(new TextRun({ text: parts[2], size: PT(9), color: light }));
        }
        children.push(new Paragraph({
          children: runs,
          tabStops: [{ type: TabStopType.RIGHT, position: 9100 }],
          spacing: { after: PT(3) },
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: 'EEEEEE' } },
        }));
        continue;
      }

      // Regular line
      children.push(new Paragraph({
        children: [new TextRun({ text: line, size: PT(10), color: mid })],
        spacing: { after: PT(2) },
      }));
    }

    children.push(new Paragraph({ children: [], spacing: { after: PT(8) } }));
  }

  // Footer
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Generated with CoverDraft', size: PT(8), color: 'CCCCCC' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: PT(20) },
  }));

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 900, bottom: 900, left: 1100, right: 1000 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, 'cv-optimized.docx');
}

// ── Utility ───────────────────────────────────────────────────────────────────

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href    = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
