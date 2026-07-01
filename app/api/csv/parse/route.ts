/**
 * app/api/csv/parse/route.ts
 *
 * POST /api/csv/parse
 *
 * Accepts a Facebook Ads Manager CSV export via multipart/form-data,
 * runs the intelligent column mapper and parser, and returns a structured
 * JSON response with the parsed ad sets and column detection metadata.
 *
 * Request:  multipart/form-data  { file: File }
 * Response: CsvParseResponse (see below)
 */

import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { parseFacebookCsv } from "@/lib/csv/parser";

// ─────────────────────────────────────────────────────────────────────────────
// Response shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Successful parse response.
 * The `columns_detected` block lets the caller see exactly which columns
 * were found, which were absent, and the raw→internal mapping used.
 */
export type CsvParseResponse = {
  success: true;
  /** Typed, filtered ad-set rows ready for AI analysis. */
  rows: ReturnType<typeof parseFacebookCsv>["rows"];
  /** Total data rows in the CSV (before filtering). */
  total_rows: number;
  /** Rows dropped because spend = 0 or status = inactive. */
  skipped_rows: number;
  /** Column detection audit trail. */
  columns_detected: {
    /** Internal keys that were successfully mapped to a CSV column. */
    found: string[];
    /** Internal keys that had no matching column in this CSV. */
    missing: string[];
    /**
     * Full mapping: internalKey → exact CSV header string (or null).
     * Useful for debugging unexpected column misses.
     */
    mapping: Record<string, string | null>;
  };
};

export type CsvParseErrorResponse = {
  success: false;
  error: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** 10 MB – reasonable upper bound for any realistic Facebook CSV export. */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const user = await requireCurrentUser();
  if (!user) {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ── Parse multipart form ───────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "Invalid request — expected multipart/form-data." },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "No file uploaded. Send the CSV as a 'file' field." },
      { status: 400 }
    );
  }

  // ── Validate file type ─────────────────────────────────────────────────────
  const fileName = (file as File).name ?? "";
  if (!fileName.toLowerCase().endsWith(".csv")) {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "Only .csv files are accepted." },
      { status: 415 }
    );
  }

  // ── Validate file size ─────────────────────────────────────────────────────
  if ((file as File).size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "File is too large. Maximum size is 10 MB." },
      { status: 413 }
    );
  }

  // ── Read CSV text ──────────────────────────────────────────────────────────
  let csvText: string;
  try {
    csvText = await (file as File).text();
  } catch {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "Failed to read the uploaded file." },
      { status: 500 }
    );
  }

  if (!csvText.trim()) {
    return NextResponse.json<CsvParseErrorResponse>(
      { success: false, error: "The uploaded CSV file is empty." },
      { status: 422 }
    );
  }

  // ── Run the parser ─────────────────────────────────────────────────────────
  let result: ReturnType<typeof parseFacebookCsv>;
  try {
    result = parseFacebookCsv(csvText);
  } catch (err) {
    console.error("[csv/parse] Parser error:", err);
    return NextResponse.json<CsvParseErrorResponse>(
      {
        success: false,
        error:
          err instanceof Error
            ? `Parser error: ${err.message}`
            : "An unexpected error occurred during parsing.",
      },
      { status: 500 }
    );
  }

  // ── Return structured response ─────────────────────────────────────────────
  return NextResponse.json<CsvParseResponse>({
    success: true,
    rows: result.rows,
    total_rows: result.total_rows,
    skipped_rows: result.skipped_rows,
    columns_detected: result.columns_detected,
  });
}
