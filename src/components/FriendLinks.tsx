import "styles/FriendLinks.css";
import { FriendLinkGroup } from "interfaces/friendlink";
import HLJSNum from "components/thirdpartyjs/HLJSNum";
import CodeCopier from "components/thirdpartyjs/CodeCopier";
import { siteConfigs } from "@/config";
import Lazyload from "./thirdpartyjs/Lazyload";
import MDRenderer from "@/utils/mdrender";
import React from "react";
import { FriendLinkItem } from "./FriendLinkItem";

export function FriendLinkGroupItem({group}:{group:FriendLinkGroup}) {
    return (<div className="flink-group">
        <h2>{group.name}</h2>
        <span>{group.description}</span>
        <div className="flink-group-item">
            {group.links.map((link)=><FriendLinkItem key={link.url} link={link}/>)}
        </div>
    </div>);
}

export default async function FriendLinks() {
    let flinks:FriendLinkGroup[]=[];
    const res=await fetch(`${siteConfigs.backEndUrl}/get/flink/flinks`,{next:{revalidate:7200,tags:["flinks"]}});
    if(res.ok){
        flinks=(await res.json()).data;
    }
    return (
        <div id="article-container" className="page flink">
            <div id="post-maincontent" className="page flink">
                <h1>友情链接</h1>
                <div id="flinks">
                    {flinks.map((group)=><FriendLinkGroupItem key={group.name} group={group}/>)}
                </div>
                <div dangerouslySetInnerHTML={{__html:await MDRenderer(
`# 我的信息
## Butterfly
\`\`\`YAML
- name: Ariasakaの小窝
  link: https://blog.yaria.top
  avatar: https://weavatar.com/avatar/ae64fbbd18c13144d3e48ed089b5d07359ff071d6310d0c376d53ac8a213f6fc
  descr: 人有悲欢离合 月有阴晴圆缺
  siteshot: https://bu.dusays.com/2024/09/19/66ec130ad1de0.png
  theme_color: '#ed709b'
\`\`\`
## HTML
\`\`\`HTML
<a href="https://blog.yaria.top"><img src="https://weavatar.com/avatar/ae64fbbd18c13144d3e48ed089b5d07359ff071d6310d0c376d53ac8a213f6fc" alt="avatar">Ariasakaの小窝</a>
\`\`\`
# 如何申请友链？
咕咕咕。。。`)}}></div>
                <HLJSNum/>
                <CodeCopier/>
                <Lazyload/>
            </div>
        </div>
    );
}