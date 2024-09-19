import "styles/Pages.css";
import "styles/PostContent.css";
import { HomeRightSide } from "@/components/RightSide";
import { TwikooBaseComment } from "@/components/thirdpartyjs/Twikoo";
import { siteConfigs } from "@/config";

export const metadata={
    title: `留言板 | ${siteConfigs.title}`,
}
export default function Page(){
    return <div className="page" id="main-container">
        <style>{`#navbar{position:fixed}`}</style>
        <div id="article-container" className="page flink">
            <div id="post-maincontent" className="page flink">
                <h1>留言板</h1>
                快来说说什么吧！
                <br/>
                <br/>
            </div>
            <TwikooBaseComment/>
        </div>
        <HomeRightSide/>
    </div>;
}