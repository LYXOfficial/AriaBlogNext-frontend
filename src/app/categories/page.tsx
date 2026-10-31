import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { fetchCategories } from "@/utils/api";
import { Category } from "@/interfaces/category";
import CollectionHeader from "@/components/CollectionHeader";
import TagIndex from "@/components/TagIndex";
import { siteConfigs } from "@/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `分类 | ${siteConfigs.title}`,
};

export default async function Page() {
  const res = await fetchCategories();
  let data: Category[] = [];
  if (res.ok) {
    data = res.data ?? [];
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
