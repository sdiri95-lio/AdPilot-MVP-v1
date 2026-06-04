import { NextResponse } from "next/server";

import { requireCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient, getSupabaseConfig } from "@/lib/supabase";
import { imageContentTypes, maxProjectImageSize } from "@/lib/validators";

export async function POST(request: Request) {
  const user = await requireCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Image file is required." }, { status: 400 });
  }

  if (!imageContentTypes.includes(file.type as (typeof imageContentTypes)[number])) {
    return NextResponse.json(
      { message: "Only JPG, PNG, and WEBP images are supported." },
      { status: 400 },
    );
  }

  if (file.size > maxProjectImageSize) {
    return NextResponse.json(
      { message: "Project image must be 5MB or smaller." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { projectImagesBucket } = getSupabaseConfig();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${user.clerkId}/${crypto.randomUUID()}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(projectImagesBucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { data } = supabase.storage.from(projectImagesBucket).getPublicUrl(path);

  return NextResponse.json({
    imageUrl: data.publicUrl,
    path,
  });
}
