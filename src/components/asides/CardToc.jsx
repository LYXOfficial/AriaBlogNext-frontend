//GPT万岁！！！ QwQ

import React from 'react';
import "styles/ASide/global.css";
import "styles/ASide/Toc.css";
import TocUpdater from "components/thirdpartyjs/TocUpdater";
import { Icon } from '@iconify/react';
import { JSDOM } from "jsdom";
import { cache } from "react";

export default function CardToc({ htmlContent }){
    const generateTOC = cache((html) => {
        const { document } = new JSDOM(html).window;
        const headers = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const tocTree = [];

        const createListItem = (header) => {
            const level = parseInt(header.tagName.substring(1));
            const id = header.id || header.textContent.replace(/\s+/g, '-');
            header.id = id;
            return {
                text: header.textContent,
                href: id,
                level,
                children: []
            };
        };

        let ulStack = [{ level: 0, children: tocTree }]; // 修改堆栈初始结构
        headers.forEach(header => {
            const item = createListItem(header);
            const level = item.level;

            // 如果当前级别比堆栈顶部的级别大，意味着需要进入一个新的嵌套
            while (ulStack[ulStack.length - 1].level >= level) {
                ulStack.pop();
            }

            ulStack[ulStack.length - 1].children.push(item); // 将新项添加到当前层级的子元素
            ulStack.push(item); // 将新项添加到堆栈中，作为新层级的起点
        });

        return tocTree;
    });

    const renderTOC = cache((toc) => {
        if (!toc || toc.length === 0) return '';
        return toc.map((item) => (
            `<li class="toc-child">
                ${item.href ? `<a class="toc-link" id="toc-${item.href}" onClick="document.documentElement.scroll({top:document.querySelector('#${item.href}').offsetTop-70,behavior:'smooth'});">${item.text}</a>` : ''}
                ${item.children && item.children.length > 0 ? `<ul class="toc-children">${renderTOC(item.children)}</ul>` : ''}
            </li>`
        )).join('');
    });

    const tocTree=generateTOC(htmlContent);

    return (
        <div className="card-widget card-aside card-toc">
            <div className="card-headline">
                <Icon icon="fa6-solid:align-left"/>
                <span className="card-title">目录</span>
            </div>
            <div className="card-body">
                <div className="toc-content" dangerouslySetInnerHTML={{__html:renderTOC(tocTree)}}></div>
                <span className="toc-counter">0</span>
            </div>
            <TocUpdater tocTree={tocTree}/>
        </div>
    );
}
