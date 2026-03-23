"use client";

import { useCallback, useRef, useState } from "react";

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function FileDropZone({ onFilesAdded }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (droppedFiles.length > 0) onFilesAdded(droppedFiles);
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleClick = () => inputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (selected.length > 0) onFilesAdded(selected);
    e.target.value = "";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
        isDragging
          ? "border-[#d12840] bg-[#ffeaea]"
          : "border-[#eae8df] hover:border-[#d12840]/50 bg-[#faf8f0]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="text-[#78766d]">
        <p className="text-lg font-normal mb-1">
          {isDragging ? "Drop images here" : "Drag & drop images here"}
        </p>
        <p className="text-sm">or click to browse — JPG, PNG, WebP, BMP, TIFF, AVIF</p>
      </div>
    </div>
  );
}