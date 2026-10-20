import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";
import { Category } from "@/interfaces/category";
import CollectionHeader from "@/components/CollectionHeader";
import TagIndex from "@/components/TagIndex";
export default async function Page() {
  const res = await fetch(`${siteConfigs.backEndUrl}/get/category/categories`, {
    next: { revalidate: 7200, tags: ["posts"] },
  });
  let data: Category[] = [];
  if (res.ok) {
    data = (await res.json()).data ?? [];
    data.sort((a, b) => a.name.localeCompare(b.name, "zh-cn"));
  }
  return (
    <div className="page" id="main-container">
      <style>{`#navbar{position:fixed}`}</style>
      <div id="article-container" className="page archives">
        <div id="post-maincontent" className="page archives">
          <CollectionHeader
            eyebrow="主题分区"
            title="分类"
            extra={
              <span className="collection-stat">
                <b>{data.length}</b> 个分类
              </span>
            }
          />
          <TagIndex tags={data} type="categories" />
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
