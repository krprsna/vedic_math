// Add state to track active problem and profile
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
const [profileId, setProfileId] = useState(1); // Set from selected active profile
const [problem, setProblem] = useState(null);
const [loading, setLoading] = useState(true);

// Fetch Next Problem from API
const fetchNextProblem = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/problems/next?profileId=${profileId}`);
    const data = await res.json();
    if (data.success) {
      setProblem(data.problem);
      setCurrentStep(0);
      setStepInputs({});
      setFinalAnswer('');
      setFeedback(null);
    }
  } catch (err) {
    console.error('Failed to load problem', err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchNextProblem();
}, [profileId]);

// Update handleFinalSubmit to post attempt to server
const handleFinalSubmit = async () => {
  const isCorrect = finalAnswer.trim() === String(problem.correctAnswer);
  
  const response = await fetch('/api/attempts/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profileId,
      problemId: problem.id,
      submittedAnswer: finalAnswer,
      digitSumVerified: true,
      failedAtStep: isCorrect ? null : currentStep + 1,
      timeTakenSeconds: 25
    })
  });

  const result = await response.json();

  if (result.isCorrect) {
    setFeedback({ type: 'success', text: result.feedbackMessage });
    setShowDigitSumCheck(false);
    setTimeout(() => fetchNextProblem(), 2000); // Load next sum after 2s
  } else {
    setFeedback({ type: 'error', text: result.feedbackMessage });
    setShowDigitSumCheck(false);
    if (result.retryProblem) {
      setProblem(result.retryProblem); // Instantly switch to adaptive retry problem
    }
  }
};
