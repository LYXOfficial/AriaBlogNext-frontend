import React from 'react';
import "src/styles/ASide/global.css";
import "src/styles/ASide/Toc.css";
import{ Icon } from '@iconify/react';
import{ JSDOM } from "jsdom";
import { cache } from "react";

export default function CardToc({ htmlContent }){
    const generateTOC=cache((html)=>{
        const{ document }=new JSDOM(html).window;
        const headers=Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const tocTree=[];
        const createListItem=(header)=>{
            const level=parseInt(header.tagName.substring(1));
            const id=header.id||header.textContent.replace(/\s+/g, '-');
            header.id=id;
            return{
                text: header.textContent,
                href: `#${id}`,
                level,
                children: []
            };
        };
        let ulStack=[tocTree];
        let lastLevel=0;
        headers.forEach(header=>{
            const item=createListItem(header);
            const level=item.level;
            while (ulStack.length > level)
                ulStack.pop();
            if (level > lastLevel){
                const newUl=[];
                ulStack[ulStack.length - 1].push({
                    text: null,
                    href: null,
                    level,
                    children: newUl
                });
                ulStack.push(newUl);
            }
            ulStack[ulStack.length - 1].push(item);
            lastLevel=level;
        });
        return tocTree;
    });

    const renderTOC=cache((toc)=>{
        if (!toc||toc.length===0) return null;
        return (
            <ul className="toc-children">
                {toc.map((item, index)=>(
                    <li key={index} className="toc-child">
                    {item.href?(
                            <a className="toc-link" href={item.href}>{item.text}</a>
                        ) : (
                            item.text
                        )}
                    {item.children&&renderTOC(item.children)}
                    </li>
                ))}
            </ul>
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
            </div>
        </div>
    );
}
