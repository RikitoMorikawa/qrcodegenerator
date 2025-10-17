import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test Sharp availability
    let sharpStatus = "unavailable";
    let sharpVersion = "unknown";

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sharp = require("sharp");
      sharpStatus = "available";
      sharpVersion = sharp.versions?.sharp || "unknown";
    } catch (error) {
      console.error("Sharp health check failed:", error);
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      sharp: {
        status: sharpStatus,
        version: sharpVersion,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
