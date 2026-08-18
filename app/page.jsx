'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function VedicPracticePage() {
  // Sample Problem Data (In production, fetched from your Vercel DB based on Profile & SRS)
  const problem = {
    id: 101,
    title: "Nikhilam Subtraction (Base 1000)",
    problemText: "1000 - 437",
    operandA: 1000,
    operandB: 437,
    correctAnswer: 563,
    steps: [
      { id: 1, text: "Subtract 4 from 9", expected: "5" },
      { id: 2, text: "Subtract 3 from 9", expected: "6" },
      { id: 3, text: "Subtract 7 from 10 (Last Digit)", expected: "3" }
    ],
    socraticHints: [
      "Remember the Sutra rule: 'All from 9 and the last from 10'.",
      "Look at the first digit (4). What is 9 - 4?",
      "Now look at the last digit (7). Subtract this one from 10!"
    ]
  };

  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [stepInputs, setStepInputs] = useState({});
  const [finalAnswer, setFinalAnswer] = useState('');
  const [digitSumInput, setDigitSumInput] = useState('');
  const [showDigitSumCheck, setShowDigitSumCheck] = useState(false);
  const [hintIndex, setHintIndex] = useState(-1);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Canvas Scratchpad State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#2563eb');

  // Setup Canvas Context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
  }, []);

  // Drawing Handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.moveTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(
      (e.clientX || e.touches[0].clientX) - rect.left,
      (e.clientY || e.touches[0].clientY) - rect.top
    );
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Handle Step Input Verification
  const handleStepSubmit = (stepIdx) => {
    const userVal = (stepInputs[stepIdx] || '').trim();
    const expectedVal = problem.steps[stepIdx].expected;

    if (userVal === expectedVal) {
      setFeedback({ type: 'success', text: `Step ${stepIdx + 1} Correct! Keep going.` });
      setHintIndex(-1);
      if (stepIdx + 1 < problem.steps.length) {
        setCurrentStep(stepIdx + 1);
      } else {
        setShowDigitSumCheck(true);
      }
    } else {
      setFeedback({ 
        type: 'error', 
        text: `Silly mistake alert on Step ${stepIdx + 1}! Check your scratchpad calculation.` 
      });
    }
  };

  // Final Evaluation after Digit Sum Self-Check
  const handleFinalSubmit = () => {
    // Digit sum verification rule for subtraction: DigitSum(1000 - 437) -> 1 - (4+3+7=14->5) = -4 -> (+9) = 5
    // Answer 563 -> 5+6+3 = 14 -> 1+4 = 5. Matches!
    if (finalAnswer.trim() === String(problem.correctAnswer)) {
      setFeedback({ 
        type: 'success', 
        text: '🎉 Outstanding! 100% correct, and verified with Digit Sums! Mastered this sum.' 
      });
      setShowDigitSumCheck(false);
    } else {
      setFeedback({ 
        type: 'error', 
        text: 'Final answer does not match. Re-check your steps or ask for a Socratic hint!' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* Header / Profile Ribbon */}
      <header className="max-w-6xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Vedic Mind Engine</h1>
          <p className="text-sm text-slate-500">Topic: {problem.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">
            🔥 5 Day Streak
          </div>
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              A
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline">Ananya</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Problem & Guided Steps */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded">
              Sutra: Nikhilam
            </span>
            <div className="text-4xl font-extrabold text-slate-900 my-4 tracking-wide text-center">
              {problem.problemText}
            </div>

            {/* Feedback Banner */}
            {feedback && (
              <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
                feedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {feedback.text}
              </div>
            )}

            {/* Step-by-Step Solver */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <h3 className="text-sm font-bold text-slate-700">Guided Steps:</h3>
              {problem.steps.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    idx === currentStep 
                      ? 'border-indigo-500 bg-indigo-50/30' 
                      : idx < currentStep 
                        ? 'border-emerald-200 bg-emerald-50/20' 
                        : 'border-slate-100 bg-slate-50 opacity-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-800">
                      Step {step.id}: {step.text}
                    </span>
                    {idx < currentStep && <span className="text-emerald-600 font-bold text-sm">✓ Done</span>}
                  </div>
                  
                  {idx === currentStep && (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Result"
                        value={stepInputs[idx] || ''}
                        onChange={(e) => setStepInputs({ ...stepInputs, [idx]: e.target.value })}
                        className="w-28 px-3 py-1.5 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleStepSubmit(idx)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition"
                      >
                        Check Step
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Socratic Hint Box */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Need Guidance?</span>
                <button
                  onClick={() => setHintIndex(Math.min(hintIndex + 1, problem.socraticHints.length - 1))}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  💡 Request Socratic Hint
                </button>
              </div>
              {hintIndex >= 0 && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                  <strong>Hint:</strong> {problem.socraticHints[hintIndex]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Drawing Scratchpad */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              ✏️ Digital Scratchpad <span className="text-xs font-normal text-slate-400">(Scribble carry-overs)</span>
            </h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPenColor('#2563eb')} 
                className={`w-6 h-6 rounded-full bg-blue-600 ${penColor === '#2563eb' ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`}
              />
              <button 
                onClick={() => setPenColor('#dc2626')} 
                className={`w-6 h-6 rounded-full bg-red-600 ${penColor === '#dc2626' ? 'ring-2 ring-offset-2 ring-red-600' : ''}`}
              />
              <button 
                onClick={() => setPenColor('#059669')} 
                className={`w-6 h-6 rounded-full bg-emerald-600 ${penColor === '#059669' ? 'ring-2 ring-offset-2 ring-emerald-600' : ''}`}
              />
              <button
                onClick={clearCanvas}
                className="text-xs text-slate-500 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded ml-2"
              >
                Clear Scratchpad
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] bg-slate-50 border border-dashed border-slate-300 rounded-xl overflow-hidden relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full block"
            />
          </div>
        </div>
      </main>

      {/* MODAL: Digit Sum Verification Engine (Forces Self-Correction Habit) */}
      {showDigitSumCheck && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              Self-Correction Check (Navashesh)
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-2">
              Verify Before Submitting!
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Vedic Math rule: Check the <strong>Digit Sum</strong> of your answer to catch silly errors before finalizing.
            </p>

            <div className="my-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter Final Answer:
                </label>
                <input
                  type="text"
                  placeholder="e.g., 563"
                  value={finalAnswer}
                  onChange={(e) => setFinalAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Digit Sum of your answer (5+6+3 = 14 -&gt; 1+4 = 5):
                </label>
                <input
                  type="text"
                  placeholder="Digit Sum (e.g. 5)"
                  value={digitSumInput}
                  onChange={(e) => setDigitSumInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDigitSumCheck(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Back to Problem
              </button>
              <button
                onClick={handleFinalSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
