import "styles/Pages.css";
import "styles/PostContent.css";
import FriendLinks from "components/FriendLinks";
import { HomeRightSide } from "components/RightSide";
import { siteConfigs } from "@/config";
import React from "react";

export const metadata = {
    title: "友链 | "+siteConfigs.title,
}

export default function Page(){
    return (
        <><style>{`#navbar{position:fixed}`}</style>
        <div id="main-container" className="page">
            <FriendLinks/>
            <HomeRightSide/>
        </div></>
    );
}