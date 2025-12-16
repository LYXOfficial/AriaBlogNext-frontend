import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  revalidateTag(slug, "default");
  return NextResponse.json({ revalidated: true, now: Date.now(), slug });
}
