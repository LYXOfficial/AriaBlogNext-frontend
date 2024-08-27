import CardInfo from "src/components/asides/CardInfo"
import CardAnnouncement from "src/components/asides/CardAnnouncement"
import CardLatestComments from "src/components/asides/CardLatestComments"
import CardArchives from "src/components/asides/CardArchives"
import { Icon } from '@iconify/react';
import CardWebInfo from "src/components/asides/CardWebInfo";
import { siteInfos } from "public/config"
import { webInfo } from "src/interfaces/siteinfo";
import { latestCommentListItem,archiveListItem } from "src/interfaces/asidelistitem";

const webInfos:webInfo={
    postCount: 6,
    categoryCount: 10,
    tagCount: 10,
    runDays: 114514,
    wordCount: 114514,
    visitorCount: 2473,
    viewCount: 22692,
    lastUpdateTime: 11451419,
    commentCount: 1657,
}

const latestComments:latestCommentListItem[]=[
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
const archivesInfo:archiveListItem[]=[
    {
        month:7,
        year:2024,
        count:1
    },
    {
        month:7,
        year:2024,
        count:1
    },
    {
        month:5,
        year:2024,
        count:4
    },
    {
        month:3,
        year:2023,
        count:5
    },
]
export default function ASides() {
    return (
        <div id="aside-container">
            <CardInfo 
                webInfos={webInfos}
                siteInfos={siteInfos}
            />
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardLatestComments comments={latestComments}/>
                <CardArchives items={archivesInfo}/>
                <CardWebInfo
                    webInfos={webInfos}
                />
            </div>
        </div>
    );
}