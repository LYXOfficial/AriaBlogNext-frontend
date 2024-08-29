import Posts from 'src/components/PostCard';
import { HomeASides } from 'src/components/ASides';
import { RightButtonsHome } from 'src/components/RightButtons';
import { siteConfigs } from 'public/config';

export default function homePage() {
  return (
    <div id="main-container">
      <Posts page={1}/>
      <HomeASides/>
      <RightButtonsHome/>
    </div>
  );
}