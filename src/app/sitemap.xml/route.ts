export const revalidate = 3600;

import { siteConfigs } from "@/config";

export async function GET() {
  const res = await fetch(`${siteConfigs.backEndUrl}/get/sitemap/sitemapGen`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  if (res.ok) {
    return new Response(await res.text(), {
      headers: {
        "content-type": "application/xml",
      },
    });
  }
  return new Response("", {
    headers: {
      "content-type": "application/xml",
    },
  });
}
