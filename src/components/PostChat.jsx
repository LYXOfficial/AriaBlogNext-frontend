"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function PostChat(){
    const router=useRouter();
    // useEffect(()=>{
    //     const postChatDOM=(document.getElementById("chatIframe") as any).contentWindow.document;
    //     const style=postChatDOM.createElement("style");
    //     style.innerText=`
    //         :root{
    //             --heo-theme:var(--aria-theme)!important;
    //         }`
    // },[]);
    useEffect(()=>{
        postChat_load(),tianliGPT(true);
    },[router.events]);
    return <>
        <link rel="stylesheet" href="https://ai.tianli0.top/static/public/postChatUser_summary.min.css"/>
        <script
            dangerouslySetInnerHTML={{__html:`
            let tianliGPT_postSelector='#article-container>#post-maincontent';
            let tianliGPT_recommendation=true;
            let tianliGPT_Title='这是文章摘要！QwQ';
            let tianliGPT_postURL="*/posts/*";
            var postChatConfig={
                backgroundColor: "#ed709b",
                bottom: "16px",
                left: "16px",
                fill: "#FFFFFF",
                width: "44px",
                frameWidth: "375px",
                frameHeight: "600px",
                defaultInput: true,
                upLoadWeb: true,
                showInviteLink: true
            };`
        }}/>
        <script async data-postChat_key="b2697bd81e3904826ee9c180db306e61b2691c" 
            src="https://ai.tianli0.top/static/public/postChatUser_summary.min.js"/>
    </>
}