import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  revalidateTag("flinks", { expire: 0 });
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
