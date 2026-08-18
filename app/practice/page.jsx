'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';

export default function PracticePage() {
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    canvas.width = canvas.parentElement?.clientWidth || 400;
    canvas.height = 200;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#818cf8';
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answerInput.trim() === '759') {
      setFeedback({ success: true, text: 'Correct! Excellent mental calculation.' });
    } else {
      setFeedback({ success: false, text: 'Not quite. Check the middle term addition.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Ekadhikena Purvena</h1>
            <p className="text-xs text-slate-400">Sutra 1 • Multiplication by 11</p>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-semibold">
            Level 1
          </span>
        </div>

        {/* Problem Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-6 text-center">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Solve Step 1</span>
          <div className="text-5xl font-extrabold text-white my-4">69 × 11</div>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Add the digits: 6 + 9 = 15. Keep 5 and carry over 1.
          </p>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter answer"
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition"
            >
              Check Answer
            </button>
          </div>
        </form>

        {feedback && (
          <div className={`p-4 rounded-xl border text-sm font-semibold mb-6 ${
            feedback.success 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* Scratchpad Canvas */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400">Digital Scratchpad</span>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Clear Workspace
            </button>
          </div>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full bg-slate-950 rounded-xl border border-slate-800 cursor-crosshair touch-none"
          />
        </div>
      </div>
    </div>
  );
}
