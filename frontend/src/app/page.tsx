'use client';

import { useState } from 'react';

export default function Home() {
  const [numbers, setNumbers] = useState('');
  const [sumResult, setSumResult] = useState<number | null>(null);
  const [message, setMessage] = useState('Welcome to your Personal Financial AI Assistant!');
  const [error, setError] = useState<string | null>(null);

  const handleCalculateSum = async () => {
    setError(null);
    setSumResult(null);
    try {
      const values = numbers.split(',').map(Number).filter(n => !isNaN(n));
      if (values.length === 0) {
        setError('Please enter valid numbers separated by commas.');
        return;
      }

      const response = await fetch('http://localhost:8000/calculate-sum/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to calculate sum.');
      }

      const data = await response.json();
      setSumResult(data.sum);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      console.error('Error calculating sum:', err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">{message}</h1>

      <div className="flex flex-col items-center gap-4">
        <input
          type="text"
          value={numbers}
          onChange={(e) => setNumbers(e.target.value)}
          placeholder="Enter numbers (e.g., 1,2,3)"
          className="p-2 border border-gray-300 rounded text-black w-80"
        />
        <button
          onClick={handleCalculateSum}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Calculate Sum with Rust Engine
        </button>

        {sumResult !== null && (
          <p className="text-2xl mt-4">Sum: <span className="font-semibold">{sumResult}</span></p>
        )}

        {error && (
          <p className="text-red-500 mt-4">Error: {error}</p>
        )}
      </div>
    </main>
  );
}

