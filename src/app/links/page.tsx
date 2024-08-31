import "styles/Pages.css";
import "styles/PostContent.css";
import FriendLinks from "components/FriendLinks";
import { RightButtonsPages } from "components/RightButtons";
import { siteConfigs } from "@/config";

export const metadata = {
    title: "友链 | "+siteConfigs.title,
}

export default function Page(){
    return (
        <div id="main-container" className="page">
            <FriendLinks/>
            <RightButtonsPages/>
        </div>
    );
}