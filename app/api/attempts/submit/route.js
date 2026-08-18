export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { answer, expected } = body;

    const isCorrect = String(answer).trim() === String(expected).trim();

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      message: isCorrect ? 'Great job!' : 'Try again.'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
