export const revalidate=7200;

import "styles/Pages.css";
import "styles/PostContent.css";

import { HomeRightSide } from "@/components/RightSide";
export default function Page(){
    return <div className="page" id="main-container">
        <style>{`#navbar{position:fixed}`}</style>
        <div id="article-container" className="page archives">
            <div id="post-maincontent" className="page archives">
                <h1>归档</h1>
                
            </div>
        </div>
        <HomeRightSide/>
    </div>;
}