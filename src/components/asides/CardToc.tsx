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
  return (
    <div className="card-widget card-aside card-toc">
      <div className="card-headline">
        <Icon icon="fa6-solid:align-left" />
        <span className="card-title">目录</span>
      </div>
      <div className="card-body">
        <div className="toc-content">
          <TocBody toc={tocTree} />
        </div>
        <span className="toc-counter">0</span>
      </div>
      <TocUpdater tocTree={tocTree} />
    </div>
  );
}
