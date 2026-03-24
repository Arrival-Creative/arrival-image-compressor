"use client";

import { useState } from "react";

export interface CompressionSettings {
  format: "webp" | "jpeg" | "png";
  quality: number;
  dimensionPreset: "1920x1080" | "1280x720" | "800x600" | "custom";
  customWidth: string;
  customHeight: string;
}

export const DEFAULT_SETTINGS: CompressionSettings = {
  format: "webp",
  quality: 50,
  dimensionPreset: "1920x1080",
  customWidth: "1920",
  customHeight: "1080",
};

interface AdvancedSettingsProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
}

const FORMAT_OPTIONS: { value: CompressionSettings["format"]; label: string }[] = [
  { value: "webp", label: "WebP" },
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
];

const DIMENSION_OPTIONS: { value: CompressionSettings["dimensionPreset"]; label: string; description: string }[] = [
  { value: "1920x1080", label: "1920 × 1080", description: "HD — hero images" },
  { value: "1280x720", label: "1280 × 720", description: "Blog thumbnails" },
  { value: "800x600", label: "800 × 600", description: "Inline content" },
  { value: "custom", label: "Custom", description: "Your own size" },
];

function GearIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      aria-hidden="true"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="2 3 5 7 8 3" />
    </svg>
  );
}

export default function AdvancedSettings({ settings, onChange }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const update = (patch: Partial<CompressionSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-['Open_Sans',sans-serif] font-medium border px-3 py-1.5 rounded transition-colors ${
            isOpen
              ? "border-[#31070d]/30 text-[#31070d] bg-[#faf8f0]"
              : "border-[#eae8df] text-[#78766d] hover:border-[#78766d]/50 hover:text-[#31070d]"
          }`}
          title="Compression settings"
        >
          <GearIcon />
          <span>{isOpen ? "Hide settings" : "Settings"}</span>
          <ChevronIcon open={isOpen} />
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 border border-[#eae8df] bg-[#faf8f0] rounded px-5 py-4">

          {/* Row 1: Format + Quality */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b border-[#eae8df]">

            {/* Format */}
            <div>
              <p className="text-xs font-medium text-[#78766d] uppercase tracking-wide mb-2.5">Format</p>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={opt.value}
                      checked={settings.format === opt.value}
                      onChange={() => update({ format: opt.value })}
                      className="accent-[#d12840] flex-shrink-0"
                    />
                    <span className="text-sm text-[#31070d]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <div className="flex items-baseline justify-between mb-2.5">
                <p className="text-xs font-medium text-[#78766d] uppercase tracking-wide">Quality</p>
                <span className="text-sm font-medium text-[#31070d] tabular-nums">{settings.quality}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={settings.quality}
                onChange={(e) => update({ quality: Number(e.target.value) })}
                className="w-full accent-[#d12840] h-1"
              />
              <p className="text-xs text-[#78766d] mt-1.5">Lower = smaller file</p>
            </div>

          </div>

          {/* Row 2: Dimensions */}
          <div className="pt-4">
            <p className="text-xs font-medium text-[#78766d] uppercase tracking-wide mb-2.5">Dimensions</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {DIMENSION_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dimensionPreset"
                    value={opt.value}
                    checked={settings.dimensionPreset === opt.value}
                    onChange={() => update({ dimensionPreset: opt.value })}
                    className="mt-0.5 accent-[#d12840] flex-shrink-0"
                  />
                  <div>
                    <span className="text-sm text-[#31070d]">{opt.label}</span>
                    <span className="block text-xs text-[#78766d]">{opt.description}</span>
                  </div>
                </label>
              ))}
            </div>

            {settings.dimensionPreset === "custom" && (
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="number"
                  value={settings.customWidth}
                  onChange={(e) => update({ customWidth: e.target.value })}
                  placeholder="Width"
                  min={1}
                  className="w-24 bg-[#fffef7] border border-[#eae8df] rounded px-2 py-1 text-sm text-[#31070d] focus:outline-none focus:border-[#78766d]"
                />
                <span className="text-xs text-[#78766d]">×</span>
                <input
                  type="number"
                  value={settings.customHeight}
                  onChange={(e) => update({ customHeight: e.target.value })}
                  placeholder="Height"
                  min={1}
                  className="w-24 bg-[#fffef7] border border-[#eae8df] rounded px-2 py-1 text-sm text-[#31070d] focus:outline-none focus:border-[#78766d]"
                />
                <span className="text-xs text-[#78766d]">px</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
