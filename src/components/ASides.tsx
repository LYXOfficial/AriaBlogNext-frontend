import CardInfo from "./asides/CardInfo.tsx"
import * as FaIcons from '@fortawesome/free-solid-svg-icons';
import FaIcon from './fa16';
import { Icon } from '@iconify/react';
const postCount=10;
const categoryCount=10;
const tagCount=10;
const socialLinkList=[
    {
        name:"Github",
        link:"https://github.com/LYXOfficial",
        icon:<Icon icon="octicon:mark-github-16" />
    },
    {
        name:"Email",
        link:"mailto:lyxx114@yaria.top",
        icon:<Icon icon="octicon:mail-16" />
    },
    {
        name:"QQ",
        link:"tencent://message/?uin=2192016328&Site=&Menu=yes",
        icon:<Icon icon="ant-design:qq-outlined" />
    },
    {
        name:"Bilibili",
        link:"https://space.bilibili.com/369280472",
        icon:<Icon icon="ri:bilibili-fill" />
    },
    {
        name:"RSS",
        link:"/atom.xml",
        icon:<Icon icon="mdi:rss" />
    }
]
export default function ASides() {
    return (
        <div className="aside-container">
            <CardInfo 
                author="Ariasaka" 
                avatar="https://bu.dusays.com/2024/08/25/66caf920c5a28.png"
                postCount={postCount}
                categoryCount={categoryCount}
                tagCount={tagCount}
                socialLinks={socialLinkList}
            />
        </div>
    );
}