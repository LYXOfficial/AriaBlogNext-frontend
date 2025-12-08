import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  await revalidateTag("flinks", "/");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
