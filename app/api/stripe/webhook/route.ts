import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Stripe webhook is prepared but inactive." },
    { status: 501 },
  );
}
