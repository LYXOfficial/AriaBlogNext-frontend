import "styles/Pages.css";
import "styles/PostContent.css";
import FriendLinks from "components/FriendLinks";
import { HomeRightSide } from "components/RightSide";
import { siteConfigs } from "@/config";
import React from "react";

import HLJSNum from "components/thirdpartyjs/HLJSNum";
import MDRenderer from "@/utils/mdrender";

export const metadata = {
    title: "友链 | " + siteConfigs.title,
}

export default async function Page() {
    return (
        <><style>{`#navbar{position:fixed}`}</style>
            <div id="main-container" className="page">
                <div id="article-container" className="page flink">
                    <div id="post-maincontent" className="page flink">
                        <h1>友情链接</h1>
                        <FriendLinks />
                        <div dangerouslySetInnerHTML={{
                            __html: await MDRenderer(
                                `# 我的信息
## Butterfly
\`\`\`YAML
- name: Ariasakaの小窝
link: https://blog.yaria.top
avatar: https://bu.dusays.com/2024/12/05/67517bcf104da.png
descr: 人有悲欢离合 月有阴晴圆缺
siteshot: https://bu.dusays.com/2024/09/19/66ec130ad1de0.png
theme_color: '#ed709b'
\`\`\`
## HTML
\`\`\`HTML
<a href="https://blog.yaria.top"><img src="https://bu.dusays.com/2024/12/05/67517bcf104da.png" alt="avatar">Ariasakaの小窝</a>
\`\`\`
# 如何申请友链？
咕咕咕。。。这样的话可以去留言板找我哦喵～`)
                        }}></div>
                        <HLJSNum />
                    </div>
                </div>
                <HomeRightSide />
            </div></>
    );
}