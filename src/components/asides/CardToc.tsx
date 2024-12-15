//GPT万岁！！！ QwQ

import React, { ReactElement } from 'react';
import "styles/ASide/global.css";
import "styles/ASide/Toc.css";
import TocUpdater from "components/thirdpartyjs/TocUpdater";
import { Icon } from '@iconify/react';
import { JSDOM } from "jsdom";
import { cache } from "react";
import TocBody from './TocBody';

export interface TOCItem {
    text: string;
    href: string;
    level: number;
    children: TOCItem[];
}
export default function CardToc({ mdContent }: { mdContent: string }) {
    const generateTOC = (mdContent: string): TOCItem[] => {
        const tocTree: TOCItem[] = [];
        let ulStack: TOCItem[] = [{ level: 0, children: tocTree } as TOCItem];
        const matches = mdContent.matchAll(/^(\n#{1,6})\s+(.+)\n$/gm);
        for (const match of matches) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = text.replace(/\s+/g, '-').toLowerCase();
            const item: TOCItem = { text, href: `#${id}`, level, children: [] };
            while (ulStack[ulStack.length - 1].level >= level)
                ulStack.pop();
            ulStack[ulStack.length - 1].children.push(item);
            ulStack.push(item);
        }

        return tocTree;
    };
    const tocTree = generateTOC(mdContent);
    return (
        <div className="card-widget card-aside card-toc">
            <div className="card-headline">
                <Icon icon="fa6-solid:align-left" />
                <span className="card-title">目录</span>
            </div>
            <div className="card-body">
                <div className="toc-content"><TocBody toc={tocTree} /></div>
                <span className="toc-counter">0</span>
            </div>
            <TocUpdater tocTree={tocTree} />
        </div>
    );
}
