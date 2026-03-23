import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const description = (formData.get("description") as string) || "image";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/avif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Get original metadata to detect orientation
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;

    // Auto-detect orientation: landscape vs portrait
    const isPortrait = originalHeight > originalWidth;
    const targetWidth = isPortrait ? 1080 : 1920;
    const targetHeight = isPortrait ? 1920 : 1080;

    // Resize: cover fit (fill target, crop overflow from center)
    // withoutEnlargement: small images stay at native size, just get WebP conversion
    const compressed = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

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
    const filename = `${slug}-${outW}x${outH}.webp`;

    return new NextResponse(new Uint8Array(compressed), {
      status: 200,
      headers: {
        "Content-Type": "image/webp",
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