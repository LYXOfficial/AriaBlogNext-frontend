"use server";
import { revalidateTag } from "next/cache";
export default async function action({ params }: { params: { slug: string } }) {
  revalidateTag(params.slug);
}
