"use client";

import { useState } from "react";
import FileDropZone from "@/components/FileDropZone";
import FileList from "@/components/FileList";
import CompressButton from "@/components/CompressButton";

export interface FileEntry {
  file: File;
  description: string;
}

export interface CompressedResult {
  originalName: string;
  outputName: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions: string;
  outputDimensions: string;
  blob: Blob;
  ratio: number;
  error?: string;
}

export default function Home() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    const newEntries = newFiles.map((file) => ({
      file,
      description: file.name.replace(/\.[^.]+$/, "").replace(/[_\s]+/g, " "),
    }));
    setEntries((prev) => [...prev, ...newEntries]);
    setResults([]);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, description } : entry))
    );
  };

  const handleRemoveFile = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const handleCompress = async () => {
    setIsCompressing(true);
    const compressed: CompressedResult[] = [];

    for (const entry of entries) {
      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("description", entry.description);

        const res = await fetch("/api/compress", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Compression failed");
        }

        const blob = await res.blob();
        const outputName = res.headers.get("X-Filename") || "compressed.webp";
        const originalSize = Number(res.headers.get("X-Original-Size") || entry.file.size);
        const compressedSize = Number(res.headers.get("X-Compressed-Size") || blob.size);

        compressed.push({
          originalName: entry.file.name,
          outputName,
          originalSize,
          compressedSize,
          originalDimensions: res.headers.get("X-Original-Dimensions") || "unknown",
          outputDimensions: res.headers.get("X-Output-Dimensions") || "1920x1080",
          blob,
          ratio: ((1 - compressedSize / originalSize) * 100),
        });
      } catch (err) {
        compressed.push({
          originalName: entry.file.name,
          outputName: "",
          originalSize: entry.file.size,
          compressedSize: entry.file.size,
          originalDimensions: "unknown",
          outputDimensions: "",
          blob: new Blob(),
          ratio: 0,
          error: err instanceof Error ? err.message : "Compression failed",
        });
      }
    }

    setResults(compressed);
    setIsCompressing(false);
  };

  const handleClear = () => {
    setEntries([]);
    setResults([]);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10 text-center">
        <img src="https://cdn.prod.website-files.com/635e445db596369fc56d7f19/635f22d6b59636184877841c_Arrival%20Creative%20Logo.svg" alt="Arrival Creative" className="h-8 mx-auto mb-4" />
        <h1 className="text-4xl tracking-tight mb-2 font-normal font-['Volkhov',serif]">Website Image Machine</h1>
        <h2 className="text-lg text-[#78766d] font-light font-['Volkhov',serif]">Compress and resize in one step</h2>
      </div>

      <div className="w-1/2">
        <FileDropZone onFilesAdded={handleFilesAdded} />
      </div>

      {entries.length > 0 && (
        <div className="mt-8 space-y-6 w-1/2">
          <FileList
            entries={entries}
            results={results}
            onDescriptionChange={handleDescriptionChange}
            onRemove={handleRemoveFile}
          />

          <div className="flex flex-col items-center gap-4">
            <CompressButton
              onCompress={handleCompress}
              isCompressing={isCompressing}
              disabled={entries.length === 0}
              results={results}
            />
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm text-[#78766d] hover:text-[#31070d] transition-colors font-['Open_Sans',sans-serif] font-light"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </main>
  );
}