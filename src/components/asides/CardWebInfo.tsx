import "styles/ASide/global.css";
import { Icon } from "@iconify/react";
import "styles/ASide/WebInfo.css";
import relativeTime from "utils/reltime";
import "components/thirdpartyjs/Busuanzi";
import Busuanzi from "components/thirdpartyjs/Busuanzi";
import { siteConfigs } from "config";
import { fetchSiteInfo, fetchPostStatistics, fetchPostCount } from "utils/api";
import dayjs from "dayjs";

export default async function CardWebInfo() {
  let lastUpdatedTime: number = 0,
    wordCount: number = 0,
    postCount: number = 0;
  const resu = await fetchSiteInfo();
  if (resu.ok) lastUpdatedTime = resu.data?.latestUpdateTime ?? 0;
  const resw = await fetchPostStatistics();
  if (resw.ok) wordCount = resw.data?.totalWordCount ?? 0;
  const resp = await fetchPostCount();
  if (resp.ok) postCount = resp.data;
  const runDays = dayjs().diff(
    dayjs(
      new Date(
        siteConfigs.createYear,
        siteConfigs.createMonth - 1,
        siteConfigs.createDay,
      ),
    ),
    "day",
  );
  return (
    <div className="card-widget card-aside card-webinfo">
      <div className="card-headline">
        <Icon icon="solar:graph-up-linear" />
        <span className="card-title">网站统计</span>
      </div>
      <div className="card-body">
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">文章数目</span>
          <span className="card-webinfo-item-right">{postCount}</span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">文章字数</span>
          <span className="card-webinfo-item-right">
            {Math.floor(wordCount / 100) / 100}w
          </span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">运行天数</span>
          <span className="card-webinfo-item-right">{runDays} 天</span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">上次更新</span>
          <span className="card-webinfo-item-right">
            {relativeTime(lastUpdatedTime)}
          </span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">总浏览量</span>
          <span
            className="card-webinfo-item-right"
            id="busuanzi_value_site_pv"
          ></span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">总访客数</span>
          <span
            className="card-webinfo-item-right"
            id="busuanzi_value_site_uv"
          ></span>
        </div>
        <div className="card-webinfo-item">
          <span className="card-webinfo-item-left">评论总数</span>
          <span className="card-webinfo-item-right commentcount"></span>
        </div>
      </div>
      <Busuanzi />
    </div>
  );
}
