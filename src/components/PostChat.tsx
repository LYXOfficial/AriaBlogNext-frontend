"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

declare const postChat_load: () => void;
export default function PostChat() {
  const [loaded, setLoaded] = useState(0);
  const pathname = usePathname();
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://ai.tianli0.top/static/public/postChatUser_summary.min.js";
    script.async = true;
    script.setAttribute(
      "data-postChat_key",
      "b2697bd81e3904826ee9c180db306e61b2691c",
    );
    script.onload = () => {
      setLoaded(1);
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    if (loaded == 1) {
      postChat_load();
      (window as any).tianliGPT.checkURLAndRun();
      setLoaded(2);
    }
    (window as any).history.onpushstate = null;
  }, [loaded]);
  useEffect(() => {
    if (loaded) (window as any).tianliGPT.checkURLAndRun();
  }, [pathname]);
  return (
    <>
      <link
        rel="stylesheet"
        href="https://ai.tianli0.top/static/public/postChatUser_summary.min.css"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let tianliGPT_postSelector='#article-container:not(#article-container.page)>#post-maincontent';
            let tianliGPT_recommendation=true;
            let tianliGPT_Title='这是文章摘要！QwQ';
            let tianliGPT_postURL="*/posts/*";
            let tianliGPT_key="b2697bd81e3904826ee9c180db306e61b2691c";
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
            };`,
        }}
      />
    </>
  );
}
