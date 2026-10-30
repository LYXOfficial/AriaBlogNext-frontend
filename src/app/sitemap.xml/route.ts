export const revalidate = 3600;

import { fetchSitemapXml } from "@/utils/api";

export async function GET() {
  const xml = await fetchSitemapXml({ revalidate: 7200, tags: ["posts"] });
  return new Response(xml ?? "", {
    headers: {
      "content-type": "application/xml",
    },
  });
}
