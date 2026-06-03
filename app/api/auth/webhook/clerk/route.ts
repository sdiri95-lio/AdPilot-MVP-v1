import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Clerk webhook handling is scheduled for a later sprint." },
    { status: 501 },
  );
}
