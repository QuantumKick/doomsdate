'use client'

import { useState } from 'react'

interface StoredResponse {
  timestamp: string;
  data: {
    isAvailable: boolean | null;
    date: string | null;
    time: string;
    food: string[];
    movie: string;
    activity: string;
    excitement: number;
  };
}

// Helper to format dates strictly as local date without timezone shifts
function formatExactDate(dateStr: string): string {
  // If date contains 'T' (e.g. 2026-02-14T00:00:00.000Z), grab just the date portion
  const cleanDateStr = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  
  // Extract numbers directly from the string
  const parts = cleanDateStr.match(/\d+/g);
  if (!parts || parts.length < 3) return dateStr; // fallback to raw string if format is unusual

  const [year, month, day] = parts.map(Number);
  
  // Use local Date constructor (year, monthIndex, day) to completely lock the local date
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString();
}

export default function AdminPage() {
  const [responses, setResponses] = useState<StoredResponse[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setResponses([{
            timestamp: new Date().toISOString(),
            data: data
          }]);
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Date Responses</h1>
      
      <div className="mb-8">
        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-pink-50 file:text-pink-700
            hover:file:bg-pink-100"
        />
      </div>

      {responses.length === 0 ? (
        <p>Upload a response JSON file to view it!</p>
      ) : (
        responses.map((response) => (
          <div key={response.timestamp} className="mb-8 p-4 border rounded bg-white shadow-lg">
            <p className="text-lg font-semibold mb-2">
              Response Time: {new Date(response.timestamp).toLocaleString()}
            </p>
            <div className="space-y-2 text-left">
              {/* UPDATED DATE LINE BELOW */}
              <p>Date: {response.data.date ? formatExactDate(response.data.date) : 'Not selected'}</p>
              <p>Time: {response.data.time || 'Not selected'}</p>
              <p>Food Choices: {response.data.food.join(', ') || 'Not selected'}</p>
              <p>Activity: {response.data.activity || 'Not selected'}</p>
              <p>Excitement Level: {response.data.excitement}/100</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}