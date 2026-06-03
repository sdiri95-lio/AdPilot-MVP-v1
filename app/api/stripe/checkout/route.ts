import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Stripe checkout is prepared but inactive." },
    { status: 501 },
  );
}
