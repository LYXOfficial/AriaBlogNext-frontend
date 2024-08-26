import CardInfo from "./asides/CardInfo"
import CardAnnouncement from "./asides/CardAnnouncement"
import CardLatestComments from "./asides/CardLatestComments"
import CardArchives from "./asides/CardArchives"
import { Icon } from '@iconify/react';

const postCount=10;
const categoryCount=10;
const tagCount=10;
const socialLinkList=[
    {
        name:"Github",
        link:"https://github.com/LYXOfficial",
        icon:<Icon icon="fa6-brands:github" />
    },
    {
        name:"Email",
        link:"mailto:lyxx114@yaria.top",
        icon:<Icon icon="fa6-solid:envelope" />
    },
    {
        name:"QQ",
        link:"tencent://message/?uin=2192016328&Site=&Menu=yes",
        icon:<Icon icon="fa6-brands:qq" />
    },
    {
        name:"Bilibili",
        link:"https://space.bilibili.com/369280472",
        icon:<Icon icon="fa6-brands:bilibili" />
    },
    {
        name:"RSS",
        link:"/atom.xml",
        icon:<Icon icon="fa6-solid:rss" />
    }
]
const latestComments=[
    {
        user:"test",
        avatar:"https://weavatar.com/avatar/dkfhdsikshfrief",
        content:"test",
        time:0,
        link:"/test"
    },
    {
        user:"test",
        avatar:"https://weavatar.com/avatar/dkfhdsikshfrief",
        content:"test",
        time:0,
        link:"/test"
    },
    {
        user:"test",
        avatar:"https://weavatar.com/avatar/dkfhdsikshfrief",
        content:"test",
        time:0,
        link:"/test"
    },
    {
        user:"test",
        avatar:"https://weavatar.com/avatar/dkfhdsikshfrief",
        content:"test",
        time:0,
        link:"/test"
    },
    {
        user:"test",
        avatar:"https://weavatar.com/avatar/dkfhdsikshfrief",
        content:"test",
        time:0,
        link:"/test"
    }
]
const archivesInfo=[
    {
        date:"七月 2024",
        link:"/archives/2024/07",
        count:1
    },
    {
        date:"六月 2024",
        link:"/archives/2024/06",
        count:1
    },
    {
        date:"五月 2024",
        link:"/archives/2024/05",
        count:4
    },
    {
        date:"三月 2023",
        link:"/archives/2023/03",
        count:5
    },
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
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardLatestComments comments={latestComments}/>
                <CardArchives items={archivesInfo}/>
            </div>
        </div>
    );
}