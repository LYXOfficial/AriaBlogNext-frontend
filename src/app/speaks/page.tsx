export const revalidate=1800;
import "styles/Pages.css";
import "styles/PostContent.css";
import { TwikooBaseComment } from "components/thirdpartyjs/Twikoo";
import { PageRightSide } from "components/RightSide";
import { Speaks } from "components/Speaks";

export default function Page(){
    return (<>
      <style>{`#navbar{position:fixed}`}</style>
      <div id="main-container" className="page">
          <div id="article-container" className="page">
            <div id="post-maincontent">
              <h1>哔哔</h1>
              <Speaks/>
            </div>
            <hr/>
            <TwikooBaseComment/>
          </div>
          <PageRightSide/>
      </div>
    </>);
}