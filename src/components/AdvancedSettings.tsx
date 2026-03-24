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

const FORMAT_OPTIONS: { value: CompressionSettings["format"]; label: string; description: string }[] = [
  { value: "webp", label: "WebP", description: "Best for most website images. Small file size, great quality." },
  { value: "jpeg", label: "JPEG", description: "Good for photos when WebP isn't supported." },
  { value: "png", label: "PNG", description: "Use for images with transparent backgrounds." },
];

const DIMENSION_OPTIONS: { value: CompressionSettings["dimensionPreset"]; label: string; description: string }[] = [
  { value: "1920x1080", label: "1920 × 1080", description: "Standard HD. Best for hero images and full-width sections." },
  { value: "1280x720", label: "1280 × 720", description: "Good for blog thumbnails and smaller sections." },
  { value: "800x600", label: "800 × 600", description: "Small. Good for inline content images." },
  { value: "custom", label: "Custom", description: "Set your own dimensions." },
];

function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
          className={`flex items-center gap-1.5 text-xs font-['Open_Sans',sans-serif] font-light transition-colors ${
            isOpen ? "text-[#31070d]" : "text-[#78766d] hover:text-[#31070d]"
          }`}
          title="Advanced settings"
        >
          <GearIcon />
          <span>Advanced</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 border border-[#eae8df] bg-[#faf8f0] px-5 py-4 space-y-5">
          {/* Output Format */}
          <div>
            <p className="text-xs font-normal text-[#78766d] uppercase tracking-wide mb-2">Output Format</p>
            <div className="space-y-1.5">
              {FORMAT_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="format"
                    value={opt.value}
                    checked={settings.format === opt.value}
                    onChange={() => update({ format: opt.value })}
                    className="mt-0.5 accent-[#d12840] flex-shrink-0"
                  />
                  <span>
                    <span className="text-sm text-[#31070d] font-normal">{opt.label}</span>
                    <span className="text-xs text-[#78766d] ml-2">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-xs font-normal text-[#78766d] uppercase tracking-wide">Compression Quality</p>
              <span className="text-sm font-normal text-[#31070d]">{settings.quality}</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={settings.quality}
              onChange={(e) => update({ quality: Number(e.target.value) })}
              className="w-full accent-[#d12840] h-1"
            />
            <p className="text-xs text-[#78766d] mt-1">Lower = smaller file, higher = better looking.</p>
          </div>

          {/* Output Dimensions */}
          <div>
            <p className="text-xs font-normal text-[#78766d] uppercase tracking-wide mb-2">Output Dimensions</p>
            <div className="space-y-1.5">
              {DIMENSION_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dimensionPreset"
                    value={opt.value}
                    checked={settings.dimensionPreset === opt.value}
                    onChange={() => update({ dimensionPreset: opt.value })}
                    className="mt-0.5 accent-[#d12840] flex-shrink-0"
                  />
                  <span>
                    <span className="text-sm text-[#31070d] font-normal">{opt.label}</span>
                    <span className="text-xs text-[#78766d] ml-2">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>

            {settings.dimensionPreset === "custom" && (
              <div className="flex items-center gap-2 mt-3 ml-5">
                <input
                  type="number"
                  value={settings.customWidth}
                  onChange={(e) => update({ customWidth: e.target.value })}
                  placeholder="Width"
                  min={1}
                  className="w-24 bg-[#fffef7] border border-[#eae8df] px-2 py-1 text-sm text-[#31070d] focus:outline-none focus:border-[#78766d]"
                />
                <span className="text-xs text-[#78766d]">×</span>
                <input
                  type="number"
                  value={settings.customHeight}
                  onChange={(e) => update({ customHeight: e.target.value })}
                  placeholder="Height"
                  min={1}
                  className="w-24 bg-[#fffef7] border border-[#eae8df] px-2 py-1 text-sm text-[#31070d] focus:outline-none focus:border-[#78766d]"
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
