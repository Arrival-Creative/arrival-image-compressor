"use client";

import { CompressedResult } from "@/app/page";

interface CompressButtonProps {
  onCompress: () => void;
  isCompressing: boolean;
  disabled: boolean;
  results: CompressedResult[];
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
      <button
        onClick={handleDownloadAll}
        className="inline-flex items-center justify-center px-8 py-3 bg-[#86d149] hover:bg-[#6db83a] text-white text-sm font-normal rounded-none transition-all duration-200 hover:shadow-md font-['Open_Sans',sans-serif]"
      >
        Download All
      </button>
    );
  }

  return (
    <button
      onClick={onCompress}
      disabled={disabled || isCompressing}
      className="inline-flex items-center justify-center px-8 py-3 bg-[#d12840] hover:bg-[#b01f33] disabled:bg-[#eae8df] disabled:text-[#78766d] text-white text-sm font-normal rounded-none transition-all duration-200 hover:shadow-md font-['Open_Sans',sans-serif]"
    >
      {isCompressing ? "Compressing…" : "Compress"}
    </button>
  );
}