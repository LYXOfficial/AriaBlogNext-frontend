import CardInfo from "src/components/asides/CardInfo";
import CardAnnouncement from "src/components/asides/CardAnnouncement";
import CardLatestComments from "src/components/asides/CardLatestComments";
import CardArchives from "src/components/asides/CardArchives";
import CardWebInfo from "src/components/asides/CardWebInfo";
import CardNewestPosts from "src/components/asides/CardNewestPosts";
import CardToc from "src/components/asides/CardToc";

import { siteConfigs } from "public/config"
import { webInfo } from "src/interfaces/siteinfo";
import { archiveListItem } from "src/interfaces/asidelistitem";
import { Post } from "src/interfaces/post"

const webInfos:webInfo={
    postCount: 6,
    categoryCount: 10,
    tagCount: 10,
    runDays: 114514,
    wordCount: 114514,
    lastUpdateTime: 11451419,
    commentCount: 1657,
}
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
const posts:Post[]=[
    {
        title:"Hello World",
        bannerImg:"https://bu.dusays.com/2024/07/02/668388069d6db.webp",
        plainContent:"噫吁嚱，危乎高哉！蜀道之难，难于上青天！蚕丛及鱼凫，开国何茫然！尔来四万八千岁，不与秦塞通人烟。西当太白有鸟道，可以横绝峨眉巅。地崩山摧壮士死，然后天梯石栈相钩连。上有六龙回日之高标，下有冲波逆折之回川。黄鹤之飞尚不得过，猿猱欲度愁攀援。青泥何盘盘，百步九折萦岩峦。扪参历井仰胁息，以手抚膺坐长叹。问君西游何时还？畏途巉岩不可攀。但见悲鸟号古木，雄飞雌从绕林间。又闻子规啼夜月，愁空山。蜀道之难，难于上青天，使人听此凋朱颜！连峰去天不盈尺，枯松倒挂倚绝壁。飞湍瀑流争喧豗，砯崖转石万壑雷。其险也如此，嗟尔远道之人胡为乎来哉！(也如此 一作：也若此)剑阁峥嵘而崔嵬，一夫当关，万夫莫开。所守或匪亲，化为狼与豺。朝避猛虎，夕避长蛇，磨牙吮血，杀人如麻。锦城虽云乐，不如早还家。蜀道之难，难于上青天，侧身西望长咨嗟！",
        slug:"hello-world",
        publishTime:0,
        lastUpdateTime:0,
        tags:["测试","world"],
        category:"hello",
        commentCount:0,
    },
    {
        title:"你好喵 这是测试QwQ",
        bannerImg:"https://npm.elemecdn.com/saiodgm-api@1.0.1/randomimg-my/18.webp",
        plainContent:"豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊采星驰。台隍枕夷夏之交，宾主尽东南之美。都督阎公之雅望，棨戟遥临；宇文新州之懿范，襜帷暂驻。十旬休假，胜友如云；千里逢迎，高朋满座。腾蛟起凤，孟学士之词宗；紫电青霜，王将军之武库。家君作宰，路出名区；童子何知，躬逢胜饯。",
        slug:"markdowntest",
        publishTime:1724571806,
        lastUpdateTime:1724561806,
        tags:["生活","代码","测试"],
        category:"hello",
        commentCount:114514,
    },
    {
        title:"Lorem ipsum dolor sit amet",
        bannerImg:"https://bu.dusays.com/2023/07/29/64c5221e7a165.jpg",
        plainContent:"This is my first post.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        slug:"hello-world",
        publishTime:1724571806,
        lastUpdateTime:0,
        tags:["hello","world"],
        category:"hello",
        commentCount:1919810,
    },
    {
        title:"Hello World",
        bannerImg:"https://bu.dusays.com/2024/07/02/668388069d6db.webp",
        plainContent:"噫吁嚱，危乎高哉！蜀道之难，难于上青天！蚕丛及鱼凫，开国何茫然！尔来四万八千岁，不与秦塞通人烟。西当太白有鸟道，可以横绝峨眉巅。地崩山摧壮士死，然后天梯石栈相钩连。上有六龙回日之高标，下有冲波逆折之回川。黄鹤之飞尚不得过，猿猱欲度愁攀援。青泥何盘盘，百步九折萦岩峦。扪参历井仰胁息，以手抚膺坐长叹。问君西游何时还？畏途巉岩不可攀。但见悲鸟号古木，雄飞雌从绕林间。又闻子规啼夜月，愁空山。蜀道之难，难于上青天，使人听此凋朱颜！连峰去天不盈尺，枯松倒挂倚绝壁。飞湍瀑流争喧豗，砯崖转石万壑雷。其险也如此，嗟尔远道之人胡为乎来哉！(也如此 一作：也若此)剑阁峥嵘而崔嵬，一夫当关，万夫莫开。所守或匪亲，化为狼与豺。朝避猛虎，夕避长蛇，磨牙吮血，杀人如麻。锦城虽云乐，不如早还家。蜀道之难，难于上青天，侧身西望长咨嗟！",
        slug:"hello-world",
        publishTime:0,
        lastUpdateTime:0,
        tags:["测试","world"],
        category:"hello",
        commentCount:0,
    },
    {
        title:"你好喵 这是测试QwQ",
        bannerImg:"https://npm.elemecdn.com/saiodgm-api@1.0.1/randomimg-my/18.webp",
        plainContent:"豫章故郡，洪都新府。星分翼轸，地接衡庐。襟三江而带五湖，控蛮荆而引瓯越。物华天宝，龙光射牛斗之墟；人杰地灵，徐孺下陈蕃之榻。雄州雾列，俊采星驰。台隍枕夷夏之交，宾主尽东南之美。都督阎公之雅望，棨戟遥临；宇文新州之懿范，襜帷暂驻。十旬休假，胜友如云；千里逢迎，高朋满座。腾蛟起凤，孟学士之词宗；紫电青霜，王将军之武库。家君作宰，路出名区；童子何知，躬逢胜饯。",
        slug:"hello-world",
        publishTime:1724271806,
        lastUpdateTime:1724561806,
        tags:["生活","代码","测试"],
        category:"hello",
        commentCount:114514,
    },
    {
        title:"Lorem ipsum dolor sit amet",
        bannerImg:"https://bu.dusays.com/2023/07/29/64c5221e7a165.jpg",
        plainContent:"This is my first post.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        slug:"hello-world",
        publishTime:1724571806,
        lastUpdateTime:0,
        tags:["hello","world"],
        category:"hello",
        commentCount:1919810,
    }
]
export function HomeASides() {
    return (
        <div id="aside-container">
            <CardInfo 
                webInfos={webInfos}
                siteConfigs={siteConfigs}
            />
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardLatestComments/>
                <CardArchives items={archivesInfo}/>
                <CardWebInfo
                    webInfos={webInfos}
                />
            </div>
        </div>
    );
}
export function PageASides({htmlContent}:{htmlContent:string}) {
    return (
        <div id="aside-container">
            <CardInfo 
                webInfos={webInfos}
                siteConfigs={siteConfigs}
            />
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardToc htmlContent={htmlContent}/>
                <CardNewestPosts posts={posts}/>
            </div>
        </div>
    );
}