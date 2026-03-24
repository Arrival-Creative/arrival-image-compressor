import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// Simple in-memory rate limiter (per IP, resets on cold start)
const rateMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // max requests per window
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type OutputFormat = "webp" | "jpeg" | "png";
type DimensionPreset = "1920x1080" | "1280x720" | "800x600" | "custom";

const DIMENSION_MAP: Record<Exclude<DimensionPreset, "custom">, [number, number]> = {
  "1920x1080": [1920, 1080],
  "1280x720": [1280, 720],
  "800x600": [800, 600],
};

const MIME_MAP: Record<OutputFormat, string> = {
  webp: "image/webp",
  jpeg: "image/jpeg",
  png: "image/png",
};

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (entry && now < entry.resetTime) {
    entry.count++;
    if (entry.count > RATE_LIMIT) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }
  } else {
    rateMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) || "image";

    // Advanced settings with defaults
    const format: OutputFormat = (formData.get("format") as OutputFormat) || "webp";
    const quality = Math.min(100, Math.max(1, Number(formData.get("quality")) || 50));
    const dimensionPreset: DimensionPreset = (formData.get("dimensionPreset") as DimensionPreset) || "1920x1080";
    const customWidth = Number(formData.get("customWidth")) || 1920;
    const customHeight = Number(formData.get("customHeight")) || 1080;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max size is 10MB." },
        { status: 413 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate format
    if (!["webp", "jpeg", "png"].includes(format)) {
      return NextResponse.json({ error: "Invalid output format" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Get original metadata to detect orientation
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Determine target dimensions
    let baseWidth: number;
    let baseHeight: number;

    if (dimensionPreset === "custom") {
      baseWidth = Math.max(1, customWidth);
      baseHeight = Math.max(1, customHeight);
    } else {
      [baseWidth, baseHeight] = DIMENSION_MAP[dimensionPreset];
    }

    // Auto-detect orientation and swap dimensions if portrait
    const isPortrait = originalHeight > originalWidth;
    const targetWidth = isPortrait ? Math.min(baseWidth, baseHeight) : Math.max(baseWidth, baseHeight);
    const targetHeight = isPortrait ? Math.max(baseWidth, baseHeight) : Math.min(baseWidth, baseHeight);

    // Resize: cover fit (fill target, crop overflow from center)
    // withoutEnlargement: small images stay at native size, just get format conversion
    let pipeline = sharp(buffer).resize(targetWidth, targetHeight, {
      fit: "cover",
      position: "centre",
      withoutEnlargement: true,
    });

    let compressed: Buffer;
    if (format === "webp") {
      compressed = await pipeline.webp({ quality }).toBuffer();
    } else if (format === "jpeg") {
      compressed = await pipeline.jpeg({ quality }).toBuffer();
    } else {
      // PNG quality maps to compression level (0-9); sharp accepts compressionLevel
      const compressionLevel = Math.round((100 - quality) / 100 * 9);
      compressed = await pipeline.png({ compressionLevel }).toBuffer();
    }

    // Build the filename slug
    const slug = description
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // Get actual output dimensions (may differ if withoutEnlargement kicked in)
    const outputMeta = await sharp(compressed).metadata();
    const outW = outputMeta.width || targetWidth;
    const outH = outputMeta.height || targetHeight;
    const ext = format === "jpeg" ? "jpg" : format;
    const filename = `${slug}-${outW}x${outH}.${ext}`;

    return new NextResponse(new Uint8Array(compressed), {
      status: 200,
      headers: {
        "Content-Type": MIME_MAP[format],
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Original-Size": String(buffer.length),
        "X-Compressed-Size": String(compressed.length),
        "X-Original-Dimensions": `${originalWidth}x${originalHeight}`,
        "X-Output-Dimensions": `${outW}x${outH}`,
        "X-Filename": filename,
      },
    });
  } catch (err) {
    console.error("Compression error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Compression failed" },
      { status: 500 }
    );
  }
}
