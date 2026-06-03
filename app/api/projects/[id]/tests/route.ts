import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Test strategy is scheduled for Sprint 4." },
    { status: 501 },
  );
}
