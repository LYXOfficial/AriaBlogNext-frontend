export const revalidate = 43200;

import { fetchSitemapXml } from "@/utils/api";

export async function GET() {
  const xml = await fetchSitemapXml({ revalidate: 43200, tags: ["posts"] });
  return new Response(xml ?? "", {
    headers: {
      "content-type": "application/xml",
    },
  });
}
