"use client";
import surahNames from "../utils/surahNames.json";
import { useRef, useState } from "react";

export default function Home() {
  const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const surahRef = useRef<HTMLSelectElement>(null);

  const handleAddSurah = () => {
    const surahValue = surahRef.current!.value;
    if (!selectedSurahs.includes(surahValue)) {
      setSelectedSurahs([...selectedSurahs, surahValue]);
    }
  };

  const handleRemoveSurah = (surahToRemove: string) => {
    setSelectedSurahs(selectedSurahs.filter(surah => surah !== surahToRemove));
  };

  const handleGeneratePDF = async () => {
    if (selectedSurahs.length === 0) {
      alert("Please select at least one surah");
      return;
    }
    setLoading(true);
    setPdfUrl(null);
    // Sort surahs numerically
    const sortedSurahs = [...selectedSurahs].sort((a, b) => Number(a) - Number(b));
    const surahsParam = sortedSurahs.join(',');
    const url = `/api/surah-pdf?surah=${surahsParam}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        alert("Failed to generate PDF");
        setLoading(false);
        return;
      }
      const blob = await res.blob();
      const pdfBlobUrl = window.URL.createObjectURL(blob);
      setPdfUrl(pdfBlobUrl);
      // Clear input fields after generation
      setSelectedSurahs([]);
      if (surahRef.current) surahRef.current.value = "1";
    } catch (e) {
      alert("Failed to generate PDF");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e0e7ef] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-8 items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#1e293b] mb-2 tracking-tight">
          Combine Your Daily Dose of Quran
        </h1>
        <form className="w-full flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label htmlFor="surah" className="font-medium text-[#334155]">
              Select Surah <span className="text-xs text-[#64748b]">(1-114)</span>
            </label>
            <div className="flex gap-2">
              <select
                id="surah"
                name="surah"
                className="flex-1 border border-[#cbd5e1] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6366f1] text-[#334155] text-base"
                defaultValue="1"
                ref={surahRef}
              >
                {Object.entries(surahNames).map(([num, name]) => (
                  <option key={num} value={num}>
                    {num}. {name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSurah}
                className={`font-semibold px-4 py-2 rounded-xl shadow transition-colors text-base tracking-wide
                  ${pdfUrl ? 'bg-[#cbd5e1] text-[#64748b] cursor-not-allowed' : 'bg-[#6366f1] hover:bg-[#4f46e5] text-white'}`}
                disabled={!!pdfUrl}
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Surahs Display */}
          {selectedSurahs.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-medium text-[#334155]">Selected Surahs:</label>
              <div className="flex flex-wrap gap-2 p-3 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0]">
                {selectedSurahs.map((surahNum) => (
                  <div
                    key={surahNum}
                    className="flex items-center gap-2 bg-[#6366f1] text-white px-3 py-1 rounded-full text-sm"
                  >
                    <span>{surahNum}. {surahNames[surahNum as keyof typeof surahNames]}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSurah(surahNum)}
                      className="hover:bg-[#4f46e5] rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!pdfUrl) && (
            <button
              type="button"
              className="mt-4 w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-3 rounded-xl shadow transition-colors text-lg tracking-wide disabled:bg-[#94a3b8] disabled:cursor-not-allowed"
              onClick={handleGeneratePDF}
              disabled={selectedSurahs.length === 0 || loading}
            >
              {loading ? 'Generating...' : `Generate PDF (${selectedSurahs.length} surah${selectedSurahs.length !== 1 ? 's' : ''})`}
            </button>
          )}
        </form>
        {/* PDF Preview and Download */}
        {pdfUrl && (
          <div className="w-full flex flex-col items-center gap-4 mt-6">
            <div className="flex w-full gap-4">
              <button
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-2 rounded-xl shadow transition-colors text-base tracking-wide"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                Preview PDF
              </button>
              <a
                href={pdfUrl}
                download={`daily-dose-of-Quran.pdf`}
                className="flex-1 bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold py-2 rounded-xl shadow transition-colors text-base tracking-wide text-center"
              >
                Download PDF
              </a>
            </div>
            <button
              className="text-[#6366f1] underline mt-2"
              onClick={() => setPdfUrl(null)}
            >
              Start New PDF
            </button>
          </div>
        )}
      </div>
      <footer className="mt-10 text-xs text-[#64748b] text-center opacity-80">
        &copy; {new Date().getFullYear()} Quran PDF Generator
      </footer>
    </div>
  );
}