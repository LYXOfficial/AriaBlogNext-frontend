//GPT万岁！！！ QwQ

import React, { ReactElement } from "react";
import "styles/ASide/global.css";
import "styles/ASide/Toc.css";
import TocUpdater from "components/thirdpartyjs/TocUpdater";
import { Icon } from "@iconify/react";
import JSMD5 from "js-md5";
import TocBody from "./TocBody";
import generateTOC from "../mdxlibs/builtins/TocGen";

export interface TOCItem {
  text: string;
  href: string;
  level: number;
  children: TOCItem[];
}
export default function CardToc({ mdContent }: { mdContent: string }) {
  const tocTree = generateTOC(mdContent);
  // 文章里一个标题都没有时不显示空目录卡片
  // （RightButtons 会同步隐藏右侧的目录按钮）
  if (tocTree.length === 0) return null;
  return (
    <div className="card-widget card-aside card-toc">
      <div className="card-headline">
        <Icon icon="solar:list-bold" />
        <span className="card-title">目录</span>
        <span className="toc-counter" aria-label="阅读进度">
          已读 <span className="toc-counter-value">0</span><span>%</span>
        </span>
      </div>
      <div className="toc-progress" aria-hidden="true">
        <span className="toc-progress-fill" />
      </div>
      <div className="card-body">
        <div className="toc-content">
          <TocBody toc={tocTree} />
        </div>
      </div>
      <TocUpdater tocTree={tocTree} />
    </div>
  );
}
