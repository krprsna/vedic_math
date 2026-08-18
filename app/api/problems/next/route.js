import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');
    const specificSutraId = searchParams.get('sutraId');

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    let problem;

    // 1. Check if user requested a specific Sutra or has an SRS item due
    if (specificSutraId) {
      const result = await sql`
        SELECT pb.*, s.title as sutra_title, s.sanskrit_name
        FROM vedic_math.problem_bank pb
        JOIN vedic_math.sutras s ON pb.sutra_id = s.id
        WHERE pb.sutra_id = ${specificSutraId}
        ORDER BY RANDOM()
        LIMIT 1;
      `;
      problem = result.rows[0];
    } else {
      // Fetch problem based on due SRS items or lowest mastery percentage
      const srsResult = await sql`
        SELECT pb.*, s.title as sutra_title, s.sanskrit_name
        FROM vedic_math.profile_srs_queue srs
        JOIN vedic_math.problem_bank pb ON srs.sutra_id = pb.sutra_id
        JOIN vedic_math.sutras s ON pb.sutra_id = s.id
        WHERE srs.profile_id = ${profileId}
          AND srs.next_review_due <= CURRENT_TIMESTAMP
        ORDER BY srs.next_review_due ASC
        LIMIT 1;
      `;

      if (srsResult.rows.length > 0) {
        problem = srsResult.rows[0];
      } else {
        // Fallback: Random problem from basic tier
        const defaultResult = await sql`
          SELECT pb.*, s.title as sutra_title, s.sanskrit_name
          FROM vedic_math.problem_bank pb
          JOIN vedic_math.sutras s ON pb.sutra_id = s.id
          ORDER BY RANDOM()
          LIMIT 1;
        `;
        problem = defaultResult.rows[0];
      }
    }

    if (!problem) {
      return NextResponse.json({ error: 'No problems found in database' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      problem: {
        id: problem.id,
        sutraId: problem.sutra_id,
        title: problem.sutra_title,
        sanskritName: problem.sanskrit_name,
        problemText: problem.problem_text,
        correctAnswer: problem.correct_answer,
        steps: typeof problem.step_by_step_solution === 'string' 
          ? JSON.parse(problem.step_by_step_solution) 
          : problem.step_by_step_solution,
        socraticHints: typeof problem.socratic_hints === 'string'
          ? JSON.parse(problem.socratic_hints)
          : problem.socratic_hints
      }
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
