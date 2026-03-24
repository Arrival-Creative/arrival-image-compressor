"use client";

import { CompressedResult } from "@/app/page";

interface CompressButtonProps {
  onCompress: () => void;
  isCompressing: boolean;
  disabled: boolean;
  results: CompressedResult[];
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

export default function CompressButton({
  onCompress,
  isCompressing,
  disabled,
  results,
}: CompressButtonProps) {
  const handleDownloadAll = () => {
    results.forEach((result) => {
      if (result.error) return;
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.outputName;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (results.length > 0) {
    return (
      <button onClick={handleDownloadAll} className="btn btn-primary w-full">
        Download All
      </button>
    );
  }

  return (
    <button
      onClick={onCompress}
      disabled={disabled || isCompressing}
      className="btn btn-primary w-full"
    >
      {isCompressing ? (
        <span className="flex items-center gap-2">
          <Spinner />
          Compressing…
        </span>
      ) : (
        "Compress"
      )}
    </button>
  );
}
