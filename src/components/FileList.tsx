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
    <li className="bg-[#faf8f0] border border-[#eae8df] border-l-2 border-l-[#d12840]/30 rounded-lg px-4 py-3">
      <div className="flex items-start gap-3">
        {previewUrl && (
          <img
            src={previewUrl}
            alt=""
            className="w-10 h-10 object-cover flex-shrink-0 rounded border border-[#eae8df]"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium truncate text-[#31070d] flex-1 min-w-0">
              {entry.file.name}
            </p>
            <button
              onClick={() => onRemove(index)}
              className="ml-4 text-[#eae8df] hover:text-[#d12840] text-lg leading-none flex-shrink-0 transition-colors"
            >
              ×
            </button>
          </div>

          {!result && (
            <div>
              <p className="text-xs text-[#78766d] mb-1">Image description</p>
              <input
                type="text"
                value={entry.description}
                onChange={(e) => onDescriptionChange(index, e.target.value)}
                placeholder="e.g. team photo at conference"
                className="w-full bg-[#fffef7] border-0 border-b-2 border-transparent rounded-none px-3 py-1.5 text-sm text-[#31070d] placeholder-[#78766d] focus:outline-none focus:border-b-[#31070d] transition-all"
              />
            </div>
          )}

          {/* File size and result stats */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-xs text-[#78766d] bg-[#eae8df]/60 px-2 py-0.5 rounded-full">
              {formatSize(entry.file.size)}
            </span>

            {result && !result.error && (
              <>
                <span className="text-[#eae8df] text-xs">→</span>
                <span className="text-xs text-[#2f590d] bg-[#86d149]/15 px-2 py-0.5 rounded-full font-medium">
                  {formatSize(result.compressedSize)}
                </span>
                <span className="text-xs text-[#2f590d] bg-[#86d149]/15 px-2 py-0.5 rounded-full font-medium">
                  -{result.ratio.toFixed(0)}%
                </span>
                <span className="text-xs text-[#78766d] bg-[#eae8df]/60 px-2 py-0.5 rounded-full">
                  {result.outputDimensions}
                </span>
              </>
            )}

            {result?.error && (
              <span className="text-xs text-[#690110] bg-[#d12840]/10 px-2 py-0.5 rounded-full">
                {result.error}
              </span>
            )}
          </div>
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
