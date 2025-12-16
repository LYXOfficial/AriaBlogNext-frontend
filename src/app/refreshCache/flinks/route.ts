import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidateTag("flinks", "default");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
