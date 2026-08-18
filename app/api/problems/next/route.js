export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const problem = {
    id: 101,
    sutra: 'Ekadhikena Purvena',
    expression: '69 x 11',
    steps: [
      { step: 1, prompt: 'Add 6 + 9', answer: '15' },
      { step: 2, prompt: 'Combine with carry over', answer: '759' }
    ]
  };

  return NextResponse.json({ success: true, problem });
}
