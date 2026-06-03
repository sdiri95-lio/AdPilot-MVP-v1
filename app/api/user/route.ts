import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { message: "User API is scheduled for a later sprint." },
    { status: 501 },
  );
}
