import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic import — pdf-parse v2 exports a default function
    const { default: pdfParse } = await import('pdf-parse');
    const data = await pdfParse(buffer);

    const text = data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract text from this PDF. Try copying and pasting your CV text directly.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error('PDF parse error:', err);
    return NextResponse.json(
      { error: 'Failed to parse PDF. Try pasting your CV text directly.' },
      { status: 500 }
    );
  }
}
