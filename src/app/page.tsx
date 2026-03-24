"use client";

import { useState } from "react";
import FileDropZone from "@/components/FileDropZone";
import FileList from "@/components/FileList";
import CompressButton from "@/components/CompressButton";
import AdvancedSettings, { CompressionSettings, DEFAULT_SETTINGS } from "@/components/AdvancedSettings";

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

function UploadIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#d12840"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);

  const MAX_FILES = 3;

  const handleFilesAdded = (newFiles: File[]) => {
    const remaining = MAX_FILES - entries.length;
    if (remaining <= 0) return;
    const accepted = newFiles.slice(0, remaining);
    const newEntries = accepted.map((file) => ({
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
        formData.append("format", settings.format);
        formData.append("quality", String(settings.quality));
        formData.append("dimensionPreset", settings.dimensionPreset);
        if (settings.dimensionPreset === "custom") {
          formData.append("customWidth", settings.customWidth);
          formData.append("customHeight", settings.customHeight);
        }

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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <UploadIcon />
          <h1 className="text-3xl tracking-tight font-normal font-['Volkhov',serif]">Image Machine</h1>
        </div>
        <p className="text-sm text-[#78766d] font-light font-['Open_Sans',sans-serif]">
          Compress and resize for the web — up to 3 images at a time
        </p>
      </div>

      <div className="w-full max-w-xl">
        <FileDropZone onFilesAdded={handleFilesAdded} />
      </div>

      {entries.length > 0 && (
        <div className="mt-6 space-y-4 w-full max-w-xl">
          <FileList
            entries={entries}
            results={results}
            onDescriptionChange={handleDescriptionChange}
            onRemove={handleRemoveFile}
          />

          <AdvancedSettings settings={settings} onChange={setSettings} />

          <div className="flex flex-col items-stretch gap-3">
            <CompressButton
              onCompress={handleCompress}
              isCompressing={isCompressing}
              disabled={entries.length === 0}
              results={results}
            />
            <button onClick={handleClear} className="btn btn-ghost text-xs">
              Clear all
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
