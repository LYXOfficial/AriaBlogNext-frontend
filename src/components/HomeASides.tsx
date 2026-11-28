import CardInfo from "components/asides/CardInfo";
import CardAnnouncement from "components/asides/CardAnnouncement";
import CardLatestComments from "components/asides/CardLatestComments";
import CardArchives from "components/asides/CardArchives";
import CardWebInfo from "components/asides/CardWebInfo";
import CardLoveU from "components/asides/CardLoveU";
import HomeAsidePanels from "components/asides/HomeAsidePanels";

export default function HomeASides() {
  return (
    <div id="aside-container">
      <CardInfo />
      <CardLoveU />
      <CardAnnouncement content={<>欢迎光临Ariaの博客QwQ~</>} />
      <HomeAsidePanels>
        <CardLatestComments />
        <CardArchives />
        <CardWebInfo />
      </HomeAsidePanels>
    </div>
  );
}
