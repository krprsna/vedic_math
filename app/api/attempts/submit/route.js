import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      profileId,
      problemId,
      submittedAnswer,
      digitSumVerified,
      failedAtStep,
      timeTakenSeconds
    } = body;

    if (!profileId || !problemId || submittedAnswer === undefined) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Fetch exact problem from DB
    const probResult = await sql`
      SELECT * FROM vedic_math.problem_bank WHERE id = ${problemId};
    `;
    const problem = probResult.rows[0];

    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    const isCorrect = Number(submittedAnswer) === Number(problem.correct_answer);

    // 2. Log Attempt in student_attempts table
    await sql`
      INSERT INTO vedic_math.student_attempts 
        (profile_id, problem_id, submitted_answer, is_correct, digit_sum_verified, failed_at_step, time_taken_seconds)
      VALUES 
        (${profileId}, ${problemId}, ${submittedAnswer}, ${isCorrect}, ${digitSumVerified || false}, ${failedAtStep || null}, ${timeTakenSeconds || 0});
    `;

    // 3. Update SRS Schedule for this Profile & Sutra
    const srsQuery = await sql`
      SELECT * FROM vedic_math.profile_srs_queue 
      WHERE profile_id = ${profileId} AND sutra_id = ${problem.sutra_id};
    `;

    let easeFactor = 2.50;
    let intervalDays = 1;

    if (srsQuery.rows.length > 0) {
      const currentSRS = srsQuery.rows[0];
      easeFactor = Number(currentSRS.ease_factor);
      intervalDays = Number(currentSRS.review_interval_days);

      if (isCorrect) {
        // Successful attempt -> Extend interval
        intervalDays = Math.round(intervalDays * easeFactor);
        easeFactor = Math.min(2.80, easeFactor + 0.10);
      } else {
        // Failed attempt -> Reset interval to 1 day, lower ease factor
        intervalDays = 1;
        easeFactor = Math.max(1.30, easeFactor - 0.20);
      }

      await sql`
        UPDATE vedic_math.profile_srs_queue
        SET ease_factor = ${easeFactor},
            review_interval_days = ${intervalDays},
            next_review_due = CURRENT_TIMESTAMP + (${intervalDays} || ' days')::INTERVAL,
            mastery_level = ${isCorrect && intervalDays > 7 ? 'Mastered' : 'Learning'}
        WHERE id = ${currentSRS.id};
      `;
    } else {
      // First attempt for this Sutra -> Create SRS record
      await sql`
        INSERT INTO vedic_math.profile_srs_queue
          (profile_id, sutra_id, ease_factor, review_interval_days, next_review_due, mastery_level)
        VALUES
          (${profileId}, ${problem.sutra_id}, ${isCorrect ? 2.60 : 2.30}, ${isCorrect ? 2 : 1}, CURRENT_TIMESTAMP + (${isCorrect ? 2 : 1} || ' days')::INTERVAL, 'Learning');
      `;
    }

    // 4. If incorrect, fetch a retry problem of the exact same Sutra
    let retryProblem = null;
    if (!isCorrect) {
      const retryResult = await sql`
        SELECT pb.*, s.title as sutra_title, s.sanskrit_name
        FROM vedic_math.problem_bank pb
        JOIN vedic_math.sutras s ON pb.sutra_id = s.id
        WHERE pb.sutra_id = ${problem.sutra_id} AND pb.id != ${problemId}
        ORDER BY RANDOM()
        LIMIT 1;
      `;
      if (retryResult.rows.length > 0) {
        const rp = retryResult.rows[0];
        retryProblem = {
          id: rp.id,
          sutraId: rp.sutra_id,
          title: rp.sutra_title,
          sanskritName: rp.sanskrit_name,
          problemText: rp.problem_text,
          correctAnswer: rp.correct_answer,
          steps: typeof rp.step_by_step_solution === 'string' ? JSON.parse(rp.step_by_step_solution) : rp.step_by_step_solution,
          socraticHints: typeof rp.socratic_hints === 'string' ? JSON.parse(rp.socratic_hints) : rp.socratic_hints
        };
      }
    }

    return NextResponse.json({
      success: true,
      isCorrect,
      feedbackMessage: isCorrect 
        ? "Awesome job! You got it 100% correct." 
        : `Silly mistake detected at step ${failedAtStep || 1}. Let's try a similar sum to fix this!`,
      srsNextDueDays: intervalDays,
      retryProblem
    });

  } catch (error) {
    console.error('Error submitting attempt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
