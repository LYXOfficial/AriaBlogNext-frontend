import CardInfo from "src/components/asides/CardInfo";
import CardAnnouncement from "src/components/asides/CardAnnouncement";
import CardLatestComments from "src/components/asides/CardLatestComments";
import CardArchives from "src/components/asides/CardArchives";
import CardWebInfo from "src/components/asides/CardWebInfo";
import CardNewestPosts from "src/components/asides/CardNewestPosts";
import CardToc from "src/components/asides/CardToc";
import CardRelatedPosts from "src/components/asides/CardRelatedPosts";

export function HomeASides() {
    return (
        <div id="aside-container">
            <CardInfo/>
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardLatestComments/>
                <CardArchives/>
                <CardWebInfo/>
            </div>
        </div>
    );
}
export async function PageASides({htmlContent,slug}:{htmlContent:string,slug:string}) {
    return (
        <div id="aside-container">
            <CardInfo/>
            <CardAnnouncement content={<>欢迎光临AriaのNext.js新博客QwQ~</>}/>
            <div className="aside-sticky-container">
                <CardToc htmlContent={htmlContent}/>
                <CardNewestPosts/>
                <CardRelatedPosts slug={slug}/>
            </div>
        </div>
    );
}