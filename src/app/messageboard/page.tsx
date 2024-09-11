import "styles/Pages.css";
import "styles/PostContent.css";
import { HomeRightSide } from "@/components/RightSide";
import { TwikooBaseComment } from "@/components/thirdpartyjs/Twikoo";

export default function Page(){
    return <div className="page" id="main-container">
        <style>{`#navbar{position:fixed}`}</style>
        <div id="article-container" className="page flink">
            <div id="post-maincontent" className="page flink">
                <h1>留言板</h1>
                <br/>
                <br/>
            </div>
            <TwikooBaseComment/>
        </div>
        <HomeRightSide/>
    </div>;
}