import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "AI copy generation is scheduled for Sprint 4." },
    { status: 501 },
  );
}
