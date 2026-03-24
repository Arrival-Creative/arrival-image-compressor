"use client";

import { useEffect, useState } from "react";
import { FileEntry, CompressedResult } from "@/app/page";

interface FileListProps {
  entries: FileEntry[];
  results: CompressedResult[];
  onDescriptionChange: (index: number, description: string) => void;
  onRemove: (index: number) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function FileCard({
  entry,
  index,
  result,
  onDescriptionChange,
  onRemove,
}: {
  entry: FileEntry;
  index: number;
  result?: CompressedResult;
  onDescriptionChange: (index: number, description: string) => void;
  onRemove: (index: number) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(entry.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);

  return (
    <li className="bg-[#faf8f0] border border-[#eae8df] rounded-lg px-4 py-3">
      <div className="flex items-start gap-3">
        {previewUrl && (
          <img
            src={previewUrl}
            alt=""
            className="w-14 h-14 object-cover flex-shrink-0 border border-[#eae8df]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="truncate flex-1 min-w-0">
              <p className="text-xs text-[#78766d] mb-0.5">Original filename:</p>
              <p className="text-sm font-medium truncate">{entry.file.name}</p>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="ml-4 text-[#eae8df] hover:text-[#d12840] text-lg leading-none flex-shrink-0"
            >
              ×
            </button>
          </div>

          {!result && (
            <div>
              <p className="text-xs text-[#78766d] mb-1">New file name (just explain what&apos;s in the image):</p>
              <input
                type="text"
                value={entry.description}
                onChange={(e) => onDescriptionChange(index, e.target.value)}
                placeholder="e.g. team photo at conference"
                className="w-full bg-[#fffef7] border-0 border-b-2 border-transparent rounded-none px-3 py-1.5 text-sm text-[#31070d] placeholder-[#78766d] focus:outline-none focus:border-b-[#31070d] transition-all"
              />
            </div>
          )}

          <p className="text-xs text-[#78766d] mt-1.5">
            {formatSize(entry.file.size)}
            {result && !result.error && (
              <span className="text-[#2f590d] ml-2">
                → {formatSize(result.compressedSize)} ({result.ratio.toFixed(0)}%
                smaller) · {result.originalDimensions} → {result.outputDimensions} ·{" "}
                <span className="text-[#78766d]">{result.outputName}</span>
              </span>
            )}
            {result?.error && (
              <span className="text-[#690110] ml-2">Error: {result.error}</span>
            )}
          </p>
        </div>
      </div>
    </li>
  );
}

export default function FileList({
  entries,
  results,
  onDescriptionChange,
  onRemove,
}: FileListProps) {
  return (
    <ul className="space-y-3">
      {entries.map((entry, index) => (
        <FileCard
          key={`${entry.file.name}-${index}`}
          entry={entry}
          index={index}
          result={results[index]}
          onDescriptionChange={onDescriptionChange}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
