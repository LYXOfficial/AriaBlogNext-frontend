//GPT万岁！！！ QwQ

import React, { ReactElement } from 'react';
import "styles/ASide/global.css";
import "styles/ASide/Toc.css";
import TocUpdater from "components/thirdpartyjs/TocUpdater";
import { Icon } from '@iconify/react';
import { JSDOM } from "jsdom";
import { cache } from "react";
interface TOCItem {
    text:string;
    href:string;
    level:number;
    children:TOCItem[];
}
interface CardTocProps {
    htmlContent:string;
}
export default function CardToc({ htmlContent }:CardTocProps){
    const generateTOC=cache((html:string):TOCItem[]=>{
        const { document }=new JSDOM(html).window;
        const headers=Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6'));
        const tocTree:TOCItem[]=[];
        const createListItem=(header:Element):TOCItem=>{
            const level=parseInt(header.tagName.substring(1));
            const id=header.id||header.textContent?.replace(/\s+/g,'-')||'';
            header.id=id;
            return {
                text:header.textContent||'',
                href:id,
                level,
                children:[]
            };
        };
        let ulStack:TOCItem[]=[{level:0, children:tocTree} as TOCItem];
        headers.forEach(header=>{
            const item=createListItem(header as Element);
            const level=item.level;
            while (ulStack[ulStack.length-1].level>=level){
                ulStack.pop();
            }
            if(ulStack.length>0){
                ulStack[ulStack.length-1].children.push(item);
            } 
            else{
                tocTree.push(item);
            }
            ulStack.push(item);
        });
        return tocTree;
    });
    const renderTOC=cache((toc:TOCItem[]):ReactElement[]=>{
        return (
            toc.map(item=>
                <li className="toc-child" key={item.href}>
                    {item.href?<a className="toc-link" id={`toc-${item.href}`} href={`#${item.href}`}>{item.text}</a>:<></>}
                    {item.children&&item.children.length>0?<ul className="toc-children">{renderTOC(item.children)}</ul>:<></>}
                </li>
            )
        );
    });
    const tocTree=generateTOC(htmlContent);
    return (
        <div className="card-widget card-aside card-toc">
            <div className="card-headline">
                <Icon icon="fa6-solid:align-left"/>
                <span className="card-title">目录</span>
            </div>
            <div className="card-body">
                <div className="toc-content">{renderTOC(tocTree)}</div>
                <span className="toc-counter">0</span>
            </div>
            <TocUpdater tocTree={tocTree}/>
        </div>
    );
}
