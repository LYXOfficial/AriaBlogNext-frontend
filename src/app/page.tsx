import Posts from 'components/PostCard';
import { HomeASides } from 'components/ASides';
import { RightButtonsHome } from 'components/RightButtons';

export default function Page() {
  return (
    <div id="main-container">
      <Posts page={1}/>
      <HomeASides/>
      <RightButtonsHome/>
    </div>
  );
}