import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidateTag("posts", { expire: 0 });
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
