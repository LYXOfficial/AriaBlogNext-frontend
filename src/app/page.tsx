import Posts from 'src/components/PostCard';
import { HomeASides } from 'src/components/ASides';
import { RightButtonsHome } from 'src/components/RightButtons';

export default function homePage() {
  return (
    <div id="main-container">
      <Posts/>
      <HomeASides/>
      <RightButtonsHome/>
    </div>
  );
}