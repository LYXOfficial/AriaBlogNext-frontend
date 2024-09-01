"use client";
import "styles/Pages.css";
import "styles/PostContent.css";
// import 'wc-waterfall';
import { TwikooBaseComment } from "components/thirdpartyjs/Twikoo";
import { PageRightSide } from "components/RightSide";

export default function Speaks(){
    return (<>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
          <div id="article-container" className="page">
            <div id="post-maincontent">
              <h1>哔哔</h1>
            </div>
            <hr/>
            <TwikooBaseComment/>
          </div>
          <PageRightSide/>
      </div>
    </>);
}