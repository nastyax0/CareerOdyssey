"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import ReactMarkdown from "react-markdown";

export default function CareerReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCareerReport = async () => {
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (sessionError || !user) {
    console.error("Authentication Error:", sessionError?.message);
    setError("Unauthorized. Please log in.");
    return;
  }

  const token = (await supabase.auth.getSession()).data.session?.access_token; 

  setLoading(true);
  setError("");
  setReport(null);

  try {
    const res = await fetch(`/api/reportmock`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
    } else {
      setReport(data.report);
    }
  } catch {
    setError("Failed to fetch the report.");
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Career Report</h1>

      <button
        onClick={fetchCareerReport}
        className="bg-[#54504a] text-white px-6 py-2 rounded-lg shadow-md hover:bg-[#C8BB96] transition"
      >
        Generate Career Report
      </button>

      {loading && <p className="mt-4 text-gray-600">Generating report...</p>}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {report && (
        <div className="mt-6 bg-[#F5F2E4] p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            📌 Recommendation
          </h2>
          {report && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl text-gray-800">
          {report && (<div className="prose max-w-none bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl text-gray-800"><ReactMarkdown>{report}</ReactMarkdown>
  </div>)}
        </div>
      )}
        </div>
      )}
    </div>
  );
}
