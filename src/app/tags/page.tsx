import "styles/Pages.css";
import "styles/PostContent.css";
import "styles/Archives.css";

import { HomeRightSide } from "@/components/RightSide";
import { fetchTags } from "@/utils/api";
import { Category } from "@/interfaces/category";
import CollectionHeader from "@/components/CollectionHeader";
import TagIndex from "@/components/TagIndex";
export default async function Page() {
  const res = await fetchTags();
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
            eyebrow="标签索引"
            title="标签"
            extra={
              <span className="collection-stat">
                <b>{data.length}</b> 个标签
              </span>
            }
          />
          <TagIndex tags={data} />
        </div>
      </div>
      <HomeRightSide />
    </div>
  );
}
