import Posts from "components/PostCard";
import { HomeASides } from "components/ASides";
import HomeSpeaks from "@/components/HomeSpeaks";
import { HomeRightSide } from "@/components/RightSide";
import { siteConfigs } from "@/config";
import { BB } from "@/interfaces/bb";
import HomeBanner from "@/components/HomeBanner";

export default async function Page() {
  const res = await fetch(
    `${siteConfigs.backEndUrl}/get/speaks/speaks?endl=10`,
    { next: { revalidate: 7200, tags: ["speaks"] } },
  );
  let speaks: BB[];
  if (res.ok) {
    speaks = (await res.json()).data;
  } else speaks = [];
  return (
    <div data-home-restoring style={{ visibility: "hidden" }}>
      <HomeBanner>
        <HomeSpeaks speaksContent={speaks} variant="banner" />
      </HomeBanner>
      <div id="main-container">
        <Posts page={1} />
        <HomeASides />
        <HomeRightSide />
      </div>
    </div>
  );
}
