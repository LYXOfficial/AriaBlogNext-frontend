import Posts from "components/PostCard";
import HomeASides from "components/HomeASides";
import HomeSpeaks from "@/components/HomeSpeaks";
import { HomeRightSide } from "@/components/RightSide";
import { fetchSpeaks } from "@/utils/api";
import { BB } from "@/interfaces/bb";
import HomeBanner from "@/components/HomeBanner";
import { siteConfigs } from "@/config";

export default async function Page() {
  const res = await fetchSpeaks(10);
  const speaks: BB[] = res.ok
    ? (res.data ?? []).map(({ time, plainContent }) => ({
        time,
        plainContent,
        content: "",
      }))
    : [];
  const bannerImages = siteConfigs.homeBanner.images
    .map((image) => image.trim())
    .filter(Boolean);
  const initialBannerImage = bannerImages.length
    ? bannerImages[Math.floor(Math.random() * bannerImages.length)]
    : siteConfigs.falldownImg.trim() || null;
  return (
    <div data-home-restoring>
      <HomeBanner initialImage={initialBannerImage}>
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
